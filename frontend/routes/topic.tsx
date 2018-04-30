/**
 * /:networkId/topic/:topic
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
import { TransactionInfo } from "../lib/transaction";

interface Props {
  ribbit: Ribbit;
  networkId: number;
  topic: string;
}
interface State {
  feeds: FeedInfo[];
  loading: boolean;
  sorting: TopicSorting;
  cover: string;
  following: boolean;
  mouseOver: boolean;
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
      cover: null,
      following: true,
      mouseOver: false
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
    // check following or not
    const followingTopics = this.props.ribbit.settings.followingTopics;
    const following = !!followingTopics.filter(x => x.topic === topic).length;
    this.setState({
      following
    });

    // show feeds
    this.showTopicFeeds(topic);
  }

  async showTopicFeeds(topic: string) {
    const sorting = this.state.sorting;
    this.setState({ loading: true }, () => {
      const fn = (sorting === TopicSorting.ByTrend
        ? this.props.ribbit.getFeedsFromTagByTrend
        : this.props.ribbit.getFeedsFromTagByTime
      ).bind(this.props.ribbit);
      fn(
        topic,
        { num: -1 },
        async (
          done: boolean,
          offset: number,
          transactionInfo: TransactionInfo
        ) => {
          console.log(done, offset, transactionInfo);
          if (done) {
            return this.setState({ loading: false });
          }
          if (this.state.sorting !== sorting) {
            return;
          }

          try {
            const feedInfo = await generateFeedInfoFromTransactionInfo(
              this.props.ribbit,
              transactionInfo
            );
            const feeds = this.state.feeds;
            feeds.push(feedInfo);
            if (offset === 0 && sorting === TopicSorting.ByTrend) {
              this.setState({
                cover: feedInfo.userInfo.cover
              });
            } else {
              this.forceUpdate();
            }
          } catch (error) {
            console.log(error);
          }
        }
      );
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

  followTopic = () => {
    this.props.ribbit
      .followTopic(this.props.topic)
      .then(() => {
        this.setState({
          following: true
        });
      })
      .catch(error => {
        alert(error);
      });
  };

  unfollowTopic = () => {
    this.props.ribbit
      .unfollowTopic(this.props.topic)
      .then(() => {
        this.setState({
          following: false
        });
      })
      .catch(error => {
        alert(error);
      });
  };

  render() {
    /**
     * Prevent from loading user address as topic.
     */
    if (this.props.ribbit.web3.utils.isAddress(this.props.topic)) {
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
            {this.state.following ? (
              this.state.mouseOver ? (
                <div
                  className="follow-btn"
                  onMouseEnter={() => this.setState({ mouseOver: true })}
                  onMouseLeave={() => this.setState({ mouseOver: false })}
                  onClick={this.unfollowTopic}
                >
                  Unfollow
                </div>
              ) : (
                <div
                  className="follow-btn"
                  onMouseEnter={() => this.setState({ mouseOver: true })}
                  onMouseLeave={() => this.setState({ mouseOver: false })}
                >
                  Following
                </div>
              )
            ) : (
              <div className="follow-btn" onClick={this.followTopic}>
                Follow
              </div>
            )}
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
