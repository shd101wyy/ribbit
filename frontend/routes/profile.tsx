/**
 * /:networkId/profile/:userAddress
 */

import * as React from "react";
import { User, UserInfo } from "../lib/user";
import { FeedInfo, generateSummaryFromHTML } from "../lib/feed";
import { decompressString } from "../lib/utility";
import { renderMarkdown } from "../lib/markdown";
import FeedCard from "../components/feed-card";
import ProfileCard from "../components/profile-card";
import { BigNumber } from "bignumber.js";

interface Props {
  user: User;
  networkId: number;
  guestUserAddress: string;
}
interface State {
  userInfo: UserInfo;
  feeds: FeedInfo[];
  loading: boolean;
}

export default class profile extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      userInfo: null,
      feeds: [],
      loading: false
    };
  }

  componentDidMount() {
    this.initializeUser(this.props.guestUserAddress);
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.guestUserAddress !== this.props.guestUserAddress) {
      this.initializeUser(newProps.guestUserAddress);
    }
  }

  async initializeUser(userAddress: string) {
    const userInfo = await this.props.user.getUserInfo(userAddress);
    this.setState(
      {
        userInfo
      },
      () => {
        this.showUserFeeds(userAddress);
      }
    );
  }

  async showUserFeeds(userAddress: string) {
    this.setState({ loading: true }, () => {
      this.props.user.getFeedsFromUser(
        userAddress,
        { num: -1 },
        async (done, offset, transactionInfo) => {
          // console.log("showUserFeeds: ", done, offset, transactionInfo);
          if (done) {
            return this.setState({ loading: false });
          }
          const feedType = transactionInfo.decodedInputData.name;

          let message, summary, userInfo, repostUserInfo;
          if (feedType === "post") {
            message = decompressString(
              transactionInfo.decodedInputData.params["message"].value
            );

            summary = await generateSummaryFromHTML(
              renderMarkdown(message),
              this.props.user
            );

            userInfo = await this.props.user.getUserInfo(userAddress);
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
            repostUserInfo = await this.props.user.getUserInfo(userAddress);

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

          const feeds = this.state.feeds;
          const feedInfo = {
            summary,
            transactionInfo,
            userInfo,
            stateInfo,
            feedType,
            repostUserInfo
          };
          console.log("render feed: ", offset, feedInfo);
          feeds.push(feedInfo);
          this.forceUpdate();
        }
      );
    });
  }

  render() {
    const userInfo = this.state.userInfo;
    if (!userInfo) {
      return (
        <div className="profile-page">
          Loading user {this.props.guestUserAddress} profile...
        </div>
      );
    }
    return (
      <div className="profile-page">
        <div className="container">
          <ProfileCard userInfo={this.state.userInfo} />
          <div className="cards">
            {this.state.feeds.map((feedInfo, index) => (
              <FeedCard
                key={index}
                feedInfo={feedInfo}
                user={this.props.user}
              />
            ))}
            <p id="feed-footer">
              {" "}
              {this.state.loading ? "Loading..." : "No more feeds ;)"}{" "}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
