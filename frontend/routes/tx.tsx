import * as React from "react";

import ArticleCard from "../components/article-card";

import { User, UserInfo, decodeMethod } from "../lib/user";
import { decompressString } from "../lib/utility";
import { TransactionInfo } from "../lib/transaction";
import {
  generateSummaryFromHTML,
  FeedInfo,
  generateFeedInfoFromTransactionInfo
} from "../lib/feed";
import { renderMarkdown } from "../lib/markdown";

interface Props {
  user: User;
  networkId: number;
  transactionHash: string;
}

interface State {
  msg: string;
  feedInfo: FeedInfo;
}

export default class Tx extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      msg: `Loading ${this.props.transactionHash}...`,
      feedInfo: null
    };
  }

  componentDidMount() {
    this.analyzeTransaction();
  }

  async analyzeTransaction() {
    const transactionHash = this.props.transactionHash;
    const user = this.props.user;
    try {
      const transaction = await user.web3.eth.getTransaction(transactionHash);
      const decodedInputData = decodeMethod(transaction.input);
      if (!decodedInputData || Object.keys(decodedInputData).length === 0) {
        this.setState({
          msg: `Invalid transaction ${transactionHash}`
        });
      } else {
        let transactionInfo = Object.assign(transaction as object, {
          decodedInputData
        }) as TransactionInfo;
        try {
          const feedInfo = await generateFeedInfoFromTransactionInfo(
            user,
            transactionInfo
          );
          if (feedInfo) {
            this.setState({ feedInfo });
          }
        } catch (error) {
          console.log(error);
          this.setState({
            msg: `Invalid transaction ${transactionHash}`
          });
        }
      }
    } catch (error) {
      console.log(error);
      this.setState({
        msg: `Invalid transaction ${transactionHash}`
      });
    }
  }

  render() {
    if (!this.state.feedInfo) {
      return (
        <div className="tx-page">
          <p id="feed-footer">{this.state.msg}</p>
        </div>
      );
    }
    return (
      <div className="tx-page">
        <ArticleCard user={this.props.user} feedInfo={this.state.feedInfo} />
      </div>
    );
  }
}
