export interface TransactionInfo {
  hash: string;
  nouce: number;
  blockHash: string;
  blockNumber: number;
  transactionIndex: number;
  from: string;
  to: string;
  value: any; // BigNumber
  gasPrice: any; // BigNumber
  gas: number;
  input: string;
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
    hash: "0x73466d683ba1703d82c8c532de83e55844f1a8d69eda3ba44ac2be9e724ebde4",
    nouce: 0,
    blockHash: "",
    blockNumber: 0,
    transactionIndex: 0,
    from: "0xe3fe5d0538642c836ed45148bce51e47383356ee",
    to: "0xef71cc369609b55b4f7c487ac28830ad25f08658",
    value: 0,
    gasPrice: 0,
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
