/**
 * /:networkId/topic/:topic
 */

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

interface Props {
  user: User;
  networkId: number;
  topic: string;
}
interface State {
  feeds: FeedInfo[];
  loading: boolean;
  sorting: TopicSorting;
  cover: string;
}

enum TopicSorting {
  ByTrend,
  ByTime
}

export default class profile extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      feeds: [],
      loading: false,
      sorting: TopicSorting.ByTrend,
      cover: null
    };
  }

  componentDidMount() {
    this.initializeTopic(this.props.topic);
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.topic !== this.props.topic) {
      this.initializeTopic(newProps.topic);
    }
  }

  async initializeTopic(topic: string) {
    this.showTopicFeeds(topic);
  }

  async showTopicFeeds(topic: string) {
    const sorting = this.state.sorting;
    this.setState({ loading: true }, () => {
      const fn = (sorting === TopicSorting.ByTrend
        ? this.props.user.getFeedsFromTagByTrend
        : this.props.user.getFeedsFromTagByTime
      ).bind(this.props.user);
      fn(topic, { num: -1 }, async (done, offset, transactionInfo) => {
        console.log(done, offset, transactionInfo);
        if (done) {
          return this.setState({ loading: false });
        }
        const message = decompressString(
          transactionInfo.decodedInputData.params[2].value
        );

        const summary = await generateSummaryFromHTML(
          renderMarkdown(message),
          this.props.user
        );

        const userInfo = await this.props.user.getUserInfo(
          transactionInfo.from
        );

        const stateInfo = await this.props.user.getFeedStateInfo(
          transactionInfo.hash
        );

        const feeds = this.state.feeds;
        feeds.push({
          summary,
          transactionInfo,
          userInfo,
          stateInfo
        });
        if (offset === 0 && sorting === TopicSorting.ByTrend) {
          this.setState({
            cover: userInfo.cover
          });
        } else {
          this.forceUpdate();
        }
      });
    });
  }

  selectSorting = (sorting: TopicSorting) => {
    return event => {
      this.setState(
        {
          sorting,
          feeds: []
        },
        () => {
          this.showTopicFeeds(this.props.topic);
        }
      );
    };
  };

  render() {
    /**
     * Prevent from loading user address as topic.
     */
    if (this.props.user.web3.utils.isAddress(this.props.topic)) {
      return (
        <div className="topic-page">
          <p id="feed-footer">Invalid topic {this.props.topic}</p>
        </div>
      );
    }
    return (
      <div className="topic-page">
        <div className="container">
          <div className="topic-card card">
            <div
              className="cover"
              style={{
                backgroundImage: this.state.cover
                  ? `url("${this.state.cover}")`
                  : null
              }}
            />
            <p className="title">#{this.props.topic}</p>
            <div className="btn-group">
              <div
                className={
                  "btn" +
                  (this.state.sorting === TopicSorting.ByTrend
                    ? " selected"
                    : "")
                }
                onClick={this.selectSorting(TopicSorting.ByTrend)}
              >
                <i className="fas fa-fire" />By trend
              </div>
              <div
                className={
                  "btn" +
                  (this.state.sorting === TopicSorting.ByTime
                    ? " selected"
                    : "")
                }
                onClick={this.selectSorting(TopicSorting.ByTime)}
              >
                <i className="fas fa-clock" />By time
              </div>
            </div>
          </div>
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
