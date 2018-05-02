// Smart contract information
export const abiArray = [
  {
    constant: true,
    inputs: [
      {
        name: "authorAddress",
        type: "address"
      }
    ],
    name: "getCurrentFeedInfo",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "userAddress",
        type: "address"
      }
    ],
    name: "downvoteUser",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "bytes32"
      }
    ],
    name: "currentTagInfoByTimeMap",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_upvoteBar",
        type: "uint256"
      }
    ],
    name: "setUpvoteBar",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "address"
      }
    ],
    name: "addressToAccountNoMap",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "transactionHash",
        type: "bytes32"
      }
    ],
    name: "report",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "address"
      }
    ],
    name: "addressToUsernameMap",
    outputs: [
      {
        name: "",
        type: "bytes32"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "transactionHash",
        type: "bytes32"
      },
      {
        name: "field",
        type: "uint256"
      }
    ],
    name: "getState",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "addr",
        type: "address"
      }
    ],
    name: "getAccountNoFromAddress",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "bytes32"
      },
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "state",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "tag",
        type: "bytes32"
      },
      {
        name: "field",
        type: "uint256"
      }
    ],
    name: "getTagState",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "value",
        type: "string"
      }
    ],
    name: "setMetadataJSONStringValue",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "userAddress",
        type: "address"
      }
    ],
    name: "reportUser",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "timestamp",
        type: "uint256"
      },
      {
        name: "message",
        type: "string"
      },
      {
        name: "tags",
        type: "bytes32[]"
      }
    ],
    name: "post",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "address"
      }
    ],
    name: "metadataJSONStringMap",
    outputs: [
      {
        name: "",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "version",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_donationBar",
        type: "uint256"
      }
    ],
    name: "setDonationBar",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "username",
        type: "bytes32"
      },
      {
        name: "value",
        type: "string"
      }
    ],
    name: "setUsernameAndMetadataJSONString",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "developerIncomePercent",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "getAccountsNum",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "upvoteBar",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "timestamp",
        type: "uint256"
      },
      {
        name: "parentTransactionHash",
        type: "bytes32"
      },
      {
        name: "tags",
        type: "bytes32[]"
      },
      {
        name: "authorAddress",
        type: "address"
      }
    ],
    name: "upvote",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "previousContract",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "bytes32"
      }
    ],
    name: "usernameToAddressMap",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "tag",
        type: "bytes32"
      }
    ],
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
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "timestamp",
        type: "uint256"
      },
      {
        name: "parentTransactionHash",
        type: "bytes32"
      },
      {
        name: "message",
        type: "string"
      },
      {
        name: "tags",
        type: "bytes32[]"
      },
      {
        name: "mode",
        type: "uint8"
      },
      {
        name: "authorAddress",
        type: "address"
      }
    ],
    name: "reply",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "from",
        type: "address"
      },
      {
        name: "to",
        type: "address"
      }
    ],
    name: "transferAccount",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "tag",
        type: "bytes32"
      }
    ],
    name: "downvoteTag",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "userAddress",
        type: "address"
      },
      {
        name: "field",
        type: "uint256"
      }
    ],
    name: "getUserState",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "accountsNum",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "donationBar",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "address"
      },
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "userState",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "tag",
        type: "bytes32"
      }
    ],
    name: "reportTag",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "addr",
        type: "address"
      }
    ],
    name: "getMetadataJSONStringValue",
    outputs: [
      {
        name: "",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "bytes32"
      },
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "tagState",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "userAddress",
        type: "address"
      }
    ],
    name: "upvoteUser",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "address"
      }
    ],
    name: "currentFeedInfoMap",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "addr",
        type: "address"
      }
    ],
    name: "getUsernameFromAddress",
    outputs: [
      {
        name: "",
        type: "bytes32"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "tag",
        type: "bytes32"
      }
    ],
    name: "getCurrentTagInfoByTime",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "accountNoToAddressMap",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "n",
        type: "uint256"
      }
    ],
    name: "getAddressFromAccountNo",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "bytes32"
      }
    ],
    name: "currentTagInfoByTrendMap",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "tag",
        type: "bytes32"
      }
    ],
    name: "getCurrentTagInfoByTrend",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "addr",
        type: "address"
      }
    ],
    name: "transferOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "transactionHash",
        type: "bytes32"
      }
    ],
    name: "downvote",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "username",
        type: "bytes32"
      }
    ],
    name: "getAddressFromUsername",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_percent",
        type: "uint256"
      }
    ],
    name: "setDeveloperIncomePercent",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "_previousContractAddress",
        type: "address"
      },
      {
        name: "_version",
        type: "uint256"
      },
      {
        name: "_developerIncomePercent",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "previousFeedInfoBN",
        type: "uint256"
      }
    ],
    name: "SavePreviousFeedInfoEvent",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "previousTagInfoBN",
        type: "uint256"
      },
      {
        indexed: false,
        name: "tag",
        type: "bytes32"
      }
    ],
    name: "SavePreviousTagInfoByTimeEvent",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "previousTagInfoBN",
        type: "uint256"
      },
      {
        indexed: false,
        name: "tag",
        type: "bytes32"
      }
    ],
    name: "SavePreviousTagInfoByTrendEvent",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "value",
        type: "uint256"
      }
    ],
    name: "DonateEvent",
    type: "event"
  }
];

export function getContractAddress(networkId: number) {
  if (networkId === 3) {
    // Ropsten
    return "0x14b80f4c8a8d0c6e52e033616f3e5d8c4b5bc5be";
  } else if (networkId === 1) {
    // mainnet
    return null;
  } else {
    return null;
  }
}

export const abiArrayJSONString = JSON.stringify(abiArray);
