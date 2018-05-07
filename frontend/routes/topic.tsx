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
import Header from "../components/header";
import { TransactionInfo } from "../lib/transaction";

interface CurrentFeed {
  creation: number;
  blockNumber: number;
}

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
  doneLoadingAll: boolean;
  msg: string;
}

enum TopicSorting {
  ByTrend,
  ByTime
}

export default class profile extends React.Component<Props, State> {
  private currentFeed: CurrentFeed;
  constructor(props: Props) {
    super(props);
    this.state = {
      feeds: [],
      loading: false,
      doneLoadingAll: false,
      sorting: TopicSorting.ByTrend,
      cover: null,
      following: true,
      mouseOver: false,
      msg: ""
    };
  }

  componentDidMount() {
    this.initializeTopic(this.props.topic);
    this.bindWindowScrollEvent();
  }

  componentWillReceiveProps(newProps: Props) {
    // if (newProps.topic !== this.props.topic) {
    this.initializeTopic(newProps.topic);
    this.bindWindowScrollEvent();
    // }
  }

  async initializeTopic(topic: string) {
    // check following or not
    const followingTopics = this.props.ribbit.settings.followingTopics;
    const following = !!followingTopics.filter(x => x.topic === topic).length;
    this.setState({
      following,
      feeds: []
    });

    this.showTopic(topic);
  }

  async showTopic(topic: string) {
    const ribbit = this.props.ribbit;
    let blockNumber;
    if (this.state.sorting === TopicSorting.ByTrend) {
      blockNumber = parseInt(
        await ribbit.contractInstance.methods
          .getCurrentTagInfoByTrend(ribbit.formatTag(topic))
          .call()
      );
    } else {
      blockNumber = parseInt(
        await ribbit.contractInstance.methods
          .getCurrentTagInfoByTime(ribbit.formatTag(topic))
          .call()
      );
    }
    console.log("Show topic: ", blockNumber);

    this.currentFeed = {
      blockNumber,
      creation: Date.now()
    };
    this.setState(
      {
        loading: false,
        doneLoadingAll: false,
        feeds: []
      },
      () => {
        this.showTopicFeeds();
      }
    );
  }

  async showTopicFeeds() {
    const topic = this.props.topic;
    const ribbit = this.props.ribbit;
    const sorting = this.state.sorting;
    if (!this.currentFeed || !this.currentFeed.blockNumber) {
      return this.setState({
        loading: false,
        doneLoadingAll: true
      });
    }
    if (this.state.loading) {
      return;
    }
    this.setState(
      {
        loading: true
      },
      async () => {
        const formattedTag = ribbit.formatTag(topic);
        const transactionInfo = await ribbit.getTransactionInfo(
          {
            tag: formattedTag,
            maxCreation: this.currentFeed.creation,
            blockNumber: this.currentFeed.blockNumber
          },
          (blockNumber, index) => {
            if (index >= 0) {
              this.setState({
                msg: `Syncing No. ${index} at block ${blockNumber} from blockchain...`
              });
            } else {
              this.setState({
                msg: `Syncing block ${blockNumber} from database...`
              });
            }
          }
        );
        if (!transactionInfo) {
          return this.setState({
            loading: false,
            doneLoadingAll: true
          });
        } else {
          const eventLog = transactionInfo.decodedLogs.filter(
            x =>
              x.name ===
                (sorting === TopicSorting.ByTime
                  ? "SavePreviousTagInfoByTimeEvent"
                  : "SavePreviousTagInfoByTrendEvent") &&
              x.events["tag"].value === formattedTag
          )[0];
          const blockNumber = parseInt(
            eventLog.events["previousTagInfoBN"].value
          );
          this.currentFeed = {
            blockNumber,
            creation: transactionInfo.creation
          };

          const feedInfo = await generateFeedInfoFromTransactionInfo(
            ribbit,
            transactionInfo
          );

          const feeds = this.state.feeds;
          if (
            sorting === TopicSorting.ByTrend &&
            feedInfo.feedType === "upvote"
          ) {
            // filter out existing content
            let find = false;
            feedInfo.feedType = "post";
            feedInfo.repostUserInfo = null;
          }

          let find = false;
          for (const displayedFeedInfo of feeds) {
            if (
              displayedFeedInfo.transactionInfo.hash ===
              feedInfo.transactionInfo.hash
            ) {
              find = true;
              console.log("find same post");
              break;
            }
          }
          if (!find) {
            feeds.push(feedInfo);
          }

          this.setState(
            {
              feeds
            },
            () => {
              this.setState(
                {
                  loading: false
                },
                () => {
                  this.scroll();
                }
              );
            }
          );
        }
      }
    );
  }

  bindWindowScrollEvent() {
    window.onscroll = this.scroll;
  }

  scroll = () => {
    if (this.state.doneLoadingAll) {
      return;
    } else {
      const scrollTop = document.body.scrollTop;
      const offsetHeight = document.body.offsetHeight;
      const container = document.querySelector(".container") as HTMLDivElement;

      if (
        container &&
        container.offsetHeight < scrollTop + 1.4 * offsetHeight
      ) {
        this.showTopicFeeds();
      }
    }
  };

  selectSorting = (sorting: TopicSorting) => {
    return event => {
      this.setState(
        {
          sorting,
          feeds: []
        },
        () => {
          this.showTopic(this.props.topic);
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
        <Header ribbit={this.props.ribbit} />
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
              {this.state.loading ? this.state.msg : "No more feeds ;)"}{" "}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
