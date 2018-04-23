import { contractAddress, abiArray } from "./smartcontract";
import { sha256 } from "js-sha256";
import * as LZString from "lz-string";
import * as abiDecoder from "abi-decoder";
import { off } from "codemirror";
import { compressString, hexEncode, decompressString } from "./utility";
import { TransactionInfo } from "./transaction";
import * as Identicon from "identicon.js";
import Web3 from "web3";
import { Contract, Transaction } from "web3/types";
import { BigNumber } from "bignumber.js";

abiDecoder.addABI(abiArray);

export interface UserInfo {
  /**
   * User name.
   */
  name: string;
  /**
   * User profile avatar image url.
   */
  avatar: string;
  /**
   * User profile cover image url.
   */
  cover: string;
  /**
   * User bio.
   */
  bio: string;

  /**
   * user address
   */
  address: string;
}

export class User {
  public web3: Web3;
  /**
   * The address of user wallet.
   */
  public coinbase: string;
  /**
   * Current connected network id
   */
  public networkId: number;

  /**
   * Current connected network name
   */
  private networkName: string;
  /**
   * Smart contract instance
   */
  public contractInstance: Contract;

  /**
   * version that used to specify the string compression strategy, etc...
   */
  private version = 0;

  /**
   * Constructor
   * @param web3
   */
  constructor(web3: Web3) {
    this.web3 = web3;
  }

  /**
   * This function should be called immediately after creating User.
   */
  public async initialize() {
    this.coinbase = await this.web3.eth.getCoinbase();
    this.networkId = await this.web3.eth.net.getId();
    this.networkName = await this.getNetworkName(this.networkId);
    this.contractInstance = new this.web3.eth.Contract(
      abiArray,
      contractAddress
    );
  }

  /**
   * Get the name of the network
   */
  public getNetworkName(networkId: number) {
    switch (networkId) {
      case 1:
        return "mainnet";
      case 2:
        return "morden test network";
      case 3:
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
    const compressedTag = compressString(tag.toLowerCase());
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
        // console.log(i + " tag: " + validatedTag);
      }
    }

    let currentFeedInfo = await this.contractInstance.methods
      .getCurrentFeedInfo(this.coinbase)
      .call();
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
      : "0x0000000000000000000000000000000000000000000000000000000000000000";
    // => 0x40091f65172c76c5daa276c66cbd1f175fda12d9bd20b842007feed78757a089

    return await new Promise((resolve, reject) => {
      this.contractInstance.methods
        .post(
          0, // version
          currentTimestamp, // timestamp
          compressedMessage, // message
          "0x" + messageHash, // messageHash
          previousFeedTransactionHash, // previousFeedTransactionHash
          tags // tags
        )
        .send({ from: this.coinbase })
        .on("error", error => {
          return reject(error);
        })
        .on("transactionHash", hash => {
          console.log("post feed txHash: ", hash);
          return resolve(hash);
        })
        .on("receipt", receipt => {
          console.log("post feed receipt", receipt);
        });
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
    // console.log("userAddress: ", userAddress);
    // console.log("blockNumber: ", blockNumber);
    // console.log("messageHash: ", messageHash);
    // console.log("transactionHash: ", transactionHash);
    const validateTransaction = (transaction: Transaction) => {
      // It is weird that this.coinbase is all lowercase, but transaction.from is not.
      if (
        userAddress &&
        userAddress.toLowerCase() !== transaction.from.toLowerCase()
      ) {
        return null;
      }
      const input = transaction.input;
      const decodedInputData = abiDecoder.decodeMethod(input);
      if (!decodedInputData || Object.keys(decodedInputData).length === 0) {
        return null;
      } else {
        const messageHash2 = new BigNumber(
          decodedInputData.params[3].value
        ).toString(16);
        if (messageHash2 !== messageHash) {
          return null; // hashes don't match
        }
        return Object.assign(transaction as object, {
          decodedInputData
        }) as TransactionInfo;
      }
    };

    if (transactionHash) {
      try {
        const transaction = await this.web3.eth.getTransaction(transactionHash);
        if (transaction.blockNumber === blockNumber) {
          const validatedResult = validateTransaction(transaction);
          if (validatedResult) {
            // console.log('transactionHash is valid: ', validatedResult)
            return validatedResult;
          }
        }
      } catch (error) {
        // transactionHash is wrong, then check blockNumber and messageHash
      }
    }

    const transactionCount = await this.web3.eth.getBlockTransactionCount(
      blockNumber
    );
    // console.log("transactionCount: " + transactionCount);

    for (let i = 0; i < transactionCount; i++) {
      const transaction = await this.web3.eth.getTransactionFromBlock(
        blockNumber,
        i
      );
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
    let currentFeedInfo = await this.contractInstance.methods
      .getCurrentFeedInfo(userAddress)
      .call();
    const currentFeedBlockNumber = parseInt(currentFeedInfo[0]);
    const currentFeedHash = new BigNumber(currentFeedInfo[1]).toString(16);
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
    const currentFeedInfo = await this.contractInstance.methods
      .getCurrentTagInfoByTime(tag)
      .call();
    console.log(currentFeedInfo);
    const currentFeedBlockNumber = parseInt(currentFeedInfo[0]);
    const currentFeedHash = new BigNumber(currentFeedInfo[1]).toString(16);
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
    const currentFeedInfo = await this.contractInstance.methods
      .getCurrentTagInfoByTrend(tag)
      .call();
    const currentFeedBlockNumber = parseInt(currentFeedInfo[0]);
    const currentFeedHash = this.web3.utils.toHex(currentFeedInfo[1]);
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
      const currentFeedInfo = await this.contractInstance.methods
        .getCurrentFeedInfo(userAddress)
        .call();
      blockNumber = parseInt(currentFeedInfo[0]);
      messageHash = new BigNumber(currentFeedInfo[1]).toString(16);
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
    const currentFeedInfo = await this.contractInstance.methods
      .getCurrentTagInfoByTime(tag)
      .call();
    blockNumber = parseInt(currentFeedInfo[0]);
    messageHash = new BigNumber(currentFeedInfo[1]).toString(16);
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
    const currentFeedInfo = await this.contractInstance.methods
      .getCurrentTagInfoByTrend(tag)
      .call();
    blockNumber = parseInt(currentFeedInfo[0]);
    messageHash = new BigNumber(currentFeedInfo[1]).toString(16);
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
        const receipt = await this.web3.eth.getTransactionReceipt(
          transactionInfo.hash
        );
        const logs = receipt["logs"] || [];
        if (!logs.length) {
          return cb(true);
        }
        // TODO: tags
        const decodedLogs = abiDecoder.decodeLogs(logs);
        const PostFeedEvent = decodedLogs.filter(
          x => x.name === "PostEvent"
        )[0];
        if (!PostFeedEvent) {
          return cb(true); // done
        } else {
          blockNumber = parseInt(PostFeedEvent.events[0].value[0]);
          messageHash = new BigNumber(
            PostFeedEvent.events[0].value[1]
          ).toString(16);
          offset += 1;
          continue;
        }
      }
    }
  }

  /**
   * Load user metadata
   * @param address
   */
  public async getUserInfo(address: string): Promise<UserInfo> {
    const userInfo =
      JSON.parse(
        decompressString(
          await this.contractInstance.methods
            .getMetaDataJSONStringValue(address)
            .call()
        )
      ) || ({} as UserInfo);

    if (!userInfo.avatar) {
      if (!address) {
        address = "0xinvalid_address";
      }
      userInfo.avatar =
        "data:image/png;base64," + new Identicon(address, 80).toString();
    }
    userInfo.name = userInfo.name || "Frog_" + address.slice(2, 6);
    userInfo.address = address;
    return userInfo;
  }

  public async setUserMetadata(userInfo: UserInfo) {
    let userInfoCopy = Object.assign({}, userInfo);
    delete userInfoCopy["address"]; // no need to save address.
    return new Promise((resolve, reject) => {
      this.contractInstance.methods
        .setMetaDataJSONStringValue(
          compressString(JSON.stringify(userInfoCopy))
        )
        .send({ from: this.coinbase })
        .on("error", error => {
          return reject(error);
        })
        .on("transactionHash", hash => {
          return resolve(hash);
        })
        .on("receipt", receipt => {
          console.log("finish setUserMetadata: ", receipt);
        });
    });
  }
}
