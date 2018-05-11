import * as React from "react";
import MediaQuery from "react-responsive";
import { I18n } from "react-i18next";

import { Ribbit, UserInfo } from "../lib/ribbit";
import {
  FeedInfo,
  Summary,
  generateSummaryFromHTML,
  generateFeedInfoFromTransactionInfo
} from "../lib/feed";

import { decompressString, checkUserRegistration } from "../lib/utility";
import { renderMarkdown } from "../lib/markdown";

import Footer from "../components/footer";
import Edit from "../components/edit";
import FeedCard from "../components/feed-card";
import ProfileCard from "../components/profile-card";
import AnnouncementCard from "../components/announcement-card";
import TopicsCard from "../components/topics-card";
import FollowingsCard from "../components/followings-card";
import ProfileSettingsCard from "../components/profile-settings-card";
import Header, { Page } from "../components/header";
import Error from "../components/error";
import { userInfo } from "os";

enum TopicSorting {
  ByTrend,
  ByTime
}

interface FeedEntry {
  blockNumber: number;
  creation: number;
  topic: string;
}

interface Props {
  ribbit: Ribbit;
  networkId: number;
}
interface State {
  showEditPanel: boolean;
  msg: string;
  feedEntries: FeedEntry[]; // starting block numbers
  feeds: FeedInfo[];
  loading: boolean;
  doneLoadingAll: boolean;
  userInfo: UserInfo;
  sorting: TopicSorting;
}
export default class Topics extends React.Component<Props, State> {
  private lastFeedCard: HTMLDivElement;

  constructor(props: Props) {
    super(props);
    this.state = {
      showEditPanel: false,
      msg: "",
      feedEntries: [],
      feeds: [],
      loading: false,
      doneLoadingAll: false,
      userInfo: null,
      sorting: TopicSorting.ByTime
    };
  }

  componentDidMount() {
    const ribbit = this.props.ribbit;
    document.body.scrollTop = 0;
    checkUserRegistration(ribbit);
    this.updateUserInfo(ribbit);
    this.showUserTopics(ribbit);
    this.bindWindowScrollEvent();
  }

  componentWillReceiveProps(newProps: Props) {
    // in order to get click in Header home tab to reload home page.
    // console.log('home will receive props')
    // if (this.props.ribbit !== newProps.ribbit) {
    document.body.scrollTop = 0;
    checkUserRegistration(newProps.ribbit);
    this.updateUserInfo(newProps.ribbit);
    this.showUserTopics(newProps.ribbit);
    this.bindWindowScrollEvent();
    // }
  }

  componentWillUnmount() {
    // TODO: Stop loading home feeds.
  }

  updateUserInfo(ribbit: Ribbit) {
    if (!ribbit) return;
    ribbit.getUserInfoFromAddress(ribbit.accountAddress).then(userInfo => {
      this.setState({
        userInfo
      });
    });
  }

  async showUserTopics(ribbit: Ribbit) {
    if (!ribbit) return;
    // initialize feedEntries:
    const feedEntries: FeedEntry[] = [];
    const creation = Date.now();
    // TODO: change followingUsernames to followingUsers and store their addresses instead of usernames.
    for (let i = 0; i < ribbit.settings.followingTopics.length; i++) {
      const topic = ribbit.settings.followingTopics[i].topic;
      if (topic) {
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
        feedEntries.push({
          blockNumber,
          creation,
          topic
        });
      }
    }
    this.setState(
      {
        feedEntries,
        loading: false,
        doneLoadingAll: false,
        feeds: []
      },
      () => {
        this.showTopicsFeeds();
      }
    );
  }

  showTopicsFeeds() {
    const feedEntries = this.state.feedEntries;
    const ribbit = this.props.ribbit;
    const sorting = this.state.sorting;
    if (!feedEntries.length) {
      return this.setState({
        loading: false,
        doneLoadingAll: true
      });
    }
    if (this.state.loading) {
      // console.log(`it's loading...`)
      return;
    }
    this.setState(
      {
        loading: true
      },
      async () => {
        let maxBlockNumber = feedEntries[0].blockNumber;
        let maxCreation = feedEntries[0].creation;
        let maxTopic = feedEntries[0].topic;
        let maxOffset = 0;
        feedEntries.forEach((homeFeedsEntry, offset) => {
          if (
            homeFeedsEntry.blockNumber > maxBlockNumber ||
            (homeFeedsEntry.blockNumber === maxBlockNumber &&
              homeFeedsEntry.creation > maxCreation)
          ) {
            maxBlockNumber = homeFeedsEntry.blockNumber;
            maxCreation = homeFeedsEntry.creation;
            maxTopic = homeFeedsEntry.topic;
            maxOffset = offset;
          }
        });
        const formattedTag = ribbit.formatTag(maxTopic);
        // console.log("showTopicsFeeds", maxBlockNumber, maxCreation, maxUserAddress)
        const transactionInfo = await ribbit.getTransactionInfo(
          {
            tag: formattedTag,
            blockNumber: maxBlockNumber,
            maxCreation: maxCreation
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
          feedEntries.splice(maxOffset, 1); // finish loading all feeds from user.
          return this.setState(
            {
              loading: false
            },
            () => {
              this.scroll();
            }
          );
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
          const feedEntry = feedEntries[maxOffset];
          feedEntry.blockNumber = blockNumber;
          feedEntry.creation = transactionInfo.creation;

          const feedInfo = await generateFeedInfoFromTransactionInfo(
            this.props.ribbit,
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
              feeds,
              feedEntries
            },
            () => {
              this.setState(
                {
                  loading: false
                },
                () => {
                  // this.showTopicsFeeds();
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
      const middlePanel = document.querySelector(
        ".middle-panel"
      ) as HTMLDivElement;

      if (
        middlePanel &&
        middlePanel.offsetHeight < scrollTop + 1.4 * offsetHeight
      ) {
        this.showTopicsFeeds();
      }
    }
  };

  toggleEditPanel = () => {
    const { showEditPanel } = this.state;
    this.setState({ showEditPanel: !showEditPanel });
  };

  selectSorting = (sorting: TopicSorting) => {
    return event => {
      this.setState(
        {
          sorting,
          feeds: []
        },
        () => {
          this.showUserTopics(this.props.ribbit);
        }
      );
    };
  };

  render() {
    if (this.props.ribbit && this.props.ribbit.accountAddress) {
      const ribbit = this.props.ribbit;
      const cards = (
        <I18n>
          {t => (
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
                {this.state.loading
                  ? this.state.msg
                  : t("general/No-more-feeds")}{" "}
              </p>
            </div>
          )}
        </I18n>
      );
      const profileCard = (
        <ProfileCard
          userInfo={this.state.userInfo}
          ribbit={this.props.ribbit}
        />
      );
      const followingsCard = <FollowingsCard ribbit={this.props.ribbit} />;
      const topicsCard = <TopicsCard ribbit={this.props.ribbit} />;
      const postBtnGroup = (
        <div className="post-btn-group">
          <div className="ribbit-btn btn" onClick={this.toggleEditPanel}>
            <i className="fas fa-pen-square" />Ribbit
          </div>
          <a href="https://github.com/shd101wyy/ribbit" target="_blank">
            <div className="github-btn btn">
              <i className="fab fa-github" />
            </div>
          </a>
          <a href="https://github.com/shd101wyy/ribbit/issues" target="_blank">
            <div className="bug-btn github-btn btn">
              <i className="fas fa-bug" />
            </div>
          </a>
          <a href="https://ethgasstation.info/" target="_blank">
            <div className="github-btn btn">
              <i className="fas fa-fire" />
            </div>
          </a>
        </div>
      );
      const topCard = (
        <I18n>
          {t => (
            <div className="top-card card">
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
            </div>
          )}
        </I18n>
      );

      return (
        <div className="home topics-page">
          <Header ribbit={this.props.ribbit} page={Page.HomePage} />
          <div className="container">
            <MediaQuery query="(max-width: 1368px)">
              <div className="left-panel">
                {profileCard}
                {postBtnGroup}
                {followingsCard}
                {topicsCard}
              </div>
              <div className="middle-panel">
                {topCard}
                {cards}
              </div>
            </MediaQuery>
            <MediaQuery query="(min-width: 1368px)">
              <div className="left-panel">
                {profileCard}
                {followingsCard}
              </div>
              <div className="middle-panel">
                {topCard}
                {cards}
              </div>
              <div className="right-panel">
                {postBtnGroup}
                {topicsCard}
              </div>
            </MediaQuery>
            {this.state.showEditPanel ? (
              <Edit cancel={this.toggleEditPanel} ribbit={this.props.ribbit} />
            ) : null}
          </div>
        </div>
      );
    } else {
      return <Error />;
    }
  }
}
