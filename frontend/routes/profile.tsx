/**
 * /:networkId/profile/:username
 */

import * as React from "react";
import { I18n } from "react-i18next";
import { Ribbit, UserInfo } from "../lib/ribbit";
import {
  FeedInfo,
  generateSummaryFromHTML,
  generateFeedInfoFromTransactionInfo
} from "../lib/feed";
import { checkNetworkId } from "../lib/utility";
import { renderMarkdown } from "../lib/markdown";
import FeedCard from "../components/feed-card";
import ProfileCard from "../components/profile-card";
import Header from "../components/header";
import { BigNumber } from "bignumber.js";
import i18n from "../i18n/i18n";

interface CurrentFeed {
  creation: number;
  blockNumber: number;
}

interface Props {
  ribbit: Ribbit;
  networkId: number;
  username: string;
}
interface State {
  userInfo: UserInfo;
  feeds: FeedInfo[];
  loading: boolean;
  doneLoadingAll: boolean;
  msg: string;
}

export default class profile extends React.Component<Props, State> {
  private currentFeed: CurrentFeed;
  constructor(props: Props) {
    super(props);
    this.state = {
      userInfo: null,
      feeds: [],
      loading: false,
      doneLoadingAll: false,
      msg: ""
    };
  }

  componentDidMount() {
    checkNetworkId(this.props.ribbit, this.props.networkId);
    this.initializeUser(this.props.username);
    this.bindWindowScrollEvent();
  }

  componentWillReceiveProps(newProps: Props) {
    checkNetworkId(newProps.ribbit, newProps.networkId);
    if (newProps.username !== this.props.username) {
      this.initializeUser(newProps.username);
      this.bindWindowScrollEvent();
    }
  }

  async initializeUser(username: string) {
    const ribbit = this.props.ribbit;
    const userInfo = await this.props.ribbit.getUserInfoFromUsername(username);
    const blockNumber = parseInt(
      await ribbit.contractInstance.methods
        .getCurrentFeedInfo(userInfo.address)
        .call()
    );
    this.currentFeed = {
      blockNumber,
      creation: Date.now()
    };
    this.setState(
      {
        userInfo,
        loading: false,
        doneLoadingAll: false,
        feeds: []
      },
      () => {
        this.showUserFeeds();
      }
    );
  }

  async showUserFeeds() {
    const userInfo = this.state.userInfo;
    const userAddress = userInfo.address;
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
        const transactionInfo = await ribbit.getTransactionInfo(
          {
            userAddress,
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
            x => x.name === "SavePreviousFeedInfoEvent"
          )[0];
          let blockNumber;
          if (eventLog) {
            blockNumber = parseInt(eventLog.events["previousFeedInfoBN"].value);
          } else {
            blockNumber = transactionInfo.blockNumber;
          }
          this.currentFeed = {
            blockNumber,
            creation:  blockNumber === this.currentFeed.blockNumber ? transactionInfo.creation : Date.now()
          };

          const feedInfo = await generateFeedInfoFromTransactionInfo(
            ribbit,
            transactionInfo
          );
          const feeds = this.state.feeds;
          feeds.push(feedInfo);
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
        this.showUserFeeds();
      }
    }
  };

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
      <I18n>
        {(t, { i18n }) => (
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
                  {this.state.loading
                    ? this.state.msg
                    : t("general/No-more-feeds")}{" "}
                </p>
              </div>
            </div>
          </div>
        )}
      </I18n>
    );
  }
}
