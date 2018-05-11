import * as React from "react";
import { I18n } from "react-i18next";

import Header, { Page } from "../components/header";
import FeedCard from "../components/feed-card";
import { Ribbit, UserInfo } from "../lib/ribbit";
import { checkUserRegistration } from "../lib/utility";
import {
  FeedInfo,
  Summary,
  generateSummaryFromHTML,
  generateFeedInfoFromTransactionInfo
} from "../lib/feed";
import { renderMarkdown } from "../lib/markdown";

interface CurrentFeed {
  creation: number;
  blockNumber: number;
}

interface Props {
  ribbit: Ribbit;
}
interface State {
  feeds: FeedInfo[];
  loading: boolean;
  doneLoadingAll: boolean;
  msg: string;
}

export default class Notifications extends React.Component<Props, State> {
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
    const ribbit = this.props.ribbit;
    document.body.scrollTop = 0;
    checkUserRegistration(ribbit);
    this.showUserNotifications(ribbit);
    this.bindWindowScrollEvent();
  }

  componentWillReceiveProps(newProps: Props) {
    const ribbit = this.props.ribbit;
    document.body.scrollTop = 0;
    checkUserRegistration(ribbit);
    this.showUserNotifications(ribbit);
    this.bindWindowScrollEvent();
  }

  componentWillUnmount() {
    // TODO: Stop loading notifications
  }

  async showUserNotifications(ribbit: Ribbit) {
    const blockNumber = parseInt(
      await ribbit.contractInstance.methods
        .getCurrentTagInfoByTime(ribbit.formatTag(ribbit.accountAddress))
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
        this.showNotificationFeeds();
      }
    );
  }

  async showNotificationFeeds() {
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
        const formattedTag = ribbit.formatTag(ribbit.accountAddress);
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
              x.name === "SavePreviousTagInfoByTimeEvent" &&
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
        this.showNotificationFeeds();
      }
    }
  };

  render() {
    return (
      <I18n>
        {t => (
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
