import * as React from "react";
import { Ribbit, UserInfo } from "../lib/ribbit";
import { FeedInfo, generateFeedInfoFromTransactionInfo } from "../lib/feed";
import FeedCard from "../components/feed-card";
import { I18n } from "react-i18next";

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
  sorting: TopicSorting;
  msg: string;
}

export default class TopicCards extends React.Component<Props, State> {
  private currentFeed: CurrentFeed;
  constructor(props: Props) {
    super(props);
    this.state = {
      feeds: [],
      loading: false,
      doneLoadingAll: false,
      sorting: TopicSorting.ByTime,
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
    this.setState({
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
          (blockNumber, index, total) => {
            if (index >= 0) {
              this.setState({
                msg: `Syncing ${index +
                  1}/${total} at block ${blockNumber} from blockchain...`
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

  render() {
    return (
      <I18n>
        {(t, { i18n }) => (
          <div className="topic-cards">
            <div className="btn-group card">
              <div
                className={
                  "btn" +
                  (this.state.sorting === TopicSorting.ByTrend
                    ? " selected"
                    : "")
                }
                onClick={this.selectSorting(TopicSorting.ByTrend)}
              >
                <i className="fas fa-fire" />
                {t("general/by-trend")}
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
                <i className="fas fa-clock" />
                {t("general/by-time")}
              </div>
            </div>
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
