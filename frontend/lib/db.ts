// Design not done.

export interface dbFeed {
  _id: string;
  creation: number;
  from: string;
  transactionHash: string;
  blockNumber: number;
  message: string;
  parentTransactionHash?: string;
  previousTransactionHash?: string;
}

export interface dbConfig {
  followingPeople: string[]; // array of address
  followingTopics: string[]; // uncompressed
}
