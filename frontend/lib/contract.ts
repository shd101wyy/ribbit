import Web3 from "web3";
import SolidityContract from "web3/eth/contract";
import { TransactionObject, Tx } from "web3/eth/types";
import PromiEvent from "web3/promiEvent";
import { isIeleVMByContractAddress } from "./smartcontract";
import {
  SolidityType,
  SolidityFunctionAbi,
  encodeSolidityFunctionName
} from "./iele-translator";
import * as IeleTranslator from "./iele-translator";
import * as RLP from "rlp";
window["RLP"] = RLP;
window["IeleTranslator"] = IeleTranslator;

/**
 * This is the wrapper of Solidity and IELE Contract
 */
export default class Contract {
  private web3: Web3;
  private solidityContract: SolidityContract;
  private vmType: "ielevm" | "evm";
  private contractAddress: string;
  private jsonInterface: any[];
  public methods: {
    [fnName: string]: (...args: any[]) => TransactionObject<any>;
  } = {};

  constructor(
    web3: Web3,
    jsonInterface: any[],
    contractAdderss: string,
    options?: object
  ) {
    this.web3 = web3;
    this.jsonInterface = jsonInterface;
    this.contractAddress = contractAdderss;

    if (isIeleVMByContractAddress(contractAdderss)) {
      this.vmType = "ielevm";
      this.initIeleMethods();
    } else {
      this.vmType = "evm";
      this.solidityContract = new this.web3.eth.Contract(
        jsonInterface,
        contractAdderss,
        options
      );
      this.methods = this.solidityContract.methods;
    }
  }

  private initIeleMethods() {
    this.methods = {};
    this.jsonInterface.forEach(x => {
      const methodName: string = x.name;
      const isConstant: boolean = x.constant;
      const inputs: SolidityType[] = x.inputs;
      const outputs: SolidityType[] = x.outputs;
      const type: string = x.type;
      const method = (...args: any[]): TransactionObject<any> => {
        const call = async (tx?: Tx): Promise<any> => {
          console.log("IELE contract Call");
          const funAbi: SolidityFunctionAbi = {
            name: methodName,
            inputs: inputs
          };
          const encodedFunName = encodeSolidityFunctionName(funAbi);
          const encodedParams = args.map((x, i) =>
            IeleTranslator.encode(x, inputs[i])
          );
          const dataHex: string = RLP.encode([
            encodedFunName,
            encodedParams
          ]).toString("hex");
          const newTx = Object.assign({}, tx || {});
          newTx.data = dataHex;
          newTx.to = this.contractAddress;
          return RLP.decode(await this.web3.eth.call(newTx)).map((val, i) =>
            IeleTranslator.decode("0x" + val.toString("hex"), outputs[i])
          )[0].result;
        };
        const send = (tx?: Tx): PromiEvent<any> => {
          console.log("IELE contract Send");
          const funAbi: SolidityFunctionAbi = {
            name: methodName,
            inputs: inputs
          };
          const encodedFunName = encodeSolidityFunctionName(funAbi);
          const encodedParams = args.map((x, i) =>
            IeleTranslator.encode(x, inputs[i])
          );
          const dataHex: string = RLP.encode([
            encodedFunName,
            encodedParams
          ]).toString("hex");
          const newTx = Object.assign({}, tx || {});
          newTx.data = dataHex;
          newTx.to = this.contractAddress;
          return this.web3.eth.sendTransaction(newTx);
        };
        async function estimateGas(tx?: Tx): Promise<number> {
          throw "estimateGas not implemented";
        }
        function encodeABI(): string {
          throw "encodeABI not implemented";
          return "";
        }
        return {
          arguments: args,
          call,
          send,
          estimateGas,
          encodeABI
        };
      };
      this.methods[methodName] = method;
    });
  }
}
