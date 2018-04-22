import * as React from "react";

import { User, UserInfo } from "../lib/user";
import { FeedInfo } from "../lib/feed";

import {
  Summary,
  decompressString,
  generateSummaryFromHTML,
  renderMarkdown
} from "../lib/utility";

import Footer from "../components/footer";
import Edit from "../components/edit";
import FeedCard from "../components/feed-card";
import ProfileCard from "../components/profile-card";
import AnnouncementCard from "../components/announcement-card";
import { userInfo } from "os";

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
}
export default class Home extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showEditPanel: false,
      msg: "",
      feeds: [],
      loading: false,
      userInfo: null
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
    user.getUserInfo(user.coinbase).then(userInfo => {
      this.setState({ userInfo });
    });
  }

  showUserFeeds(user: User) {
    if (!user) {
      return;
    }
    this.setState({ loading: true }, () => {
      user.getFeedsFromUser(
        user.coinbase,
        { num: -1 },
        async (done, offset, transactionInfo) => {
          console.log(done, offset, transactionInfo);
          if (done) {
            return this.setState({ loading: false });
          }
          const message = decompressString(
            transactionInfo.decodedInputData.params[2].value
          );
          // console.log(message);
          const summary = await generateSummaryFromHTML(
            renderMarkdown(message)
          );

          const userInfo = await user.getUserInfo(user.coinbase);

          const feeds = this.state.feeds;
          feeds.push({
            summary,
            transactionInfo,
            userInfo
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

  render() {
    if (this.props.user && this.props.user.coinbase) {
      const user = this.props.user;
      return (
        <div className="home">
          <div className="left-panel">
            <ProfileCard userInfo={this.state.userInfo} />
            <div className="friends-card" />
          </div>
          <div className="middle-panel">
            <div className="top-bar card">
              <div className="search-box-wrapper">
                <input
                  className="search-box"
                  placeholder={
                    "Paste user address here or the topic string to start searching"
                  }
                />
              </div>
              <div className="icon-groups">
                <i className="icon fas fa-home selected" />
                <i className="icon fab fa-slack-hash" />
                <i className="icon fas fa-bell" />
                <i className="icon fas fa-cog" />
              </div>
            </div>
            <div className="cards">
              {this.state.feeds.map((feedInfo, index) => (
                <FeedCard key={index} feedInfo={feedInfo} />
              ))}
              <p id="feed-footer">
                {" "}
                {this.state.loading ? "Loading..." : "No more feeds ;)"}{" "}
              </p>
            </div>
          </div>
          <div className="right-panel">
            <div className="post-btn-group" >
              <div className="ribbit-btn btn" onClick={this.toggleEditPanel}><i className="fas fa-pen-square"></i>Ribbit</div>
            </div>
            {/* <AnnouncementCard /> */}
            <div className="topics-card" />
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
