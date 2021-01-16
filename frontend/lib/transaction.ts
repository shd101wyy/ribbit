import { Transaction } from "web3-core";
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
  decodedLogs: DecodedLogData[];
  creation: number;
  _id: string;
  tags: string[]; // formated tags
}

export function transformDecodedInputData(decodedInputData: {
  name: string;
  params: { name: string; value: any; type: string }[];
}): DecodedInputData {
  const transformedDecodedInputData: DecodedInputData = {
    name: decodedInputData.name,
    params: {},
  };
  for (let i = 0; i < decodedInputData.params.length; i++) {
    const param = decodedInputData.params[i];
    transformedDecodedInputData.params[param.name] = {
      value: param.value,
      type: param.type,
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
  decodedLogData.forEach((data) => {
    const events = {};
    for (let i = 0; i < data.events.length; i++) {
      const event = data.events[i];
      events[event.name] = {
        type: event.type,
        value: event.value,
      };
    }
    arr.push({
      address: data.address,
      events,
      name: data.name,
    });
  });
  return arr;
}

export function generateFakeTransactionInfo(): TransactionInfo {
  return {
    _id: "", // same as hash
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
          type: "uint",
        },
      },
    },
    decodedLogs: [],
    creation: 0,
    tags: [],
  };
}
