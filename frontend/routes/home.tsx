import * as React from "react";

import { User } from "../lib/user";
import { FeedInfo } from "../lib/feed";

import {
  Summary,
  decompressString,
  generateSummaryFromHTML,
  renderMarkdown
} from "../lib/utility";

import Footer from "../components/footer";
import Edit from "../components/edit";
import Card from "../components/card";

interface Props {
  user: User;
}
interface State {
  showEditPanel: boolean;
  msg: string;
  feeds: FeedInfo[];
  loading: boolean;
}
export default class Home extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showEditPanel: false,
      msg: "",
      feeds: [],
      loading: false
    };
  }

  componentDidMount() {
    this.showUserFeeds(this.props.user);
  }

  componentWillReceiveProps(newProps: Props) {
    if (this.props.user !== newProps.user) {
      this.showUserFeeds(newProps.user);
    }
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
    if (this.props.user) {
      const user = this.props.user;
      return (
        <div className="home">
          <p>{this.state.msg}</p>
          <h1>Using {user.getNetworkName()}</h1>
          <p>Your address {user.coinbase}</p>
          <div className="cards">
            {this.state.feeds.map((feedInfo, index) => (
              <Card key={index} feedInfo={feedInfo} />
            ))}
            <p id="feed-footer">
              {" "}
              {this.state.loading ? "Loading..." : "No more feeds ;)"}{" "}
            </p>
          </div>
          <div className="floating-button" onClick={this.toggleEditPanel}>
            <i className="fa fa-plus" />
          </div>
          <Footer />
          {this.state.showEditPanel ? (
            <Edit cancel={this.toggleEditPanel} user={this.props.user} />
          ) : null}
        </div>
      );
    } else {
      return (
        <div className="home">
          <h1 className="title is-1">
            Please make sure metamask is working in yoru browser.
          </h1>
        </div>
      );
    }
  }
}
