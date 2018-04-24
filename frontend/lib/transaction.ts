import { Transaction } from "web3/types";

export interface DecodedInputData {
  name: string;
  params: {
    [key: string]: {
      value: any;
      type: string;
    };
  };
}

export interface DecodedLogData {
  address: string;
  events: { [key: string]: { type: string; value: any } };
  name: string;
}

export interface TransactionInfo extends Transaction {
  decodedInputData: DecodedInputData;
}

export function transformDecodedInputData(decodedInputData: {
  name: string;
  params: { name: string; value: any; type: string }[];
}): DecodedInputData {
  const transformedDecodedInputData: DecodedInputData = {
    name: decodedInputData.name,
    params: {}
  };
  for (let i = 0; i < decodedInputData.params.length; i++) {
    const param = decodedInputData.params[i];
    transformedDecodedInputData.params[param.name] = {
      value: param.value,
      type: param.type
    };
  }
  return transformedDecodedInputData;
}

export function transformDecodedLogData(
  decodedLogData: {
    address: string;
    events: { name: string; type: string; value: any }[];
    name: string;
  }[]
): DecodedLogData[] {
  const arr = [];
  decodedLogData.forEach(data => {
    const events = {};
    for (let i = 0; i < data.events.length; i++) {
      const event = data.events[i];
      events[event.name] = {
        type: event.type,
        value: event.value
      };
    }
    arr.push({
      address: data.address,
      events,
      name: data.name
    });
  });
  return arr;
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
      params: {
        timestamp: {
          value: Date.now(),
          type: "uint"
        }
      }
    }
  };
}

export function getTransactionCreationTimestamp(
  transactionInfo: TransactionInfo
) {
  const params = transactionInfo.decodedInputData.params;
  return parseInt(params["timestamp"].value, 10) || 0;
}
