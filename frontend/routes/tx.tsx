import * as React from "react";

import ArticleCard from "../components/article-card";

import { User, UserInfo, decodeMethod } from "../lib/user";
import { decompressString } from "../lib/utility";
import { TransactionInfo } from "../lib/transaction";
import { generateSummaryFromHTML, FeedInfo } from "../lib/feed";
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
      feedInfo: null,
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
        console.log(transaction, decodedInputData);
        let transactionInfo = Object.assign(transaction as object, {
          decodedInputData
        }) as TransactionInfo;
        const feedType = decodedInputData.name;

        // same as the one in profile.tsx
        let message, summary, userInfo, repostUserInfo;
        if (feedType === "post") {
          message = decompressString(
            transactionInfo.decodedInputData.params["message"].value
          );

          summary = await generateSummaryFromHTML(
            renderMarkdown(message),
            this.props.user
          );

          userInfo = await this.props.user.getUserInfo(transaction.from);
        } else if (feedType === "upvote") {
          // Get parent transactionInfo
          transactionInfo = await this.props.user.getTransactionInfo(
            "",
            parseInt(
              transactionInfo.decodedInputData.params[
                "parentTransactionBlockNumber"
              ].value
            ),
            new BigNumber(
              transactionInfo.decodedInputData.params[
                "parentTransactionMessageHash"
              ].value
            ).toString(16),
            transactionInfo.decodedInputData.params["parentTransactionHash"]
              .value
          );

          // who reposts the feed
          repostUserInfo = await this.props.user.getUserInfo(transaction.from);

          // author of the original feed
          userInfo = await this.props.user.getUserInfo(transactionInfo.from);

          message = decompressString(
            transactionInfo.decodedInputData.params["message"].value
          );

          summary = await generateSummaryFromHTML(
            renderMarkdown(message),
            this.props.user
          );
        } else {
          throw "Invalid feed type: " + feedType;
        }

        const stateInfo = await this.props.user.getFeedStateInfo(
          transactionInfo.hash
        );
        const feedInfo = {
          summary,
          transactionInfo,
          userInfo,
          stateInfo,
          feedType,
          repostUserInfo
        };
        this.setState({
          feedInfo
        });
      }
    } catch (error) {
      this.setState({
        msg: error.toString()
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
