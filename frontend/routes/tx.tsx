import * as React from "react";

import ArticleCard from "../components/article-card";
import Header from "../components/header";

import { Ribbit, UserInfo, decodeMethod } from "../lib/ribbit";
import { decompressString } from "../lib/utility";
import { TransactionInfo } from "../lib/transaction";
import {
  generateSummaryFromHTML,
  FeedInfo,
  generateFeedInfoFromTransactionInfo
} from "../lib/feed";
import { renderMarkdown } from "../lib/markdown";

interface Props {
  ribbit: Ribbit;
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
    document.body.scrollTop = 0;
    this.analyzeTransaction(
      this.props.transactionHash,
      this.props.networkId,
      this.props.ribbit
    );
  }

  componentWillReceiveProps(newProps: Props) {
    if (
      newProps.transactionHash !== this.props.transactionHash ||
      newProps.networkId !== this.props.networkId
    ) {
      document.body.scrollTop = 0;
      this.analyzeTransaction(
        newProps.transactionHash,
        newProps.networkId,
        newProps.ribbit
      );
    }
  }

  async analyzeTransaction(
    transactionHash: string,
    networkId: number,
    ribbit: Ribbit
  ) {
    try {
      const transaction = await ribbit.web3.eth.getTransaction(transactionHash);
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
            ribbit,
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
          <Header ribbit={this.props.ribbit} />
          <div className="container">
            <p id="feed-footer">{this.state.msg}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="tx-page">
        <Header ribbit={this.props.ribbit} />
        <div className="container">
          <ArticleCard
            ribbit={this.props.ribbit}
            feedInfo={this.state.feedInfo}
          />
        </div>
      </div>
    );
  }
}
