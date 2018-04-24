import { Transaction } from "web3/types";

export interface TransactionInfo extends Transaction {
  decodedInputData: {
    name: string;
    params: {
      name: string;
      value: any;
      type: string;
    }[];
  };
}

export function generateFakeTransactionInfo(): TransactionInfo {
  return {
    hash: "",
    nonce: 0,
    blockHash: "",
    blockNumber: 0,
    transactionIndex: 0,
    from: "",
    to: "",
    value: "0",
    gasPrice: "0",
    gas: 0,
    input: "",
    decodedInputData: {
      name: "post",
      params: [
        {
          name: "timestamp",
          value: Date.now(),
          type: "uint"
        }
      ]
    }
  };
}

export function getTransactionCreationTimestamp(
  transactionInfo: TransactionInfo
) {
  const params = transactionInfo.decodedInputData.params;
  for (let i = 0; i < params.length; i++) {
    if (params[i].name === "timestamp") {
      return parseInt(params[i].value, 10);
    }
  }
  return 0;
}
