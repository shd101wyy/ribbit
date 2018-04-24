import * as React from "react";
import { Component } from "react";

import ImagesPanel from "./images-panel";

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

  like = () => {
    const hash = this.props.feedInfo.transactionInfo.hash;
    this.props.user.like(hash);
  };

  repost = () => {
    this.props.user
      .repost(this.props.feedInfo.transactionInfo.hash)
      .then(hash => {
        // do nothing.
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
    const userPanel = (
      <div className="user-panel">
        <div
          className="profile-image"
          style={{
            backgroundImage: `url("${userInfo.avatar}")`
          }}
        />
        <div className="name">
          {userInfo.name ? userInfo.name : "Anonymous"}
        </div>
        <div className="user-address">
          {userInfo.address.slice(0, 6) + "..."}
        </div>
        {/* <div className="postfix">c862b4eel</div> */}
        <div className="action">post feed</div>
        <div className="create-time">
          <span>{formatFeedCreationTime(this.props.feedInfo)}</span>
        </div>
      </div>
    );
    const topBar =
      feedType === "repost" ? (
        <div className="top-bar">
          <i className="fas fa-retweet" />
          <Link
            to={`/${this.props.user.networkId}/profile/${
              repostUserInfo.address
            }`}
          >
            {repostUserInfo.name}
          </Link>
          <span>reposted</span>
        </div>
      ) : null;

    const bottomButtonGroup = (
      <div className="bottom-button-group">
        <div className="reply-btn btn" onClick={this.reply}>
          <i className="far fa-comment" />
          <span className="comment-num">{stateInfo.replies || ""}</span>
        </div>
        <div className="repost-btn btn" onClick={this.repost}>
          <i className="fas fa-retweet" />
          <span className="comment-num">{stateInfo.reposts || ""}</span>
        </div>
        <div className="like-btn btn" onClick={this.like}>
          <i className="far fa-heart" />
          <span className="comment-num">{stateInfo.likes || ""}</span>
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
          {topBar}
          {userPanel}
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
          {topBar}
          {userPanel}
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
