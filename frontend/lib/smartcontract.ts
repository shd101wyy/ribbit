// Smart contract information
export const abiArray = [
  {
    constant: false,
    inputs: [
      { name: "version", type: "uint256" },
      { name: "timestamp", type: "uint256" },
      { name: "parentTransactionHash", type: "bytes32" },
      { name: "parentTransactionBlockNumber", type: "uint256" },
      { name: "parentTransactionMessageHash", type: "uint256" },
      { name: "message", type: "string" },
      { name: "messageHash", type: "uint256" },
      { name: "previousCommentTransactionHash", type: "bytes32" },
      { name: "tags", type: "bytes32[]" }
    ],
    name: "postComment",
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
    inputs: [{ name: "transactionHash", type: "bytes32" }],
    name: "report",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
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
    inputs: [{ name: "", type: "address" }],
    name: "metaDataJSONStringMap",
    outputs: [{ name: "", type: "string" }],
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
    inputs: [{ name: "transactionHash", type: "bytes32" }],
    name: "like",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
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
    inputs: [{ name: "value", type: "string" }],
    name: "setMetaDataJSONStringMap",
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
    inputs: [
      { name: "version", type: "uint256" },
      { name: "timestamp", type: "uint256" },
      { name: "message", type: "string" },
      { name: "messageHash", type: "uint256" },
      { name: "previousFeedTransactionHash", type: "bytes32" },
      { name: "tags", type: "bytes32[]" }
    ],
    name: "postFeed",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "transactionHash", type: "bytes32" },
      { name: "postAutherAddress", type: "address" },
      { name: "amount1", type: "uint256" },
      { name: "appAuthorAddress", type: "address" },
      { name: "amount2", type: "uint256" }
    ],
    name: "sendEther",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "parentTransactionHash", type: "bytes32" }],
    name: "getCurrentCommentInfo",
    outputs: [{ name: "", type: "uint256[2]" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "transactionHash", type: "bytes32" }],
    name: "dislike",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
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
    constant: true,
    inputs: [{ name: "", type: "bytes32" }, { name: "", type: "uint256" }],
    name: "currentCommentInfoMap",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
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
    inputs: [{ name: "previousContractAddr", type: "address" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "previousFeedTransactionInfo",
        type: "uint256[2]"
      }
    ],
    name: "PostFeedEvent",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "previousCommentInfo", type: "uint256[2]" }
    ],
    name: "PostCommentEvent",
    type: "event"
  }
];
export const contractAddress = "0xa80f5463ffbfad8068fdec14dd7ad7a36c0b50fe";

export const abiArrayJSONString = JSON.stringify(abiArray);
