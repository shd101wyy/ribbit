import * as React from "react";
import { Component } from "react";

import ImagesPanel from "./images-panel";
import UserTopPanel from "./user-top-panel";

import { FeedInfo, formatFeedCreationTime } from "../lib/feed";
import { formatDate } from "../lib/utility";
import { getTransactionCreationTimestamp } from "../lib/transaction";
import { User } from "../lib/user";
import { Link } from "react-router-dom";

interface Props {
  feedInfo: FeedInfo;
  user: User;
}
interface State {}

export default class FeedCard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  upvote = () => {
    this.props.user
      .upvote(this.props.feedInfo.transactionInfo.hash)
      .then(hash => {
        // do nothing.
      })
      .catch(error => {
        alert(error);
      });
  };

  downvote = () => {
    this.props.user
      .downvote(this.props.feedInfo.transactionInfo.hash)
      .then(hash => {
        // do nothing
      })
      .catch(error => {
        alert(error);
      });
  };

  reply = () => {
    alert("Not implemented");
  };

  donate = () => {
    alert("Not implemented");
  };

  render() {
    if (!this.props.feedInfo) {
      return null;
    }
    const summary = this.props.feedInfo.summary;
    const transactionInfo = this.props.feedInfo.transactionInfo;
    const userInfo = this.props.feedInfo.userInfo;
    const stateInfo = this.props.feedInfo.stateInfo;
    const repostUserInfo = this.props.feedInfo.repostUserInfo;
    const feedType = this.props.feedInfo.feedType;

    const bottomButtonGroup = (
      <div className="bottom-button-group">
        <div className="upvote-btn btn" onClick={this.upvote}>
          <i className="fas fa-caret-up">
            {stateInfo.upvotes ? (
              <span className="upvote-num">{stateInfo.upvotes}</span>
            ) : null}
          </i>
        </div>
        <div className="downvote-btn btn" onClick={this.downvote}>
          <i className="fas fa-caret-down" />
          {/* <span className="downvote-num">{stateInfo.downvotes || ""}</span> */}
        </div>
        <div className="reply-btn btn" onClick={this.reply}>
          <i className="far fa-comment" />
          <span className="comment-num">{stateInfo.replies || ""}</span>
        </div>
        <div className="donate-btn btn" onClick={this.donate}>
          <i className="fas fa-dollar-sign" />
          <span className="comment-num">{stateInfo.earnings || ""}</span>
        </div>
      </div>
    );

    if (summary.title) {
      // Article
      return (
        <div className="card">
          <UserTopPanel user={this.props.user} feedInfo={this.props.feedInfo} />
          <div className="content-panel">
            {summary.images.length ? (
              <div
                className="cover"
                style={{
                  backgroundImage: `url("${summary.images[0]}")`
                }}
              />
            ) : null}
            <div className="title">{summary.title}</div>
            <div
              className="summary"
              dangerouslySetInnerHTML={{ __html: summary.summary }}
            />
          </div>
          <div className="button-group" />
        </div>
      );
    } else {
      // Normal
      return (
        <div className="card">
          <UserTopPanel feedInfo={this.props.feedInfo} user={this.props.user} />
          <div className="content-panel">
            <div
              className="summary"
              dangerouslySetInnerHTML={{ __html: summary.summary }}
            />
            <ImagesPanel images={summary.images} />
            {bottomButtonGroup}
          </div>
        </div>
      );
    }
  }
}
