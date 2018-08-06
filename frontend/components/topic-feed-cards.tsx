import * as React from "react";
import { Ribbit, UserInfo } from "../lib/ribbit";
import { FeedInfo, generateFeedInfoFromTransactionInfo } from "../lib/feed";
import FeedCard from "../components/feed-card";
import { I18n } from "react-i18next";
import i18n from "../i18n/i18n";

interface CurrentFeed {
  creation: number;
  blockNumber: number;
}

enum TopicSorting {
  ByTrend,
  ByTime
}

interface Props {
  ribbit: Ribbit;
  topic: string;
  areReplies?: boolean;
}

interface State {
  feeds: FeedInfo[];
  loading: boolean;
  doneLoadingAll: boolean;
  msg: string;
}

export default class TopicFeedCards extends React.Component<Props, State> {
  private currentFeed: CurrentFeed;
  constructor(props: Props) {
    super(props);
    this.state = {
      feeds: [],
      loading: false,
      doneLoadingAll: false,
      msg: ""
    };
  }

  componentDidMount() {
    this.initializeTopic(this.props.topic);
    this.bindWindowScrollEvent();
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.topic !== this.props.topic) {
      this.initializeTopic(newProps.topic);
      this.bindWindowScrollEvent();
    }
  }

  async initializeTopic(topic: string) {
    // check following or not
    this.setState(
      {
        feeds: []
      },
      () => {
        this.showTopic(topic);
      }
    );
  }

  async showTopic(topic: string) {
    const ribbit = this.props.ribbit;
    let blockNumber;
    blockNumber = parseInt(
      await ribbit.contractInstance.methods
        .getCurrentTagInfoByTrend(ribbit.formatTag(topic))
        .call()
    );

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
          (blockNumber, index, total) => {
            if (index >= 0) {
              this.setState({
                msg: i18n.t("notification/Syncing-block-from-blockchain", {
                  index: index + 1,
                  total,
                  blockNumber
                })
              });
            } else {
              this.setState({
                msg: i18n.t("notification/Syncing-block-from-database", {
                  blockNumber
                })
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
              x.name === "SavePreviousTagInfoByTrendEvent" &&
              x.events["tag"].value === formattedTag
          )[0];
          let blockNumber;
          if (eventLog) {
            blockNumber = parseInt(eventLog.events["previousTagInfoBN"].value);
          } else {
            blockNumber = transactionInfo.blockNumber;
          }
          this.currentFeed = {
            blockNumber,
            creation:
              blockNumber === this.currentFeed.blockNumber
                ? transactionInfo.creation
                : Date.now()
          };

          const feedInfo = await generateFeedInfoFromTransactionInfo(
            ribbit,
            transactionInfo
          );

          const feeds = this.state.feeds;
          if (
            feedInfo.feedType === "upvote"
          ) {
            // filter out existing content
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
          if (
            !find
          ) {
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
      const container = document.querySelector(
        ".topic-cards"
      ) as HTMLDivElement;

      if (
        container &&
        container.offsetHeight < scrollTop + 1.4 * offsetHeight
      ) {
        this.showTopicFeeds();
      }
    }
  };

  render() {
    return (
      <I18n>
        {(t, { i18n }) => (
          <div className="topic-cards">
            {// no replies
            this.state.doneLoadingAll &&
            this.state.feeds.length === 0 ? null : null}
            <div className="cards">
              {this.state.feeds.map((feedInfo, index) => (
                <FeedCard
                  key={index}
                  feedInfo={feedInfo}
                  ribbit={this.props.ribbit}
                  hideParent={this.props.areReplies}
                />
              ))}
              <p id="feed-footer">
                {" "}
                {this.state.loading
                  ? this.state.msg
                  : this.props.areReplies
                    ? t("general/No-more-replies")
                    : t("general/No-more-feeds")}{" "}
              </p>
            </div>
          </div>
        )}
      </I18n>
    );
  }
}
