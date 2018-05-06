/**
 * /:networkId/profile/:username
 */

import * as React from "react";
import { Ribbit, UserInfo } from "../lib/ribbit";
import {
  FeedInfo,
  generateSummaryFromHTML,
  generateFeedInfoFromTransactionInfo
} from "../lib/feed";
import { decompressString } from "../lib/utility";
import { renderMarkdown } from "../lib/markdown";
import FeedCard from "../components/feed-card";
import ProfileCard from "../components/profile-card";
import Header from "../components/header";
import { BigNumber } from "bignumber.js";

interface Props {
  ribbit: Ribbit;
  networkId: number;
  username: string;
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
    this.initializeUser(this.props.username);
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.username !== this.props.username) {
      this.initializeUser(newProps.username);
    }
  }

  async initializeUser(username: string) {
    const userInfo = await this.props.ribbit.getUserInfoFromUsername(username);
    this.setState(
      {
        userInfo,
        feeds: []
      },
      () => {
        this.showUserFeeds(userInfo.address);
      }
    );
  }

  async showUserFeeds(userAddress: string) {
    this.setState({ loading: true }, () => {
      this.props.ribbit.getFeedsFromUser(
        userAddress,
        { num: -1 },
        async (done, offset, transactionInfo) => {
          // console.log("showUserFeeds: ", done, offset, transactionInfo);
          if (done || !transactionInfo) {
            return this.setState({ loading: false });
          }
          const feedInfo = await generateFeedInfoFromTransactionInfo(
            this.props.ribbit,
            transactionInfo
          );
          const feeds = this.state.feeds;
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
          {/* Loading user {this.props.username} profile... */}
        </div>
      );
    }
    return (
      <div className="profile-page">
        <Header ribbit={this.props.ribbit} />
        <div className="container">
          <ProfileCard
            userInfo={this.state.userInfo}
            ribbit={this.props.ribbit}
          />
          <div className="cards">
            {this.state.feeds.map((feedInfo, index) => (
              <FeedCard
                key={index}
                feedInfo={feedInfo}
                ribbit={this.props.ribbit}
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
