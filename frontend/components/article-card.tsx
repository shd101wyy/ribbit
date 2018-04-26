import * as React from "react";
import { Component } from "react";

import UserTopPanel from "./user-top-panel";
import ActionsBottomPanel from "./actions-bottom-panel";
import FeedCard from "./feed-card";

import * as utility from "../lib/utility";
import { FeedInfo, generateFeedInfoFromTransactionInfo } from "../lib/feed";
import { User } from "../lib/user";

interface Props {
  feedInfo: FeedInfo;
  user: User;
  hideActionsPanel?: boolean;
}

interface State {
  replies: FeedInfo[];
  loadingReplies: boolean;
}

export default class ArticleCard extends Component<Props, State> {
  private elem: HTMLDivElement;
  constructor(props: Props) {
    super(props);

    this.state = {
      replies: [],
      loadingReplies: false
    };
  }

  componentDidMount() {
    this.addTargetBlankToAnchorElements();
    this.loadReplies(this.props.feedInfo);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.feedInfo.transactionInfo.hash !==
      this.props.feedInfo.transactionInfo.hash
    ) {
      return this.loadReplies(nextProps.feedInfo);
    }
  }

  componentDidUpdate() {
    this.addTargetBlankToAnchorElements();
  }

  async loadReplies(feedInfo: FeedInfo) {
    if (!feedInfo.transactionInfo.hash) {
      return;
    }
    this.setState({
      replies: [],
      loadingReplies: true
    }, ()=> {
      const user = this.props.user;
      // load comments by time
      user.getFeedsFromTagByTime(
        feedInfo.transactionInfo.hash,
        { num: -1 },
        async (done, offset, transactionInfo) => {
          console.log(done, offset, transactionInfo);
          if (done) {
            return this.setState({loadingReplies: false});
          }
          try {
            const feedInfo = await generateFeedInfoFromTransactionInfo(
              user,
              transactionInfo
            );
            const replies = this.state.replies;
            replies.push(feedInfo);
            this.setState({ replies });
          } catch (error) {
            console.log(error);
          }
        }
      );
    })
  }

  addTargetBlankToAnchorElements() {
    if (!this.elem) {
      return;
    }
    const anchorElements = this.elem.getElementsByTagName("A");
    for (let i = 0; i < anchorElements.length; i++) {
      const anchorElement = anchorElements[i];
      anchorElement.setAttribute("target", "_blank");
    }
  }

  render() {
    const feedInfo = this.props.feedInfo;
    return (
      <div className="article-panel">
        <div className="article-card card">
          <UserTopPanel user={this.props.user} feedInfo={feedInfo} />
          <div
            className="content"
            ref={elem => {
              this.elem = elem;
            }}
            dangerouslySetInnerHTML={{ __html: feedInfo.summary.html }}
          />
          {this.props.hideActionsPanel ? null : (
            <ActionsBottomPanel user={this.props.user} feedInfo={feedInfo} />
          )}
        </div>
        <div className="replies">
          {this.state.replies.map((feedInfo, index) => {
            return (
              <FeedCard
                key={index}
                feedInfo={feedInfo}
                user={this.props.user}
              />
            );
          })}
        </div>
        {this.state.replies.length ? (
          this.state.loadingReplies ? 
          <p id="feed-footer">Loading replies...</p>:
          <p id="feed-footer">No more replies</p>
        ) : null}
      </div>
    );
  }
}
