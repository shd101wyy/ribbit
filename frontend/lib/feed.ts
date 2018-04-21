import { Summary, formatDate } from "./utility";
import {
  TransactionInfo,
  getTransactionCreationTimestamp
} from "./transaction";
import { UserInfo } from "./user";

export interface FeedInfo {
  summary: Summary;
  transactionInfo: TransactionInfo;
  userInfo: UserInfo;
}

export function formatFeedCreationTime(feedInfo: FeedInfo) {
  return formatDate(getTransactionCreationTimestamp(feedInfo.transactionInfo));
}
