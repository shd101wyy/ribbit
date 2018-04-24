import * as React from "react";

import { User, UserInfo } from "../lib/user";
import { FeedInfo, Summary, generateSummaryFromHTML } from "../lib/feed";

import { decompressString } from "../lib/utility";
import { renderMarkdown } from "../lib/markdown";

import Footer from "../components/footer";
import Edit from "../components/edit";
import FeedCard from "../components/feed-card";
import ProfileCard from "../components/profile-card";
import AnnouncementCard from "../components/announcement-card";
import TopicsCard from "../components/topics-card";
import FollowingsCard from "../components/followings-card";
import ProfileSettingsCard from "../components/profile-settings-card";
import { userInfo } from "os";

enum HomePanel {
  FollowingsFeeds,
  TopicsFeeds,
  Settings,
  Notifications
}

interface Props {
  user: User;
  networkId: number;
}
interface State {
  showEditPanel: boolean;
  msg: string;
  feeds: FeedInfo[];
  loading: boolean;
  userInfo: UserInfo;
  panel: HomePanel;
  searchBoxValue: string;
}
export default class Home extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showEditPanel: false,
      msg: "",
      feeds: [],
      loading: false,
      userInfo: null,
      panel: HomePanel.FollowingsFeeds,
      searchBoxValue: ""
    };
  }

  componentDidMount() {
    const user = this.props.user;
    this.showUserHome(user);
  }

  componentWillReceiveProps(newProps: Props) {
    if (this.props.user !== newProps.user) {
      this.showUserHome(newProps.user);
    }
  }

  showUserHome(user: User) {
    if (!user) return;
    this.showUserFeeds(user);
    user.getUserInfo(user.accountAddress).then(userInfo => {
      this.setState({ userInfo });
    });
  }

  showUserFeeds(user: User) {
    if (!user) {
      return;
    }
    this.setState({ loading: true }, () => {
      user.getFeedsFromUser(
        user.accountAddress,
        { num: -1 },
        async (done, offset, transactionInfo) => {
          if (done) {
            return this.setState({ loading: false });
          }
          const message = decompressString(
            transactionInfo.decodedInputData.params[2].value
          );
          // console.log(message);
          const summary = await generateSummaryFromHTML(
            renderMarkdown(message),
            this.props.user
          );

          const userInfo = await user.getUserInfo(transactionInfo.from);

          const stateInfo = await user.getFeedStateInfo(transactionInfo.hash);

          const feeds = this.state.feeds;
          feeds.push({
            summary,
            transactionInfo,
            userInfo,
            stateInfo
          });
          this.forceUpdate();
        }
      );
    });
  }

  showNotificationFeeds(user: User) {
    if (!user) {
      return;
    }
    this.setState({ loading: true }, () => {
      user.getFeedsFromTagByTime(
        user.accountAddress,
        { num: -1 },
        async (done, offset, transactionInfo) => {
          if (done) {
            return this.setState({ loading: false });
          }
          const message = decompressString(
            transactionInfo.decodedInputData.params[2].value
          );
          // console.log(message);
          const summary = await generateSummaryFromHTML(
            renderMarkdown(message),
            this.props.user
          );

          const userInfo = await user.getUserInfo(transactionInfo.from);

          const stateInfo = await user.getFeedStateInfo(transactionInfo.hash);

          const feeds = this.state.feeds;
          feeds.push({
            summary,
            transactionInfo,
            userInfo,
            stateInfo
          });
          this.forceUpdate();
        }
      );
    });
  }

  toggleEditPanel = () => {
    const { showEditPanel } = this.state;
    this.setState({ showEditPanel: !showEditPanel });
  };

  switchPanel = (panel: HomePanel) => {
    return event => {
      this.setState(
        {
          panel,
          feeds: []
        },
        () => {
          if (panel === HomePanel.FollowingsFeeds) {
            this.showUserFeeds(this.props.user);
          } else if (panel === HomePanel.Notifications) {
            this.showNotificationFeeds(this.props.user);
          }
        }
      );
    };
  };

  searchBoxKeydown = event => {
    const searchValue = this.state.searchBoxValue.trim();
    if (!searchValue.length) {
      return;
    }
    if (event.which === 13) {
      // enter key
      if (this.props.user.web3.utils.isAddress(this.state.searchBoxValue)) {
        window.open(
          `${window.location.pathname}#/${
            this.props.user.networkId
          }/profile/${searchValue}`,
          "_blank"
        );
      } else {
        window.open(
          `${window.location.pathname}#/${
            this.props.user.networkId
          }/topic/${encodeURIComponent(searchValue)}`,
          "_blank"
        );
      }
    }
  };

  render() {
    let middlePanel = null;
    if (this.state.panel === HomePanel.FollowingsFeeds) {
      middlePanel = (
        <div className="cards">
          {this.state.feeds.map((feedInfo, index) => (
            <FeedCard key={index} feedInfo={feedInfo} user={this.props.user} />
          ))}
          <p id="feed-footer">
            {" "}
            {this.state.loading ? "Loading..." : "No more feeds ;)"}{" "}
          </p>
        </div>
      );
    } else if (this.state.panel === HomePanel.Settings) {
      middlePanel = (
        <div className="settings-panel">
          <ProfileSettingsCard user={this.props.user} />
        </div>
      );
    } else if (this.state.panel === HomePanel.Notifications) {
      middlePanel = (
        <div className="cards">
          {this.state.feeds.map((feedInfo, index) => (
            <FeedCard key={index} feedInfo={feedInfo} user={this.props.user} />
          ))}
          <p id="feed-footer">
            {" "}
            {this.state.loading ? "Loading..." : "No more feeds ;)"}{" "}
          </p>
        </div>
      );
    }

    if (this.props.user && this.props.user.accountAddress) {
      const user = this.props.user;
      return (
        <div className="home">
          <div className="left-panel">
            <ProfileCard userInfo={this.state.userInfo} />
            <FollowingsCard
              user={this.props.user}
              networkId={this.props.networkId}
            />
          </div>
          <div className="middle-panel">
            <div className="top-bar card">
              <div className="search-box-wrapper">
                <input
                  className="search-box"
                  placeholder={
                    "Enter user address here or the topic that you are interested to start searching"
                  }
                  value={this.state.searchBoxValue}
                  onChange={event => {
                    this.setState({ searchBoxValue: event.target.value });
                  }}
                  onKeyDown={this.searchBoxKeydown}
                />
              </div>
              <div className="icon-groups">
                <i
                  className={
                    "icon fas fa-home" +
                    (this.state.panel === HomePanel.FollowingsFeeds
                      ? " selected"
                      : "")
                  }
                  onClick={this.switchPanel(HomePanel.FollowingsFeeds)}
                />
                <i
                  className={
                    "icon fab fa-slack-hash" +
                    (this.state.panel === HomePanel.TopicsFeeds
                      ? " selected"
                      : "")
                  }
                  onClick={this.switchPanel(HomePanel.TopicsFeeds)}
                />
                <i
                  className={
                    "icon fas fa-bell" +
                    (this.state.panel === HomePanel.Notifications
                      ? " selected"
                      : "")
                  }
                  onClick={this.switchPanel(HomePanel.Notifications)}
                />
                <i
                  className={
                    "icon fas fa-cog" +
                    (this.state.panel === HomePanel.Settings ? " selected" : "")
                  }
                  onClick={this.switchPanel(HomePanel.Settings)}
                />
              </div>
            </div>
            {middlePanel}
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
            </div>
            {/* <AnnouncementCard /> */}
            <TopicsCard networkId={this.props.networkId} />
          </div>
          {this.state.showEditPanel ? (
            <Edit cancel={this.toggleEditPanel} user={this.props.user} />
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
