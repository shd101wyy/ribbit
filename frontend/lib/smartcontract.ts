// Smart contract information
export const abiArray = [
  {
    constant: false,
    inputs: [{ name: "tag", type: "bytes32" }],
    name: "dislikeTag",
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
    constant: false,
    inputs: [
      { name: "version", type: "uint256" },
      { name: "timestamp", type: "uint256" },
      { name: "parentTransactionHash", type: "bytes32" },
      { name: "parentTransactionBlockNumber", type: "uint256" },
      { name: "parentTransactionMessageHash", type: "uint256" },
      { name: "message", type: "string" },
      { name: "messageHash", type: "uint256" },
      { name: "previousReplyTransactionHash", type: "bytes32" },
      { name: "tags", type: "bytes32[]" }
    ],
    name: "reply",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
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
    inputs: [{ name: "parentTransactionHash", type: "bytes32" }],
    name: "getCurrentReplyInfo",
    outputs: [{ name: "", type: "uint256[2]" }],
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
    constant: false,
    inputs: [
      { name: "version", type: "uint256" },
      { name: "timestamp", type: "uint256" },
      { name: "parentTransactionHash", type: "bytes32" },
      { name: "parentTransactionBlockNumber", type: "uint256" },
      { name: "parentTransactionMessageHash", type: "uint256" },
      { name: "message", type: "string" },
      { name: "messageHash", type: "uint256" },
      { name: "previousReplyTransactionHash", type: "bytes32" },
      { name: "tags", type: "bytes32[]" }
    ],
    name: "repostAndReply",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
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
    inputs: [{ name: "userAddress", type: "address" }],
    name: "dislikeUser",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
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
    name: "setMetaDataJSONStringValue",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "", type: "bytes32" }, { name: "", type: "uint256" }],
    name: "currentReplyInfoMap",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
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
      { name: "parentTransactionHash", type: "bytes32" },
      { name: "parentTransactionBlockNumber", type: "uint256" },
      { name: "parentTransactionMessageHash", type: "uint256" },
      { name: "previousFeedTransactionHash", type: "bytes32" },
      { name: "tags", type: "bytes32[]" }
    ],
    name: "repost",
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
    inputs: [{ name: "", type: "address" }, { name: "", type: "uint256" }],
    name: "userState",
    outputs: [{ name: "", type: "uint256" }],
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
    constant: false,
    inputs: [{ name: "tag", type: "bytes32" }],
    name: "reportTag",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
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
    inputs: [{ name: "tag", type: "bytes32" }],
    name: "likeTag",
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
    constant: false,
    inputs: [
      { name: "version", type: "uint256" },
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
    constant: false,
    inputs: [{ name: "userAddress", type: "address" }],
    name: "likeUser",
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
    name: "PostEvent",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "previousTagInfoByTime", type: "uint256[2]" },
      { indexed: false, name: "tag", type: "bytes32" }
    ],
    name: "SavePreviousTagInfoByTimeEvent",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "previousTagInfoByTrend", type: "uint256[2]" },
      { indexed: false, name: "tag", type: "bytes32" }
    ],
    name: "SavePreviousTagInfoByTrendEvent",
    type: "event"
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
    name: "RepostEvent",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "previousReplyInfo", type: "uint256[2]" }],
    name: "ReplyEvent",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "previousFeedTransactionInfo",
        type: "uint256[2]"
      },
      { indexed: false, name: "previousReplyInfo", type: "uint256[2]" }
    ],
    name: "RepostAndReplyEvent",
    type: "event"
  }
];
export const contractAddress = "0xfb6bc1679704aa014d880263192507958ee4327f";

export const abiArrayJSONString = JSON.stringify(abiArray);
