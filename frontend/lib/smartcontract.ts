// Smart contract information
export const abiArray = [
  {
    constant: false,
    inputs: [
      { name: "username", type: "bytes32" },
      { name: "value", type: "string" }
    ],
    name: "setUsernameAndMetaDataJSONString",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "addr", type: "address" }],
    name: "getMetaDataJSONStringValue",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "authorAddress", type: "address" }],
    name: "getCurrentFeedInfo",
    outputs: [{ name: "", type: "uint256[2]" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "userAddress", type: "address" }],
    name: "downvoteUser",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "transactionHash", type: "bytes32" }],
    name: "report",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "", type: "address" }],
    name: "addressToUsernameMap",
    outputs: [{ name: "", type: "bytes32" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      { name: "transactionHash", type: "bytes32" },
      { name: "field", type: "uint256" }
    ],
    name: "getState",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "", type: "bytes32" }, { name: "", type: "uint256" }],
    name: "state",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      { name: "tag", type: "bytes32" },
      { name: "field", type: "uint256" }
    ],
    name: "getTagState",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "userAddress", type: "address" }],
    name: "reportUser",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "", type: "address" }],
    name: "metaDataJSONStringMap",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "version",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "", type: "bytes32" }, { name: "", type: "uint256" }],
    name: "currentTagInfoByTrendMap",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "", type: "address" }, { name: "", type: "uint256" }],
    name: "currentFeedInfoMap",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "timestamp", type: "uint256" },
      { name: "message", type: "string" },
      { name: "messageHash", type: "uint256" },
      { name: "previousFeedTransactionHash", type: "bytes32" },
      { name: "tags", type: "bytes32[]" }
    ],
    name: "post",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "previousContract",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "timestamp", type: "uint256" },
      { name: "parentTransactionHash", type: "bytes32" },
      { name: "previousFeedTransactionHash", type: "bytes32" },
      { name: "tags", type: "bytes32[]" },
      { name: "authorAddress", type: "address" }
    ],
    name: "upvote",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "", type: "bytes32" }],
    name: "usernameToAddressMap",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "", type: "bytes32" }, { name: "", type: "uint256" }],
    name: "currentTagInfoByTimeMap",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "tag", type: "bytes32" }],
    name: "upvoteTag",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "previousContractAddress",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "tag", type: "bytes32" }],
    name: "downvoteTag",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      { name: "userAddress", type: "address" },
      { name: "field", type: "uint256" }
    ],
    name: "getUserState",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "", type: "address" }, { name: "", type: "uint256" }],
    name: "userState",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "tag", type: "bytes32" }],
    name: "reportTag",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "timestamp", type: "uint256" },
      { name: "parentTransactionHash", type: "bytes32" },
      { name: "previousReplyTransactionHash", type: "bytes32" },
      { name: "message", type: "string" },
      { name: "messageHash", type: "uint256" },
      { name: "tags", type: "bytes32[]" },
      { name: "mode", type: "uint8" },
      { name: "authorAddress", type: "address" }
    ],
    name: "reply",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "", type: "bytes32" }, { name: "", type: "uint256" }],
    name: "tagState",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "userAddress", type: "address" }],
    name: "upvoteUser",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "addr", type: "address" }],
    name: "getUsernameFromAddress",
    outputs: [{ name: "", type: "bytes32" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "tag", type: "bytes32" }],
    name: "getCurrentTagInfoByTime",
    outputs: [{ name: "", type: "uint256[2]" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "value", type: "string" }],
    name: "setMetaDataJSONStringValue",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "tag", type: "bytes32" }],
    name: "getCurrentTagInfoByTrend",
    outputs: [{ name: "", type: "uint256[2]" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "transactionHash", type: "bytes32" }],
    name: "downvote",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "username", type: "bytes32" }],
    name: "getAddressFromUsername",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "_previousContractAddress", type: "address" },
      { name: "_version", type: "uint256" }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "previousFeedInfo", type: "uint256[2]" }],
    name: "SavePreviousFeedInfoEvent",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "previousTagInfo", type: "uint256[2]" },
      { indexed: false, name: "tag", type: "bytes32" }
    ],
    name: "SavePreviousTagInfoByTimeEvent",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "previousTagInfo", type: "uint256[2]" },
      { indexed: false, name: "tag", type: "bytes32" }
    ],
    name: "SavePreviousTagInfoByTrendEvent",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "value", type: "uint256" }],
    name: "DonateEvent",
    type: "event"
  }
];

export function getContractAddress(networkId: number) {
  if (networkId === 3) {
    // Ropsten
    return "0xf800d9d9d2514c119ff663bdb33d7d2bad3cbbdd";
  } else if (networkId === 1) {
    // mainnet
    return null;
  } else {
    return null;
  }
}

export const abiArrayJSONString = JSON.stringify(abiArray);
