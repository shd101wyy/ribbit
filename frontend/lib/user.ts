import { contractAddress, abiArray } from "./smartcontract";
import { sha256 } from "js-sha256";
import * as LZString from "lz-string";
import * as abiDecoder from "abi-decoder";
import { off } from "codemirror";
import { compressString, hexEncode } from "./utility";
import { TransactionInfo } from "./transaction";
abiDecoder.addABI(abiArray);

export class User {
  public web3;
  /**
   * The address of user wallet.
   */
  public coinbase: string;
  /**
   * Current connected network
   */
  public network: string;
  /**
   * Smart contract instance
   */
  public contractInstance;

  /**
   * version that used to specify the string compression strategy, etc...
   */
  private version = 0;

  /**
   * Constructor
   * @param web3
   */
  constructor(web3) {
    this.web3 = web3;
    this.coinbase = this.web3.eth.coinbase;
    this.network = this.web3.version.network;
    this.initContractInstance();
  }

  private initContractInstance() {
    const contract = this.web3.eth.contract(abiArray);
    this.contractInstance = contract.at(contractAddress);
  }

  /**
   * Get the name of the network
   */
  public getNetworkName() {
    const network = this.web3.version.network;
    switch (network) {
      case "1":
        return "mainnet";
      case "2":
        return "morden test network";
      case "3":
        return "ropsten test network";
      default:
        return "unknown network";
    }
  }

  /**
   * Validate tag.
   * 1. Compress tag string.
   * 2. Convert it to hex string.
   * 2. Check if its size is bigger than bytes32, if so return empty string.
   * @param tag
   */
  private formatTag(tag: string): string {
    const compressedTag = compressString(tag);
    const hexString = hexEncode(compressedTag);
    if (hexString.length >= 64) {
      // greate than bytes32
      return "";
    } else {
      return "0x" + hexString;
    }
  }

  /**
   * throw error or return null if failed to post feed
   * @param message the string that you want to post.
   */
  public async postFeed(message: string, tags = []) {
    // Validate tags
    // TODO: change to Promise.all
    for (let i = 0; i < tags.length; i++) {
      const validatedTag = this.formatTag(tags[i]);
      if (!validatedTag.length) {
        throw new Error(
          "Invalid tag: " +
            tags[i] +
            "\nCompressed(" +
            validatedTag.length / 2 +
            "bytes): " +
            validatedTag
        );
      } else {
        tags[i] = validatedTag;
        console.log(i + " tag: " + validatedTag);
      }
    }

    let currentFeedInfo = await new Promise((resolve, reject) => {
      this.contractInstance.getCurrentFeedInfo(
        this.coinbase,
        (error, result) => {
          if (error) {
            return reject(error);
          } else {
            return resolve(result);
          }
        }
      );
    });

    const currentTimestamp = Date.now();
    const compressedMessage = compressString(message);
    const messageHash = sha256(
      this.coinbase + currentTimestamp.toString() + message
    );

    const previousFeedTransactionInfo = await this.getNewestFeedTransactionFromUser(
      this.coinbase
    );
    const previousFeedTransactionHash = previousFeedTransactionInfo
      ? previousFeedTransactionInfo.hash
      : 0;
    // => 0x40091f65172c76c5daa276c66cbd1f175fda12d9bd20b842007feed78757a089

    return await new Promise((resolve, reject) => {
      this.contractInstance.postFeed(
        0, // version
        currentTimestamp, // timestamp
        compressedMessage, // message
        "0x" + messageHash, // messageHash
        previousFeedTransactionHash, // previousFeedTransactionHash
        tags, // tags
        (error, transactionHash) => {
          if (error) {
            return reject(error);
          } else {
            return resolve(transactionHash);
          }
        }
      );
    });
  }

  /**
   * If transactionHash is provided, then get transactionInfo based on that trasactionHash,
   * then compare the data with blockNumber and messageHash.
   * If comparison failed, then try to get the transactionInfo based on the blockNumber and messageHash.
   * @param userAddress sender of this transaction. If `userAddress` is not provided, then it means you are querying other's transactionInfo.
   * @param blockNumber
   * @param messageHash
   * @param transactionHash
   */
  public async getTransactionInfo(
    userAddress: string = "",
    blockNumber: number,
    messageHash: string,
    transactionHash?: string
  ): Promise<TransactionInfo> {
    // console.log("userAddress: ", userAddress)
    // console.log("blockNumber: ", blockNumber)
    // console.log("messageHash: ", messageHash)
    // console.log("transactionHash: ", transactionHash)
    const validateTransaction = (transaction: any) => {
      if (userAddress && userAddress !== transaction.from) {
        return null;
      }
      const input = transaction.input;
      const decodedInputData = abiDecoder.decodeMethod(input);
      if (!decodedInputData || Object.keys(decodedInputData).length === 0) {
        return null;
      } else {
        const messageHash2 = this.web3.toHex(
          this.web3.toBigNumber(decodedInputData.params[3].value)
        );
        if (messageHash2 !== messageHash) {
          return null; // hashes don't match
        }
        return Object.assign(transaction, {
          decodedInputData
        }) as TransactionInfo;
      }
    };

    if (transactionHash) {
      try {
        const transaction = await new Promise<TransactionInfo>(
          (resolve, reject) => {
            this.web3.eth.getTransaction(
              transactionHash,
              (error, transaction) => {
                if (error || !transaction) {
                  return reject(error);
                }
                const transactionBlockNumber = transaction.blockNumber;
                if (transactionBlockNumber !== blockNumber) {
                  return reject(error);
                }
                const validatedResult = validateTransaction(transaction);
                if (validatedResult) {
                  // console.log('transactionHash is valid: ', validatedResult)
                  return resolve(validatedResult);
                }
              }
            );
          }
        );
        if (transaction) {
          return transaction;
        }
      } catch (error) {
        // transactionHash is wrong, then check blockNumber and messageHash
      }
    }

    const transactionCount = await new Promise((resolve, reject) => {
      this.web3.eth.getBlockTransactionCount(
        blockNumber,
        (error, transactionCount) => {
          if (error) {
            return reject(error);
          } else {
            return resolve(transactionCount);
          }
        }
      );
    });

    // console.log("transactionCount: " + transactionCount);

    for (let i = 0; i < transactionCount; i++) {
      const transaction = (await new Promise((resolve, reject) => {
        this.web3.eth.getTransactionFromBlock(
          blockNumber,
          i,
          (error, result) => {
            if (error) {
              return reject(error);
            } else {
              return resolve(result);
            }
          }
        );
      })) as any;
      const validatedResult = validateTransaction(transaction);
      if (validatedResult) {
        // console.log("transactionHash is invalid: ", validatedResult);
        return validatedResult;
      }
    }

    return null; // not found.
  }

  /**
   * Return null if no feed transaction is found.
   * Otherwise, return transaction info.
   * @param userAddress
   */
  public async getNewestFeedTransactionFromUser(userAddress: string) {
    let currentFeedInfo = await new Promise((resolve, reject) => {
      this.contractInstance.getCurrentFeedInfo(userAddress, (error, result) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(result);
        }
      });
    });
    const currentFeedBlockNumber = currentFeedInfo[0].toNumber();
    const currentFeedHash = this.web3.toHex(currentFeedInfo[1]);
    return await this.getTransactionInfo(
      userAddress,
      currentFeedBlockNumber,
      currentFeedHash,
      ""
    );
  }

  /**
   *
   * @param tag original string of tag.
   */
  public async getNewestFeedTransactionFromTagByTime(tag: string) {
    tag = this.formatTag(tag);
    let currentFeedInfo = await new Promise((resolve, reject) => {
      this.contractInstance.getCurrentTagInfoByTime(tag, (error, result) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(result);
        }
      });
    });
    const currentFeedBlockNumber = currentFeedInfo[0].toNumber();
    const currentFeedHash = this.web3.toHex(currentFeedInfo[1]);
    return await this.getTransactionInfo(
      "",
      currentFeedBlockNumber,
      currentFeedHash
    );
  }

  /**
   *
   * @param tag original string of tag.
   */
  public async getNewestFeedTransactionFromTagByTrend(tag: string) {
    tag = this.formatTag(tag);
    let currentFeedInfo = await new Promise((resolve, reject) => {
      this.contractInstance.getCurrentTagInfoByTrend(tag, (error, result) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(result);
        }
      });
    });
    const currentFeedBlockNumber = currentFeedInfo[0].toNumber();
    const currentFeedHash = this.web3.toHex(currentFeedInfo[1]);
    return await this.getTransactionInfo(
      "",
      currentFeedBlockNumber,
      currentFeedHash,
      ""
    );
  }

  /**
   *
   * @param userAddress
   * @param param1
   * @param cb
   */
  public async getFeedsFromUser(
    userAddress: string,
    {
      num = -1, // how many feeds to read?
      blockNumber = 0,
      messageHash = "",
      transactionHash = null
    },
    cb: (
      done: boolean,
      offset?: number,
      transactionInfo?: TransactionInfo
    ) => void
  ) {
    if (!blockNumber) {
      let currentFeedInfo = await new Promise((resolve, reject) => {
        this.contractInstance.getCurrentFeedInfo(
          userAddress,
          (error, result) => {
            if (error) {
              return reject(error);
            } else {
              return resolve(result);
            }
          }
        );
      });

      blockNumber = currentFeedInfo[0].toNumber();
      messageHash = this.web3.toHex(currentFeedInfo[1]);
      transactionHash = null;
    }
    return await this.getFeeds({
      userAddress,
      blockNumber,
      messageHash,
      num,
      transactionHash,
      cb
    });
  }

  public async getFeedsFromTagByTime(
    tag: string,
    {
      num = -1, // how many feeds to read?
      blockNumber = 0,
      messageHash = "",
      transactionHash = null
    },
    cb: (
      done: boolean,
      offset?: number,
      transactionInfo?: TransactionInfo
    ) => void
  ) {
    tag = this.formatTag(tag);
    let currentFeedInfo = await new Promise((resolve, reject) => {
      this.contractInstance.getCurrentTagInfoByTime(tag, (error, result) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(result);
        }
      });
    });
    blockNumber = currentFeedInfo[0].toNumber();
    messageHash = this.web3.toHex(currentFeedInfo[1]);
    return await this.getFeeds({
      userAddress: "",
      blockNumber,
      messageHash,
      num,
      transactionHash,
      cb
    });
  }

  public async getFeedsFromTagByTrend(
    tag: string,
    {
      num = -1, // how many feeds to read?
      blockNumber = 0,
      messageHash = "",
      transactionHash = null
    },
    cb: (
      done: boolean,
      offset?: number,
      transactionInfo?: TransactionInfo
    ) => void
  ) {
    tag = this.formatTag(tag);
    let currentFeedInfo = await new Promise((resolve, reject) => {
      this.contractInstance.getCurrentTagInfoByTrend(tag, (error, result) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(result);
        }
      });
    });
    blockNumber = currentFeedInfo[0].toNumber();
    messageHash = this.web3.toHex(currentFeedInfo[1]);
    return await this.getFeeds({
      userAddress: "",
      blockNumber,
      messageHash,
      num,
      transactionHash,
      cb
    });
  }

  /**
   * Generic way of gettings feeds.
   * @param param0
   */
  private async getFeeds({
    userAddress = "",
    blockNumber = 0,
    messageHash = "",
    num = -1,
    transactionHash = "",
    cb = (
      done: boolean,
      offset?: number,
      transactionInfo?: TransactionInfo
    ) => {}
  }) {
    let offset = 0;
    while (offset > num) {
      // console.log("@@ offset: " + offset);
      const transactionInfo = await this.getTransactionInfo(
        userAddress,
        blockNumber,
        messageHash,
        transactionHash
      );
      if (!transactionInfo) {
        return cb(true); // done.
      } else {
        cb(false, offset, transactionInfo);
        transactionHash = transactionInfo.decodedInputData.params[4].value;
        const receipt = await new Promise((resolve, reject) => {
          this.web3.eth.getTransactionReceipt(
            transactionInfo.hash,
            (error, result) => {
              if (error) {
                return reject(error);
              } else {
                return resolve(result);
              }
            }
          );
        });
        const logs = receipt["logs"] || [];
        if (!logs.length) {
          return cb(true);
        }
        // TODO: tags
        const decodedLogs = abiDecoder.decodeLogs(logs);
        const PostFeedEvent = decodedLogs.filter(
          x => x.name === "PostFeedEvent"
        )[0];
        if (!PostFeedEvent) {
          return cb(true); // done
        } else {
          blockNumber = PostFeedEvent.events[0].value[0].toNumber();
          messageHash = this.web3.toHex(PostFeedEvent.events[0].value[1]);
          offset += 1;
          continue;
        }
      }
    }
  }
}
