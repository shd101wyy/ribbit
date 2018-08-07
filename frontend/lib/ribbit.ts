import {
  getContractAddress,
  getLatestAbiArray,
  abiMap,
  getABIArray
} from "./smartcontract";
import { sha256 } from "js-sha256";
import * as chineseConv from "chinese-conv";
import * as multihash from "../lib/multihash";
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
import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";
PouchDB.plugin(PouchDBFind);

import * as ipfsAPI from "ipfs-api";

let Buffer = window["Buffer"] || undefined;
if (typeof Buffer === "undefined") {
  // For browser compatibility
  Buffer = require("buffer/").Buffer;
  window["Buffer"] = Buffer;
}
import { StateInfo, FeedInfo } from "./feed";
import { Settings } from "./settings";
import { BlockSchema } from "./db";
import i18n from "../i18n/i18n";
import { AbiDecoder } from "./abi-decoder";
import { resolve } from "path";

const IgnoredCharacters = /[\s\@\#,\.\!\$\%\^\&\*\(\)\-\_\+\=\~\`\<\>\?\/\，\。]/g;

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
  /**
   * Pouchdb instance.
   */
  public transactionInfoDB: PouchDB.Database<TransactionInfo>;

  /**
   * Pouchdb instance.
   */
  public blockDB: PouchDB.Database<BlockSchema>;

  /**
   * Ethereum web3 instance.
   */
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
  public networkName: string;
  /**
   * Current connected network name abbreviation
   */
  public networkNameAbbrev: string;
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
   * offline settings
   */
  settings: Settings;

  /**
   * Abi decoders
   */
  public abiDecoders: AbiDecoder[];

  /**
   * Constructor
   * @param web3
   */
  constructor(web3: Web3) {
    this.web3 = web3;

    this.abiDecoders = Object.keys(abiMap).map(offset => {
      return new AbiDecoder(web3, getABIArray(offset));
    });
  }

  /**
   * This function should be called immediately after creating User.
   */
  public async initialize() {
    this.accountAddress = (await this.web3.eth.getAccounts())[0];
    this.networkId = await this.web3.eth.net.getId();
    this.networkName = this.getNetworkName(this.networkId, false);
    this.networkNameAbbrev = this.getNetworkName(this.networkId, true);
    console.log("enter here");
    this.contractInstance = new this.web3.eth.Contract(
      getLatestAbiArray(),
      getContractAddress(this.networkId)
    );
    console.log("enter here 2");
    this.userInfo = await this.getUserInfoFromAddress(this.accountAddress);
    console.log("enter here 3");

    // Initialize database
    this.transactionInfoDB = new PouchDB<TransactionInfo>(
      "ribbit/transactionInfo"
    );
    await this.transactionInfoDB["createIndex"]({
      index: { fields: ["creation", "blockNumber", "from", "tags", "hash"] }
    });
    this.blockDB = new PouchDB<BlockSchema>("ribbit/block");
    await this.blockDB["createIndex"]({
      index: { fields: ["blockNumber", "fullySynced"] }
    });

    // Initialize IPFS
    this.initializeIPFS();

    console.log("enter here 4");

    // Initialize user settings
    await this.initializeSettings();

    console.log("enter here 5");

    this.monitorAccountChange();
  }

  private initializeIPFS() {
    const ipfsOption = {};
    this.ipfs = ipfsAPI({
      host: "ipfs.infura.io",
      port: "5001",
      protocol: "https"
    });
    window["ipfsNode"] = this.ipfs;
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
  public ipfsCat(ipfsHash: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let timeout = setTimeout(() => {
        return resolve(
          i18n.t("notification/ipfs-hash-not-found", {
            name: ipfsHash.slice(0, 6) + "...",
            link: `https://ipfs.infura.io/ipfs/${ipfsHash}`
          })
        );
      }, 1000);
      this.ipfs.files.cat(ipfsHash, (error, file) => {
        clearTimeout(timeout);
        if (error) {
          return reject(error);
        } else {
          const content = file.toString("utf8");
          return resolve(content);
        }
      });
    });
  }

  /**
   * Listen to account change, then refresh the webpage.
   */
  private monitorAccountChange() {
    const accountInterval = setInterval(async () => {
      const accountAddress = (await this.web3.eth.getAccounts())[0];
      const networkId = await this.web3.eth.net.getId();
      if (
        this.accountAddress !== accountAddress ||
        this.networkId !== networkId
      ) {
        window.location.reload();
      }
    }, 500);
  }

  /**
   * Get the name of the network
   */
  public getNetworkName(networkId: number, abbrev?: boolean) {
    switch (networkId) {
      case 1:
        if (abbrev) {
          return "Main";
        } else {
          return "Main Ethereum Network";
        }
      case 2:
        if (abbrev) {
          return "Morden";
        } else {
          return "Morden Test Network";
        }
      case 3:
        if (abbrev) {
          return "Ropsten";
        } else {
          return "Ropsten Test Network";
        }
      default:
        if (abbrev) {
          return "Unknown";
        } else {
          return "Unknown Network";
        }
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

    tag = chineseConv.sify(tag); // convert to simplified Chinese.
    return "0x" + sha256(tag.toLowerCase().replace(IgnoredCharacters, ""));

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
      username.toLowerCase().replace(IgnoredCharacters, "")
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
   * @description Iterate over all abiDecoders
   * @param input
   */
  public decodeMethod(input: string) {
    for (let i = this.abiDecoders.length - 1; i >= 0; i--) {
      const abiDecoder = this.abiDecoders[i];
      const decodedInputData = abiDecoder.decodeMethod(input);
      if (!decodedInputData) {
        continue;
      } else {
        return transformDecodedInputData(decodedInputData);
      }
    }
    return null;
  }

  /**
   * @description Iterate over all abiDecoders
   * @param input
   */
  public decodeLogs(logs: Log[]) {
    for (let i = this.abiDecoders.length - 1; i >= 0; i--) {
      const abiDecoder = this.abiDecoders[i];
      const decodedLogData = abiDecoder.decodeLogs(logs);
      if (!decodedLogData) {
        continue;
      } else {
        return transformDecodedLogData(decodedLogData);
      }
    }
    return null;
  }

  /**
   * throw error or return null if failed to post feed
   * @param message the string that you want to post.
   */
  public async postFeed(
    digest: string,
    hashFunction: number,
    size: number,
    tags = []
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

    console.log("post    :");
    console.log("    digest: ", digest);
    console.log("    hashFunction: ", hashFunction);
    console.log("    size: ", size);
    console.log("    tags: ", tags);

    return await new Promise((resolve, reject) => {
      this.contractInstance.methods
        .post(
          digest,
          hashFunction,
          size,
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
          new window["Noty"]({
            type: "success",
            text: i18n.t("notification/publish-post-success"),
            timeout: 10000
          }).show();
          console.log("post feed receipt", receipt);
        });
    });
  }

  public async replyFeed(
    digest: string,
    hashFunction: number,
    size: number,
    tags = [],
    repostToTimeline = false,
    parentFeedInfo: FeedInfo
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

    const parentTransactionHash = parentFeedInfo.transactionInfo.hash;
    let authorAddress = "0x0000000000000000000000000000000000000000";

    return await new Promise((resolve, reject) => {
      this.contractInstance.methods
        .reply(
          parentTransactionHash, // parentTransactionHash
          digest, // digest
          hashFunction, // hashFunction
          size, // size
          tags, // tags
          repostToTimeline // repostToTimeline
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
          new window["Noty"]({
            type: "success",
            text: i18n.t("notification/publish-reply-success"),
            timeout: 10000
          }).show();
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
    const decodedInputData = this.decodeMethod(parentTransaction.input);
    if (!decodedInputData || Object.keys(decodedInputData).length === 0) {
      return null;
    }

    // 2. Analyze tags
    //    If the parentTransaction is the original `post` method, then add its tags.
    // TODO: Need discussion of the tags.
    //       https://github.com/shd101wyy/ribbit/issues/4
    let tags = [];
    if (decodedInputData.name === "post") {
      tags = decodedInputData.params["tags"].value;
    } else if (decodedInputData.name === "reply") {
      tags = decodedInputData.params["tags"].value;
      tags = tags.filter(tag => {
        return !tag.startsWith("0x000000000000000000000000");
      }); // remove user that were mentioned in that post.
    }
    // notify the author whose post that we liked.
    tags.push(this.formatTag(parentTransaction.from));
    tags = Array.from(new Set(tags));

    if (!authorAddress) {
      authorAddress = "0x0000000000000000000000000000000000000000";
    }

    console.log(`upvote:
  * parentTransactionHash ${parentTransactionHash}
  * tags ${JSON.stringify(tags, null, "  ")}
  * authorAddress ${authorAddress}`);

    return new Promise((resolve, reject) => {
      this.contractInstance.methods
        .upvote(Date.now(), parentTransactionHash, tags, true, authorAddress)
        .send({ from: this.accountAddress, value: wei })
        .on("error", error => {
          return reject(error);
        })
        .on("transactionHash", hash => {
          console.log("upvote txHash: ", hash);
          return resolve(hash);
        })
        .on("receipt", receipt => {
          new window["Noty"]({
            type: "success",
            text: i18n.t("notification/publish-upvote-success"),
            timeout: 10000
          }).show();
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
        .downvote(parentTransactionHash, false)
        .send({ from: this.accountAddress })
        .on("error", error => {
          return reject(error);
        })
        .on("transactionHash", hash => {
          console.log("downvote txHash: ", hash);
          return resolve(hash);
        })
        .on("receipt", receipt => {
          new window["Noty"]({
            type: "success",
            text: i18n.t("notification/publish-downvote-success"),
            timeout: 10000
          }).show();
          console.log("downvote receipt: ", receipt);
        });
    });
  }

  /**
   * Sync one block, store all ribbit related transaction information into database.
   * TODO: fetch IPFS messages.
   * @param blockNumber
   */
  public async syncBlock(
    blockNumber: number,
    cb?: (blockNumber: number, index: number, total: number) => void
  ) {
    console.log("syncBlock: start syncing block " + blockNumber);
    try {
      const blockInfo = await this.blockDB.get(`block_${blockNumber}`);
      if (blockInfo && blockInfo.fullySynced) {
        if (cb) {
          cb(blockNumber, -1, -1);
        }
        return;
      }
    } catch (error) {
      // do nothing here
    }
    const blockTimestamp =
      (await this.web3.eth.getBlock(blockNumber)).timestamp * 1000;
    const transactionCount = await this.web3.eth.getBlockTransactionCount(
      blockNumber
    );
    const asyncFunctions: Promise<Transaction>[] = [];
    for (let i = 0; i < transactionCount; i++) {
      asyncFunctions.push(
        this.web3.eth.getTransactionFromBlock(blockNumber, i)
      );
    }

    const transactions = await Promise.all(asyncFunctions);
    for (let i = 0; i < transactions.length; i++) {
      if (cb) {
        cb(blockNumber, i, transactionCount);
      }
      const transaction = transactions[i];
      if (!transaction) {
        continue;
      }
      const decodedInputData = this.decodeMethod(transaction.input);
      if (
        !decodedInputData ||
        Object.keys(decodedInputData).length === 0 ||
        (decodedInputData.name !== "post" &&
          decodedInputData.name !== "upvote" &&
          decodedInputData.name !== "reply")
      ) {
        continue;
      } else {
        const receipt = await this.web3.eth.getTransactionReceipt(
          transaction.hash
        );
        const logs = (receipt ? receipt["logs"] : null) || null; // receipt might be null
        if (!logs || !logs.length) {
          continue;
        }
        const decodedLogs = this.decodeLogs(logs);
        const tags = [];
        decodedLogs.forEach(decodedLog => {
          if (decodedLog.name === "SavePreviousTagInfoEvent") {
            tags.push(decodedLog.events["tag"].value);
          }
        });

        // transaction.hash = transaction.hash.toLowerCase(); // <= for transactionHash as tag.
        const transactionInfo: TransactionInfo = Object.assign(
          transaction as object,
          {
            decodedInputData,
            decodedLogs,
            creation: blockTimestamp + i,
            _id: transaction.hash,
            tags
          }
        ) as TransactionInfo;
        try {
          await this.transactionInfoDB.get(transaction.hash);
        } catch (error) {
          try {
            await this.transactionInfoDB.put(transactionInfo);
          } catch (error) {
            console.log(error);
          }
        }
      }
    }

    try {
      await this.blockDB.get("block_" + blockNumber.toString());
    } catch (error) {
      try {
        await this.blockDB.put({
          blockNumber,
          fullySynced: true,
          _id: "block_" + blockNumber.toString()
        });
      } catch (error) {
        console.log(error);
      }
    }
    console.log(`syncBlock: block ${blockNumber} synced from blockchain.`);
  }

  /**
   * If transactionHash is provided, then get transactionInfo based on that trasactionHash,
   * then compare the data with blockNumber.
   * If comparison failed, then try to get the transactionInfo based on the blockNumber and messageHash.
   * @param userAddress sender of this transaction. If `userAddress` is not provided, then it means you are querying other's transactionInfo.
   * @param tag formatted tag of this transaction. Use it to validate transaction if tag is provided.
   * @param blockNumber block number
   * @param transactionHash
   * @param maxCreation  max timestamp of the creation of the feed.
   */
  public async getTransactionInfo(
    {
      userAddress = "",
      tag = "",
      blockNumber = 0,
      transactionHash = "",
      maxCreation = 0
      // TODO: there might be multiple ribbit transaction in one block,
      //       we need to sort them by timestamp.
      // timestamp => timestamp in transaction should be greater than this.
    },
    cb?: (blockNumber: number, index: number, total: number) => void
  ): Promise<TransactionInfo> {
    // console.log("userAddress: ", userAddress);
    // console.log("blockNumber: ", blockNumber);
    // console.log("transactionHash: ", transactionHash);
    if (!maxCreation) {
      maxCreation = Date.now();
    }
    if (transactionHash) {
      try {
        const transaction = await this.web3.eth.getTransaction(transactionHash);
        if (
          (blockNumber && transaction.blockNumber === blockNumber) || // block number is provided
          !blockNumber
        ) {
          blockNumber = transaction.blockNumber;
        }
      } catch (error) {
        // transactionHash is wrong, then check blockNumber and messageHash
        return null;
      }
    }

    if (!blockNumber) {
      return null;
    } else {
      // Sync block;
      await this.syncBlock(blockNumber, cb);
    }

    // Check database
    // TODO: there might be two entries that have the same `creation`...
    if (transactionHash) {
      const res = await this.transactionInfoDB["find"]({
        selector: {
          hash: transactionHash,
          creation: { $lt: maxCreation }
        }
        // sort: ["creation"],
        // limit: 1
      });
      if (res && res.docs && res.docs.length) {
        console.log(
          "getTransactionInfo: Load from database for transactionHash"
        );
        res.docs.sort((x, y) => y["creation"] - x["creation"]);
        return res.docs[0] as TransactionInfo;
      } else {
        console.log("getTransactionInfo: Not found in db for transactionHash");
        return null;
      }
    } else if (userAddress && blockNumber) {
      const res = await this.transactionInfoDB["find"]({
        selector: {
          from: userAddress,
          blockNumber: blockNumber,
          creation: { $lt: maxCreation }
        }
        // sort: [{"creation": "desc"}],
        // limit: 1
      });
      if (res && res.docs && res.docs.length) {
        console.log("getTransactionInfo: Load from database for user");
        res.docs.sort((x, y) => y["creation"] - x["creation"]);
        return res.docs[0] as TransactionInfo;
      } else {
        console.log("getTransactionInfo: Not found in db for user");
        return null;
      }
    } else if (tag && blockNumber) {
      const res = await this.transactionInfoDB["find"]({
        selector: {
          blockNumber: blockNumber,
          tags: {
            $in: [tag]
          },
          creation: { $lt: maxCreation }
        }
        // sort: ["creation"],
        // limit: 1
      });
      if (res && res.docs && res.docs.length) {
        console.log("getTransactionInfo: Load from database for tag");
        res.docs.sort((x, y) => y["creation"] - x["creation"]);
        return res.docs[0] as TransactionInfo;
      } else {
        console.log("getTransactionInfo: Not found in db for tag");
        return null;
      }
    } else {
      return null;
    }
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
    const currentFeedBlockNumber = parseInt(currentFeedInfo);
    return await this.getTransactionInfo({
      userAddress,
      blockNumber: currentFeedBlockNumber
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
    const currentFeedBlockNumber = parseInt(currentFeedInfo);
    return await this.getTransactionInfo({
      blockNumber: currentFeedBlockNumber
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
      blockNumber = 0
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
      blockNumber = parseInt(currentFeedInfo);
    }
    return await this.getFeeds({
      userAddress,
      blockNumber,
      num,
      cb
    });
  }

  public async getFeedsFromTagByTrend(
    tag: string,
    {
      num = -1, // how many feeds to read?
      blockNumber = 0,
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
    blockNumber = parseInt(currentFeedInfo);
    return await this.getFeeds({
      userAddress: "",
      tag,
      blockNumber,
      num,
      cb
    });
  }

  /**
   * Generic way of gettings feeds.
   * @param param0
   */
  public async getFeeds({
    userAddress = "",
    tag = "",
    blockNumber = 0,
    num = -1,
    cb = (
      done: boolean,
      offset?: number,
      transactionInfo?: TransactionInfo
    ) => {}
  }: {
    userAddress?: string;
    tag?: string;
    blockNumber: number;
    num: number;
    cb: (
      done: boolean,
      offset?: number,
      transactionInfo?: TransactionInfo
    ) => void;
  }) {
    let offset = 0;
    while (num < 0 || offset < num) {
      // console.log("@@ offset: " + offset);
      const transactionInfo = await this.getTransactionInfo({
        userAddress,
        tag,
        blockNumber
      });
      if (!transactionInfo) {
        return cb(true); // done.
      } else {
        cb(false, offset, transactionInfo);
        const decodedLogs = transactionInfo.decodedLogs;
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
              x.name === "SavePreviousTagInfoEvent" &&
              x.events["tag"].value === tag
          )[0];
        }
        if (!eventLog) {
          return cb(true); // done
        } else {
          if (eventLog.name === "SavePreviousTagInfoEvent") {
            blockNumber = parseInt(eventLog.events["previousTagInfoBN"].value);
          } else if (eventLog.name === "SavePreviousFeedInfoEvent") {
            blockNumber = parseInt(eventLog.events["previousFeedInfoBN"].value);
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

  /**
   *
   * @param username unformatted username
   */
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
            .getMetadataJSONStringValue(address)
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
    userInfo.username = username.replace(/[@]+/, ""); // Sanitize username

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
      this.formatUsername(this.userInfo.username) ===
      this.formatUsername(userInfo.username)
    ) {
      return new Promise((resolve, reject) => {
        this.contractInstance.methods
          .setMetadataJSONStringValue(
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
            new window["Noty"]({
              type: "success",
              text: i18n.t("notification/publish-profile-success"),
              timeout: 60000
            }).show();
          });
      });
    } else {
      if (
        (await this.getAddressFromUsername(username)) !==
        "0x0000000000000000000000000000000000000000"
      ) {
        throw i18n.t("notification/username-taken", { username });
      }
      return new Promise((resolve, reject) => {
        this.contractInstance.methods
          .setUsernameAndMetadataJSONString(
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
            new window["Noty"]({
              type: "success",
              text: i18n.t("notification/publish-profile-success"),
              timeout: 10000
            }).show();
          });
      });
    }
  }

  // TODO: change to Promise.all for parallel
  public async getFeedStateInfo(transactionHash: string): Promise<StateInfo> {
    const asyncFunctions = [
      "earnings",
      "upvotes",
      "downvotes",
      "replies",
      "reports"
    ].map((key, offset) => {
      return new Promise((resolve, reject) => {
        return this.contractInstance.methods
          .getState(transactionHash, offset)
          .call()
          .then(value => {
            return resolve([key, parseInt(value)]);
          })
          .catch(error => {
            return reject(error);
          });
      });
    });
    const results = await Promise.all(asyncFunctions);
    const output: StateInfo = {
      earnings: 0,
      upvotes: 0,
      downvotes: 0,
      reports: 0,
      replies: 0
    };
    results.forEach(([key, value]) => {
      output[key] = value;
    });
    return output;
  }

  public async retrieveMessage(
    params: object
  ): Promise<{ message: string; ipfsHash: string }> {
    if ("message" in params) {
      // smart contract version 0
      let message = params["message"].value;
      message = decompressString(message);
      let match = null;
      if (
        message.length ===
          `@[ipfs](QmUXTtySmd7LD4p6RG6rZW6RuUuPZXTtNMmRQ6DSQo3aMw)`.length &&
        (match = message.match(/^@\[ipfs\]\((.+?)\)$/i))
      ) {
        const hash = match[1];
        return {
          message: await this.ipfsCat(hash),
          ipfsHash: hash
        };
      } else {
        return {
          message,
          ipfsHash: null
        };
      }
    } else {
      // smart contract version 1
      console.log("retrieve message: ", params);
      const ipfsHash = multihash.getMultihashFromBytes32({
        digest: params["digest"].value,
        hashFunction: parseInt(params["hashFunction"].value, 10),
        size: parseInt(params["size"].value, 10)
      });
      console.log("retrieve message ipfsHash: ", ipfsHash);
      return {
        message: await this.ipfsCat(ipfsHash),
        ipfsHash
      };
    }
  }

  public async setSettings(newSettings: Settings) {
    this.settings = newSettings;
    console.log("setSettings: ", newSettings);
    const hash = (await this.ipfsAdd(JSON.stringify(this.settings))).hash;
    if (typeof window.localStorage !== "undefined") {
      window.localStorage.setItem(`/settings/${this.accountAddress}`, hash);
    }
  }

  public async initializeSettings() {
    if (typeof window.localStorage !== "undefined") {
      const hash = window.localStorage.getItem(
        `/settings/${this.accountAddress}`
      );
      if (hash) {
        try {
          const settings = JSON.parse(await this.ipfsCat(hash)) as Settings;
          this.settings = settings;
          return settings;
        } catch (error) {
          localStorage.removeItem(`/settings/${this.accountAddress}`); // There is error with the IPFS hash.
          return this.initializeDefaultSettings();
        }
      } else {
        return this.initializeDefaultSettings();
      }
    } else {
      return this.initializeDefaultSettings();
    }
  }

  public initializeDefaultSettings(): Settings {
    const followingTopics = [
      {
        topic: "ribbit",
        timestamp: Date.now()
      }
    ];
    const followingUsernames = [
      {
        username: this.userInfo.username,
        timestamp: Date.now()
      }
    ];
    /*
    if (this.userInfo.username !== "ribbit") {
      followingUsernames.push({
        username: "ribbit",
        timestamp: Date.now()
      });
    }
    */

    this.settings = {
      postAsIPFSHash: false,
      postToRibbitTopic: true,
      followingUsernames,
      followingTopics,
      language: "en"
    };
    return this.settings;
  }

  public async followUser(username: string) {
    const followingUsernames = this.settings.followingUsernames;
    let found: boolean = false;
    for (const followingUsername of followingUsernames) {
      if (followingUsername.username == username) {
        found = true;
        break;
      }
    }
    if (!found) {
      followingUsernames.push({
        username: username,
        timestamp: Date.now()
      });
      return await this.setSettings(this.settings);
    }
  }

  public async unfollowUser(username: string) {
    const followingUsernames = this.settings.followingUsernames;
    const newFollowingUsernames = [];
    for (const followingUsername of followingUsernames) {
      if (followingUsername.username !== username) {
        newFollowingUsernames.push(followingUsername);
      }
    }
    this.settings.followingUsernames = newFollowingUsernames;
    return await this.setSettings(this.settings);
  }

  public async followTopic(topic: string) {
    const followingTopics = this.settings.followingTopics;
    let found: boolean = false;
    for (const followingTopic of followingTopics) {
      if (followingTopic.topic == topic) {
        found = true;
        break;
      }
    }
    if (!found) {
      followingTopics.push({
        topic: topic,
        timestamp: Date.now()
      });
      return await this.setSettings(this.settings);
    }
  }

  public async unfollowTopic(topic: string) {
    const followingTopics = this.settings.followingTopics;
    const newFollowingTopics = [];
    for (const followingTopic of followingTopics) {
      if (followingTopic.topic !== topic) {
        newFollowingTopics.push(followingTopic);
      }
    }
    this.settings.followingTopics = newFollowingTopics;
    return await this.setSettings(this.settings);
  }

  public async destroyDB() {
    await this.transactionInfoDB.destroy();
    await this.blockDB.destroy();
    if (typeof window.localStorage !== "undefined") {
      window.localStorage.removeItem(`/settings/${this.accountAddress}`);
    }
  }

  public async getAccountsNum() {
    return await this.contractInstance.methods.getAccountsNum().call();
  }

  public async getAccountsAddresses({ page = 0, limit = -1 }) {
    const accountsNum = (await this.getAccountsNum()) || 0;
    const addresses = [];
    const start = page * limit;
    const end = limit < 0 ? Infinity : page * limit + limit;
    for (let i = start; i < end && i < accountsNum; i++) {
      const address = await this.contractInstance.methods
        .getAddressFromAccountNo(i + 1)
        .call();
      addresses.push(address);
    }
    return addresses;
  }
}
