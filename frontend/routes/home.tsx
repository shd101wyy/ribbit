import * as React from "react";

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
import { userInfo } from "os";

enum HomePanel {
  FollowingsFeeds,
  TopicsFeeds,
  Settings,
  Notifications
}

interface HomeFeedsEntry {
  blockNumber: number;
  creation: number;
  userAddress: string;
}

interface Props {
  ribbit: Ribbit;
  networkId: number;
}
interface State {
  showEditPanel: boolean;
  msg: string;
  homeFeedsEntries: HomeFeedsEntry[]; // starting block numbers
  feeds: FeedInfo[];
  loading: boolean;
  doneLoadingAll: boolean;
  userInfo: UserInfo;
  panel: HomePanel;
  searchBoxValue: string;
}
export default class Home extends React.Component<Props, State> {
  private lastFeedCard: HTMLDivElement;

  constructor(props: Props) {
    super(props);
    this.state = {
      showEditPanel: false,
      msg: "",
      homeFeedsEntries: [],
      feeds: [],
      loading: false,
      doneLoadingAll: false,
      userInfo: null,
      panel: HomePanel.FollowingsFeeds,
      searchBoxValue: ""
    };
  }

  componentDidMount() {
    const ribbit = this.props.ribbit;
    checkUserRegistration(ribbit);
    this.updateUserInfo(ribbit);
    this.showUserHome(ribbit);
    this.bindWindowScrollEvent();
  }

  componentWillReceiveProps(newProps: Props) {
    if (this.props.ribbit !== newProps.ribbit) {
      checkUserRegistration(newProps.ribbit);
      this.updateUserInfo(newProps.ribbit);
      this.showUserHome(newProps.ribbit);
      this.bindWindowScrollEvent();
    }
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

  async showUserHome(ribbit: Ribbit) {
    if (!ribbit) return;
    // initialize homeFeedsEntries:
    const homeFeedsEntries: HomeFeedsEntry[] = [];
    // TODO: change followingUsernames to followingUsers and store their addresses instead of usernames.
    for (let i = 0; i < ribbit.settings.followingUsernames.length; i++) {
      const username = ribbit.settings.followingUsernames[i].username;
      const userAddress = await ribbit.getAddressFromUsername(username);
      if (userAddress) {
        const blockNumber = parseInt(
          await ribbit.contractInstance.methods
            .getCurrentFeedInfo(userAddress)
            .call()
        );
        homeFeedsEntries.push({
          blockNumber,
          creation: Infinity,
          userAddress
        });
      }
    }
    this.setState(
      {
        homeFeedsEntries,
        loading: false,
        doneLoadingAll: false,
        feeds: []
      },
      () => {
        this.showHomeFeeds();
      }
    );
  }

  showHomeFeeds() {
    const homeFeedsEntries = this.state.homeFeedsEntries;
    if (!homeFeedsEntries.length) {
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
        let maxBlockNumber = homeFeedsEntries[0].blockNumber;
        let maxCreation = homeFeedsEntries[0].creation;
        let maxUserAddress = homeFeedsEntries[0].userAddress;
        let maxOffset = 0;
        homeFeedsEntries.forEach((homeFeedsEntry, offset) => {
          if (
            homeFeedsEntry.blockNumber > maxBlockNumber ||
            (homeFeedsEntry.blockNumber === maxBlockNumber &&
              homeFeedsEntry.creation > maxCreation)
          ) {
            maxBlockNumber = homeFeedsEntry.blockNumber;
            maxCreation = homeFeedsEntry.creation;
            maxUserAddress = homeFeedsEntry.userAddress;
            maxOffset = offset;
          }
        });
        // console.log("showHomeFeeds", maxBlockNumber, maxCreation, maxUserAddress)
        const transactionInfo = await this.props.ribbit.getTransactionInfo({
          userAddress: maxUserAddress,
          blockNumber: maxBlockNumber
        });

        if (!transactionInfo) {
          homeFeedsEntries.splice(maxOffset, 1); // finish loading all feeds from user.
          return this.setState(
            {
              loading: false
            },
            () => {
              this.scroll();
            }
          );
        } else {
          // TODO: reply
          const eventLog = transactionInfo.decodedLogs.filter(
            x => x.name === "SavePreviousFeedInfoEvent"
          )[0];
          if (!eventLog) {
            console.log("@@@ TODO: Support reply in home feeds.");
          }
          let blockNumber = parseInt(
            eventLog.events["previousFeedInfoBN"].value
          );
          const homeFeedsEntry = homeFeedsEntries[maxOffset];
          homeFeedsEntry.blockNumber = blockNumber;
          homeFeedsEntry.creation = transactionInfo.creation;

          const feedInfo = await generateFeedInfoFromTransactionInfo(
            this.props.ribbit,
            transactionInfo
          );
          const feeds = this.state.feeds;
          feeds.push(feedInfo);
          this.setState(
            {
              feeds,
              homeFeedsEntries
            },
            () => {
              this.setState(
                {
                  loading: false
                },
                () => {
                  // this.showHomeFeeds();
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
        this.showHomeFeeds();
      }
    }
  };

  toggleEditPanel = () => {
    const { showEditPanel } = this.state;
    this.setState({ showEditPanel: !showEditPanel });
  };

  render() {
    if (this.props.ribbit && this.props.ribbit.accountAddress) {
      const ribbit = this.props.ribbit;
      return (
        <div className="home">
          <Header ribbit={this.props.ribbit} page={Page.HomePage} />
          <div className="left-panel">
            <ProfileCard
              userInfo={this.state.userInfo}
              ribbit={this.props.ribbit}
            />
            <FollowingsCard ribbit={this.props.ribbit} />
          </div>
          <div className="middle-panel">
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
          <div className="right-panel">
            <div className="post-btn-group">
              <div className="ribbit-btn btn" onClick={this.toggleEditPanel}>
                <i className="fas fa-pen-square" />Ribbit
              </div>
              <a href="https://github.com/shd101wyy/ribbit" target="_blank">
                <div className="github-btn btn">
                  <i className="fab fa-github" />
                </div>
              </a>
              <a
                href="https://github.com/shd101wyy/ribbit/issues"
                target="_blank"
              >
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
            {/* <AnnouncementCard /> */}
            <TopicsCard ribbit={this.props.ribbit} />
          </div>
          {this.state.showEditPanel ? (
            <Edit cancel={this.toggleEditPanel} ribbit={this.props.ribbit} />
          ) : null}
        </div>
      );
    } else {
      return (
        <div className="home">
          <h1 className="title is-1">
            Please make sure{" "}
            <a href="https://metamask.io/" target="_blank">
              MetaMask
            </a>{" "}
            is working in your browser.
          </h1>
        </div>
      );
    }
  }
}
