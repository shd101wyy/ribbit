/**
 * /:networkId/profile/:userAddress
 */

import * as React from "react";
import { User, UserInfo } from "../lib/user";
import { FeedInfo } from "../lib/feed";
import {
  decompressString,
  generateSummaryFromHTML,
  renderMarkdown
} from "../lib/utility";
import FeedCard from "../components/feed-card";
import ProfileCard from "../components/profile-card";

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
          if (done) {
            return this.setState({ loading: false });
          }
          const message = decompressString(
            transactionInfo.decodedInputData.params[2].value
          );

          const summary = await generateSummaryFromHTML(
            renderMarkdown(message)
          );

          const feeds = this.state.feeds;
          feeds.push({
            summary,
            transactionInfo,
            userInfo: this.state.userInfo
          });
          this.forceUpdate();
        }
      );
    });
  }

  render() {
    const userInfo = this.state.userInfo;
    if (!userInfo) {
      return (
        <div className="profile">
          Loading user {this.props.guestUserAddress} profile...
        </div>
      );
    }
    return (
      <div className="profile">
        <div className="container">
          <ProfileCard userInfo={this.state.userInfo} />
          <div className="cards">
            {this.state.feeds.map((feedInfo, index) => (
              <FeedCard key={index} feedInfo={feedInfo} />
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
