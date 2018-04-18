import { contractAddress, abiArray } from "./smartcontract";
import { sha256 } from "js-sha256";
import * as LZString from "lz-string";
import * as InputDataDecoder from "ethereum-input-data-decoder";

const decoder = new InputDataDecoder(abiArray);

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
    console.log("compressedMessage: " + compressedMessage)

    this.contractInstance.postFeed(
      0,                     // version
      currentTimestamp,      // timestamp
      compressedMessage,     // message
      '0x' + messageHash,    // messageHash
      0, // previousFeedTransactionHash
      [], // tags
      [], // previousTagTransactionByTimeHashes
      [], // previousTagTransactionByTrendHashes
      (...args) => {
        console.log(args);
      }
    );
  }

  public async getNewestFeedFromUser(userAddress: string) {
    // target transaction 0x02eb5d8dd7422e29183a9eef9250d7d8349d4489ae775498407349ed99669c63
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
    const currentFeedBlockNumber = currentFeedInfo[0].toNumber();
    const currentFeedTimestamp = currentFeedInfo[1].toNumber();
    const currentFeedHash = currentFeedInfo[2].toNumber();
    console.log("currentFeedInfo: ", currentFeedInfo);
    console.log("currentFeedBlockNumber: ", currentFeedBlockNumber);
    console.log("currentFeedTimestmap: " + currentFeedTimestamp);
    console.log("currentFeedHash: " + currentFeedHash);

    const transactionCount = await new Promise((resolve, reject)=> {
      this.web3.eth.getBlockTransactionCount(currentFeedBlockNumber, (error, transactionCount)=> {
        if (error) {
          return reject(error);
        } else {
          return resolve(transactionCount);
        }
      })
    })

    console.log("transactionCount: " + transactionCount);

    for (let i = 0; i < transactionCount; i++) {
      const transaction = await new Promise((resolve, reject)=> {
        this.web3.eth.getTransactionFromBlock(currentFeedBlockNumber, i, (error, result)=> {
          if (error) {
            return reject(error);
          } else {
            return resolve(result);
          }
        })
      }) as any
      if (userAddress !== transaction.from) {
        continue;
      }
      const transactionHash = transaction.hash;
      const input = transaction.input;
      const decode = decoder.decodeData(input);
      console.log("@i: " + i)
      console.log("transactionHash: " + transactionHash)
      console.log("input: " + input + '\n')
      console.log("decode: ", decode)
      if (Object.keys(decode).length === 0) {
        continue;
      } else {
        const inputs = decode.inputs;
        const version = inputs[0]//.toNumber();
        const timestamp = inputs[1]//.toNumber();
        const compressedMessage = inputs[2];
        const messageHash = inputs[3]//.toNumber();
        const previousFeedTransactionHash = inputs[4]//.toNumber();
        const previousTagTransactionByTimeHashes = inputs[5];
        const previousTagTransactionByTrendHashes = inputs[6];
        console.log('compressedMessage', compressedMessage);
        console.log('Message: ' + LZString.decompressFromUTF16(compressedMessage))
      }
    }
  }
}
