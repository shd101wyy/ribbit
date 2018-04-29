import { getContractAddress, abiArray } from "./smartcontract";
import { sha256 } from "js-sha256";
import * as LZString from "lz-string";
import * as abiDecoder from "abi-decoder";
import { off } from "codemirror";
import {
  compressString,
  hexEncode,
  decompressString,
  hexDecode
} from "./utility";
import {
  TransactionInfo,
  DecodedLogData,
  transformDecodedInputData,
  transformDecodedLogData
} from "./transaction";
import * as Identicon from "identicon.js";
import Web3 from "web3";
import { Contract, Transaction, Log } from "web3/types";
import { BigNumber } from "bignumber.js";
import * as IPFS from "ipfs";
let Buffer = window["Buffer"] || undefined;
if (typeof Buffer === "undefined") {
  // For browser compatibility
  Buffer = require("buffer/").Buffer;
  window["Buffer"] = Buffer;
}

import { StateInfo, FeedInfo } from "./feed";

abiDecoder.addABI(abiArray);

export function decodeMethod(input: string) {
  const decodedInputData = abiDecoder.decodeMethod(input);
  if (!decodedInputData) {
    return null;
  } else {
    return transformDecodedInputData(decodedInputData);
  }
}

export function decodeLogs(logs: Log[]) {
  const decodedLogData = abiDecoder.decodeLogs(logs);
  if (!decodedLogData) {
    return null;
  } else {
    return transformDecodedLogData(decodedLogData);
  }
}

export interface UserInfo {
  /**
   * User username
   */
  username: string;
  /**
   * User display name.
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

export class Ribbit {
  public web3: Web3;
  /**
   * The address of current account.
   */
  public accountAddress: string;
  /**
   * User Info of this account.
   */
  public userInfo: UserInfo;
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
   * IPFS node
   */
  public ipfs = null;

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
    this.accountAddress = (await this.web3.eth.getAccounts())[0];
    this.networkId = await this.web3.eth.net.getId();
    this.networkName = await this.getNetworkName(this.networkId);
    this.contractInstance = new this.web3.eth.Contract(
      abiArray,
      getContractAddress(this.networkId)
    );
    this.userInfo = await this.getUserInfoFromAddress(this.accountAddress);
    await this.initializeIPFS();
  }

  private initializeIPFS() {
    const ipfsOption = {};
    this.ipfs = new IPFS(ipfsOption);
    return new Promise((resolve, reject) => {
      this.ipfs.on("ready", () => {
        console.log("IPFS node initialized");
        return resolve();
      });
      this.ipfs.on("error", error => {
        return reject(error);
      });
    });
  }

  /**
   * Post content to IPFS node.
   * @param content
   */
  public async ipfsAdd(
    content: string
  ): Promise<{
    hash: string;
    path: string;
    size: number;
  }> {
    return (await this.ipfs.files.add(Buffer.from(content)))[0];
  }

  /**
   * Retrieve content from IPFS node.
   * @param ipfsHash
   */
  public async ipfsCat(ipfsHash: string): Promise<string> {
    return (await this.ipfs.files.cat(ipfsHash)).toString("utf8");
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
  public formatTag(tag: string): string {
    // check if this is user address
    if (this.web3.utils.isAddress(tag)) {
      return tag.toLowerCase().replace(/^0x/, "0x000000000000000000000000"); // to make it 32bytes.
    }

    // check if this is transaction hash
    if (tag.startsWith("0x") && tag.length === 66) {
      return tag.toLowerCase();
    }

    return "0x" + sha256(tag.toLowerCase().replace(/\s/g, ""));

    /*
    const compressedTag = compressString(tag.toLowerCase().replace(/\s/g, ""));
    let hexString = hexEncode(compressedTag);
    if (hexString.length >= 64) {
      // greate than bytes32
      return "";
    } else {
      while (hexString.length !== 64) {
        // to make it 32bytes.
        hexString += "0";
      }
      return "0x" + hexString;
    }
    */
  }

  public formatUsername(username: string) {
    const compressedUsername = compressString(
      username.toLowerCase().replace(/[\s\@]/g, "")
    );
    let hexString = hexEncode(compressedUsername);
    if (hexString.length >= 64) {
      // greate than bytes32
      throw `Username: ${username} is too long`;
    } else {
      while (hexString.length !== 64) {
        // to make it 32bytes.
        hexString = "0" + hexString;
      }
      return "0x" + hexString;
    }
  }

  /**
   * throw error or return null if failed to post feed
   * @param message the string that you want to post.
   */
  public async postFeed(message: string, tags = [], postAsIPFSHash = false) {
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
    tags = Array.from(new Set(tags)); // Remove duplicate.

    const currentTimestamp = Date.now();
    if (postAsIPFSHash) {
      message = `ipfs://${(await this.ipfsAdd(message)).hash}`;
    }
    const compressedMessage = compressString(message);
    const messageHash =
      "0x" +
      sha256(this.accountAddress + currentTimestamp.toString() + message);

    const previousFeedTransactionInfo = await this.getNewestFeedTransactionFromUser(
      this.accountAddress
    );
    const previousFeedTransactionHash = previousFeedTransactionInfo
      ? previousFeedTransactionInfo.hash
      : "0x0000000000000000000000000000000000000000000000000000000000000000";
    // => 0x40091f65172c76c5daa276c66cbd1f175fda12d9bd20b842007feed78757a089

    console.log("post    :");
    console.log("    tags: ", tags);

    return await new Promise((resolve, reject) => {
      this.contractInstance.methods
        .post(
          currentTimestamp, // timestamp
          compressedMessage, // message
          messageHash, // messageHash
          previousFeedTransactionHash, // previousFeedTransactionHash
          tags // tags
        )
        .send({ from: this.accountAddress })
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

  public async replyFeed(
    message: string,
    tags = [],
    mode = 0,
    parentFeedInfo: FeedInfo,
    postAsIPFSHash = false
  ) {
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
    tags = Array.from(new Set(tags)); // Remove duplicate.

    const currentTimestamp = Date.now();
    if (postAsIPFSHash) {
      message = `ipfs://${(await this.ipfsAdd(message)).hash}`;
    }
    const compressedMessage = compressString(message);
    const messageHash =
      "0x" +
      sha256(this.accountAddress + currentTimestamp.toString() + message);

    const parentTransactionHash = parentFeedInfo.transactionInfo.hash;
    const currentReplyInfo = await this.contractInstance.methods
      .getCurrentTagInfoByTime(parentTransactionHash)
      .call();
    const currentReplyBlockNumber = parseInt(currentReplyInfo[0]);
    const currentReplyHash = new BigNumber(currentReplyInfo[1]).toString(16);
    const previousReplyTransactionInfo = await this.getTransactionInfo({
      blockNumber: currentReplyBlockNumber,
      messageHash: currentReplyHash
    });
    const previousReplyTransactionHash = previousReplyTransactionInfo
      ? previousReplyTransactionInfo.hash
      : "0x0000000000000000000000000000000000000000000000000000000000000000";

    let authorAddress = "0x0000000000000000000000000000000000000000";

    return await new Promise((resolve, reject) => {
      this.contractInstance.methods
        .reply(
          currentTimestamp, // timestamp
          parentTransactionHash, // parentTransactionHash
          previousReplyTransactionHash, // previousReplyTransactionHash
          compressedMessage, // message
          messageHash, // messageHash
          tags, // tags
          mode, // mode
          authorAddress
        )
        .send({ from: this.accountAddress })
        .on("error", error => {
          return reject(error);
        })
        .on("transactionHash", hash => {
          console.log("reply feed txHash: ", hash);
          return resolve(hash);
        })
        .on("receipt", receipt => {
          console.log("reply feed receipt", receipt);
        });
    });
  }

  /**
   * upvote a feed
   * TODO: add donation support.
   */
  public async upvote(
    parentTransactionHash: string,
    authorAddress = "",
    wei = 0
  ) {
    // 1. Verify parentTransactionHash is valid.
    const parentTransaction = await this.web3.eth.getTransaction(
      parentTransactionHash
    );
    const decodedInputData = decodeMethod(parentTransaction.input);
    if (!decodedInputData || Object.keys(decodedInputData).length === 0) {
      return null;
    }

    // 2. Get previousFeedTransactionHash.
    const previousFeedTransactionInfo = await this.getNewestFeedTransactionFromUser(
      this.accountAddress
    );
    const previousFeedTransactionHash = previousFeedTransactionInfo.hash;

    // 3. Analyze tags
    //    If the parentTransaction is the original `post` method, then add its tags.
    // TODO: Need discussion of the tags.
    //       https://github.com/shd101wyy/ribbit/issues/4
    let tags = [];
    if (decodedInputData.name === "post") {
      tags = decodedInputData.params["tags"].value;
    }

    if (!authorAddress) {
      authorAddress = "0x0000000000000000000000000000000000000000";
    }

    return new Promise((resolve, reject) => {
      this.contractInstance.methods
        .upvote(
          Date.now(),
          parentTransactionHash,
          previousFeedTransactionHash,
          tags,
          authorAddress
        )
        .send({ from: this.accountAddress, value: wei })
        .on("error", error => {
          return reject(error);
        })
        .on("transactionHash", hash => {
          console.log("upvote txHash: ", hash);
          return resolve(hash);
        })
        .on("receipt", receipt => {
          console.log("upvote receipt: ", receipt);
        });
    });
  }

  /**
   * downvote a feed
   */
  public async downvote(parentTransactionHash: string) {
    return new Promise((resolve, reject) => {
      this.contractInstance.methods
        .downvote(parentTransactionHash)
        .send({ from: this.accountAddress })
        .on("error", error => {
          return reject(error);
        })
        .on("transactionHash", hash => {
          console.log("downvote txHash: ", hash);
          return resolve(hash);
        })
        .on("receipt", receipt => {
          console.log("downvote receipt: ", receipt);
        });
    });
  }

  /**
   * If transactionHash is provided, then get transactionInfo based on that trasactionHash,
   * then compare the data with blockNumber and messageHash.
   * If comparison failed, then try to get the transactionInfo based on the blockNumber and messageHash.
   * @param userAddress sender of this transaction. If `userAddress` is not provided, then it means you are querying other's transactionInfo.
   * @param blockNumber block number
   * @param messageHash message hash without `0x` at start.
   * @param transactionHash
   */
  public async getTransactionInfo({
    userAddress = "",
    blockNumber = 0,
    messageHash = "",
    transactionHash = ""
  }): Promise<TransactionInfo> {
    // console.log("userAddress: ", userAddress);
    // console.log("blockNumber: ", blockNumber);
    // console.log("messageHash: ", messageHash);
    // console.log("transactionHash: ", transactionHash);
    const validateTransaction = (transaction: Transaction) => {
      // It is weird that this.accountAddress is all lowercase, but transaction.from is not.
      // This code is wrong for `repost` event, userAddress !== transaction.from.
      if (
        userAddress &&
        userAddress.toLowerCase() !== transaction.from.toLowerCase()
      ) {
        return null;
      }

      const input = transaction.input;
      const decodedInputData = decodeMethod(input);
      if (!decodedInputData || Object.keys(decodedInputData).length === 0) {
        return null;
      } else {
        let messageHash2 = null;
        if (
          decodedInputData.name === "post" ||
          decodedInputData.name === "reply"
        ) {
          messageHash2 = new BigNumber(
            decodedInputData.params["messageHash"].value
          ).toString(16);
        } else if (decodedInputData.name === "upvote") {
          // for upvote, it's special.
          messageHash2 = new BigNumber(
            decodedInputData.params["timestamp"].value
          ).toString(16);
        }
        if (messageHash && messageHash2 !== messageHash) {
          return null; // hashes don't match
        }
        // transaction.hash = transaction.hash.toLowerCase(); // <= for transactionHash as tag.
        return Object.assign(transaction as object, {
          decodedInputData
        }) as TransactionInfo;
      }
    };

    if (transactionHash) {
      try {
        const transaction = await this.web3.eth.getTransaction(transactionHash);
        if (
          (blockNumber && transaction.blockNumber === blockNumber) || // block number is provided
          !blockNumber
        ) {
          // block number is not provided
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

    if (!blockNumber) {
      return null;
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
    return await this.getTransactionInfo({
      userAddress,
      blockNumber: currentFeedBlockNumber,
      messageHash: currentFeedHash
    });
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
    const currentFeedBlockNumber = parseInt(currentFeedInfo[0]);
    const currentFeedHash = new BigNumber(currentFeedInfo[1]).toString(16);
    return await this.getTransactionInfo({
      blockNumber: currentFeedBlockNumber,
      messageHash: currentFeedHash
    });
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
    return await this.getTransactionInfo({
      blockNumber: currentFeedBlockNumber,
      messageHash: currentFeedHash
    });
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
    if (!blockNumber) {
      blockNumber = parseInt(currentFeedInfo[0]);
      messageHash = new BigNumber(currentFeedInfo[1]).toString(16);
    }
    return await this.getFeeds({
      userAddress: "",
      tag,
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
      tag,
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
    tag = "",
    blockNumber = 0,
    messageHash = "",
    num = -1,
    transactionHash = "",
    cb = (
      done: boolean,
      offset?: number,
      transactionInfo?: TransactionInfo
    ) => {}
  }: {
    userAddress?: string;
    tag?: string;
    blockNumber: number;
    messageHash: string;
    num: number;
    transactionHash: string;
    cb: (
      done: boolean,
      offset?: number,
      transactionInfo?: TransactionInfo
    ) => void;
  }) {
    let offset = 0;
    while (offset > num) {
      // console.log("@@ offset: " + offset);
      const transactionInfo = await this.getTransactionInfo({
        userAddress,
        blockNumber,
        messageHash,
        transactionHash
      });
      if (!transactionInfo) {
        return cb(true); // done.
      } else {
        cb(false, offset, transactionInfo);
        if (transactionInfo.decodedInputData.name === "post") {
          transactionHash =
            transactionInfo.decodedInputData.params[
              "previousFeedTransactionHash"
            ].value;
        } else if (transactionInfo.decodedInputData.name === "upvote") {
          transactionHash =
            transactionInfo.decodedInputData.params[
              "previousFeedTransactionHash"
            ].value;
        } else if (transactionInfo.decodedInputData.name === "reply") {
          transactionHash =
            transactionInfo.decodedInputData.params[
              "previousReplyTransactionHash"
            ].value;
        } else {
          // wrong event
          console.log("getFeeds wrong transactionInfo: ", transactionInfo);
          return cb(true);
        }
        const receipt = await this.web3.eth.getTransactionReceipt(
          transactionInfo.hash
        );
        const logs = (receipt ? receipt["logs"] : []) || []; // receipt might be null.
        if (!logs.length) {
          return cb(true);
        }
        const decodedLogs = decodeLogs(logs);
        let eventLog: DecodedLogData = null;
        if (!tag) {
          // PostEvent or RepostEvent.
          eventLog = decodedLogs.filter(
            x => x.name === "SavePreviousFeedInfoEvent"
          )[0];
        } else {
          // Tag events.
          eventLog = decodedLogs.filter(
            x =>
              (x.name === "SavePreviousTagInfoByTimeEvent" ||
                x.name === "SavePreviousTagInfoByTrendEvent") &&
              x.events["tag"].value === tag
          )[0];
        }
        if (!eventLog) {
          return cb(true); // done
        } else {
          if (
            eventLog.name === "SavePreviousTagInfoByTrendEvent" ||
            eventLog.name === "SavePreviousTagInfoByTimeEvent"
          ) {
            blockNumber = parseInt(eventLog.events["previousTagInfo"].value[0]);
            messageHash = new BigNumber(
              eventLog.events["previousTagInfo"].value[1]
            ).toString(16);
          } else if (eventLog.name === "SavePreviousFeedInfoEvent") {
            blockNumber = parseInt(
              eventLog.events["previousFeedInfo"].value[0]
            );
            messageHash = new BigNumber(
              eventLog.events["previousFeedInfo"].value[1]
            ).toString(16);
          } else {
            throw "Error: Invalid eventLog" +
              JSON.stringify(eventLog, null, "  ");
          }
          offset += 1;
          continue;
        }
      }
    }
  }

  public async getUsernameFromAddress(address: string): Promise<string> {
    const compressedUsername = await this.contractInstance.methods
      .getUsernameFromAddress(address)
      .call();
    // console.log("compressedUsername: ", compressedUsername, hexDecode(compressedUsername));
    if (
      compressedUsername ===
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    ) {
      // the @username is not set.
      return "";
    } else {
      return decompressString(
        hexDecode(compressedUsername.replace(/^0x(00)*/, ""))
      );
    }
  }

  public async getAddressFromUsername(username: string): Promise<string> {
    return await this.contractInstance.methods
      .getAddressFromUsername(this.formatUsername(username))
      .call();
  }

  /**
   * Load user metadata
   * @param address
   */
  public async getUserInfoFromAddress(address: string): Promise<UserInfo> {
    const userInfo =
      (JSON.parse(
        decompressString(
          await this.contractInstance.methods
            .getMetaDataJSONStringValue(address)
            .call()
        )
      ) as UserInfo) || ({} as UserInfo);

    if (!userInfo.avatar) {
      if (!address) {
        address = "0xinvalid_address";
      }
      userInfo.avatar =
        "data:image/png;base64," + new Identicon(address, 80).toString();
    }
    userInfo.name = userInfo.name || "Frog_" + address.slice(2, 6);
    userInfo.address = address;

    const username =
      userInfo.username ||
      (await this.getUsernameFromAddress(address)) ||
      "unknown";
    userInfo.username = username;

    return userInfo;
  }

  public async getUserInfoFromUsername(username: string): Promise<UserInfo> {
    const address = await this.getAddressFromUsername(username);
    return this.getUserInfoFromAddress(address);
  }

  public async setUserMetadata(userInfo: UserInfo) {
    let userInfoCopy = Object.assign({}, userInfo);
    const address = userInfoCopy["address"];
    delete userInfoCopy["address"]; // no need to save address.
    const username = userInfoCopy["username"];
    // delete userInfoCopy["username"]; // no need to delete this, because user might want @Ribbit instead of @ribbit.
    if (
      (await this.getAddressFromUsername(username)) !==
      "0x0000000000000000000000000000000000000000"
    ) {
      throw `Username @${username} is already taken.`;
    }
    return new Promise((resolve, reject) => {
      this.contractInstance.methods
        .setUsernameAndMetaDataJSONString(
          this.formatUsername(username),
          compressString(JSON.stringify(userInfoCopy))
        )
        .send({ from: this.accountAddress })
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

  public async getFeedStateInfo(transactionHash: string): Promise<StateInfo> {
    const earnings = parseInt(
      await this.contractInstance.methods.getState(transactionHash, 0).call()
    );
    const upvotes = parseInt(
      await this.contractInstance.methods.getState(transactionHash, 1).call()
    );
    const downvotes = parseInt(
      await this.contractInstance.methods.getState(transactionHash, 2).call()
    );
    const replies = parseInt(
      await this.contractInstance.methods.getState(transactionHash, 3).call()
    );
    const reports = parseInt(
      await this.contractInstance.methods.getState(transactionHash, 4).call()
    );
    return {
      earnings,
      upvotes,
      downvotes,
      reports,
      replies
    };
  }

  public async retrieveMessage(message: string): Promise<string> {
    message = decompressString(message);
    let match = null;
    if (
      message.length ===
        `ipfs://QmUXTtySmd7LD4p6RG6rZW6RuUuPZXTtNMmRQ6DSQo3aMw`.length &&
      (match = message.match(/^ipfs\:\/\/(.+)$/))
    ) {
      const hash = match[1];
      return await this.ipfsCat(hash);
    } else {
      return message;
    }
  }
}
