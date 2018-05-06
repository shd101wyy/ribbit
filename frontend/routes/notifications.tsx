import * as React from "react";

import Header, { Page } from "../components/header";
import FeedCard from "../components/feed-card";
import { Ribbit, UserInfo } from "../lib/ribbit";
import {
  FeedInfo,
  Summary,
  generateSummaryFromHTML,
  generateFeedInfoFromTransactionInfo
} from "../lib/feed";
import { renderMarkdown } from "../lib/markdown";

interface Props {
  ribbit: Ribbit;
}
interface State {
  feeds: FeedInfo[];
  loading: boolean;
}

export default class Notifications extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      feeds: [],
      loading: false
    };
  }

  componentDidUpdate() {
    this.showNotificationFeeds(this.props.ribbit);
  }

  componentWillReceiveProps(newProps: Props) {
    if (
      newProps.ribbit !== this.props.ribbit ||
      newProps.ribbit.accountAddress !== this.props.ribbit.accountAddress
    ) {
      this.showNotificationFeeds(newProps.ribbit);
    }
  }

  showNotificationFeeds(ribbit: Ribbit) {
    if (!ribbit) {
      return;
    }
    this.setState({ loading: true, feeds: [] }, () => {
      ribbit.getFeedsFromTagByTime(
        ribbit.accountAddress,
        { num: -1 },
        async (done, offset, transactionInfo) => {
          console.log("showNotificationFeeds: ", done, offset, transactionInfo);
          if (done) {
            return this.setState({ loading: false });
          }
          const feedInfo = await generateFeedInfoFromTransactionInfo(
            ribbit,
            transactionInfo
          );
          const feeds = this.state.feeds;
          feeds.push(feedInfo);
          this.forceUpdate();
        }
      );
    });
  }

  render() {
    return (
      <div className="notifications-page">
        <Header ribbit={this.props.ribbit} page={Page.NotificationsPage} />
        <div className="container">
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
