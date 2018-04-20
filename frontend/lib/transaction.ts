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
