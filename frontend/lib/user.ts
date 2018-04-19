import { contractAddress, abiArray } from "./smartcontract";
import { sha256 } from "js-sha256";
import * as LZString from "lz-string";
import * as InputDataDecoder from "ethereum-input-data-decoder";
import * as abiDecoder from "abi-decoder";
import { off } from "codemirror";

const decoder = new InputDataDecoder(abiArray);
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
   * @param message the string that you want to post.
   */
  public async postFeed(message: string) {
    console.log("Post Feed: \n|" + message + "|");
    // user.contractInstance.setMetaDataJSONStringMap("{a:13}", function(...args){ console.log(args) })
    // user.contractInstance.getMetaDataJSONStringValue(user.coinbase, function(...args){ console.log(args) })
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
    const currentFeedBlockNumber = currentFeedInfo[0].toNumber();
    const currentFeedTimestamp = currentFeedInfo[1].toNumber();
    const currentFeedHash = currentFeedInfo[2].toNumber();
    const currentTimestamp = Date.now();
    const compressedMessage = LZString.compressToUTF16(message);
    const messageHash = sha256(
      this.coinbase + currentTimestamp.toString() + message
    );

    console.log("currentFeedInfo: ", currentFeedInfo);
    console.log("currentFeedBlockNumber: ", currentFeedBlockNumber);
    console.log("currentFeedTimestmap: " + currentFeedTimestamp);
    console.log("currentFeedHash: " + currentFeedHash);
    console.log("messageHash: " + messageHash);
    console.log("compressedMessage: " + compressedMessage);

    const previousFeedTransactionInfo = await this.getNewestFeedTransactionFromUser(
      this.coinbase
    );
    console.log("previousFeedTransactionInfo", previousFeedTransactionInfo);
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
        [], // tags
        [], // previousTagTransactionByTimeHashes
        [], // previousTagTransactionByTrendHashes
        (error, transactionHash) => {
          if (error) {
            return reject(error);
          } else {
            console.log("Feed Posted: " + transactionHash);
            return resolve(transactionHash);
          }
        }
      );
    });
  }

  public async getTransactionInfo(
    userAddress: string,
    blockNumber: number,
    timestamp: number,
    messageHash: string,
    transactionHash?: string
  ) {
    console.log(
      "@getTransactionInfo: ",
      userAddress,
      blockNumber,
      timestamp,
      messageHash,
      transactionHash
    );
    if (timestamp === 0) {
      return null;
    }

    const validateTransaction = (transaction: any) => {
      if (userAddress !== transaction.from) {
        return null;
      }
      const input = transaction.input;
      const decode = abiDecoder.decodeMethod(input);
      if (Object.keys(decode).length === 0) {
        return null;
      } else {
        const messageHash2 = this.web3.toHex(
          this.web3.toBigNumber(decode.params[3].value)
        );
        if (messageHash2 !== messageHash) {
          return null; // hashes don't match
        }
        return Object.assign(transaction, { decode });
      }
    };

    if (transactionHash) {
      try {
        const transaction = await new Promise((resolve, reject) => {
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
                console.log('transactionHash is valid: ', validatedResult)
                return resolve(validatedResult);
              }
            }
          );
        });
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

    console.log("transactionCount: " + transactionCount);

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
        console.log("transactionHash is invalid: ", validatedResult);
        return validatedResult;
      }
    }
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
    const currentFeedTimestamp = currentFeedInfo[1].toNumber();
    const currentFeedHash = this.web3.toHex(currentFeedInfo[2]);
    return await this.getTransactionInfo(
      userAddress,
      currentFeedBlockNumber,
      currentFeedTimestamp,
      currentFeedHash
    );
  }

  /**
   *
   * @param userAddress
   * @param maxNumber If == -1, then return all the feeds
   */
  public async getFeedsFromUser(
    userAddress: string,
    maxNumber: number = -1,
    cb: (done: boolean, offset?: number, transactionInfo?: any) => void
  ) {
    let currentFeedInfo = await new Promise((resolve, reject) => {
      this.contractInstance.getCurrentFeedInfo(userAddress, (error, result) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(result);
        }
      });
    });

    let blockNumber = currentFeedInfo[0].toNumber();
    let timestamp = currentFeedInfo[1].toNumber();
    let messageHash = this.web3.toHex(currentFeedInfo[2]);
    let transactionHash = null;
    let offset = 0;
    while (offset > maxNumber) {
      console.log("@@ offset: " + offset);
      const transactionInfo = await this.getTransactionInfo(
        userAddress,
        blockNumber,
        timestamp,
        messageHash,
        transactionHash
      );
      if (!transactionInfo) {
        return cb(true); // done.
      } else {
        cb(false, offset, transactionInfo);
        console.log('Message: ', LZString.decompressFromUTF16(transactionInfo.decode.params[2].value))
        transactionHash = transactionInfo.decode.params[4].value;
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
        console.log("receipt: ", receipt);
        const logs = receipt["logs"] || [];
        if (!logs.length) {
          return cb(true);
        }
        console.log(abiDecoder.decodeLogs(logs));
        const decodedLogs = abiDecoder.decodeLogs(logs);
        const PostFeedEvent = decodedLogs.filter(
          x => x.name === "PostFeedEvent"
        )[0];
        if (!PostFeedEvent) {
          return cb(true); // done
        } else {
          blockNumber = PostFeedEvent.events[5].value[0].toNumber();
          timestamp = PostFeedEvent.events[5].value[1].toNumber();
          messageHash = this.web3.toHex(PostFeedEvent.events[5].value[2]);
          offset += 1;
          continue;
        }
      }
    }
  }
}
