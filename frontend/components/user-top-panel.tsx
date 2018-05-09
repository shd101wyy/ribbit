import * as React from "react";
import { I18n } from "react-i18next";
import { Link } from "react-router-dom";

import { FeedInfo, formatFeedCreationTime } from "../lib/feed";
import { UserInfo, Ribbit } from "../lib/ribbit";
import hashHistory from "../lib/history";

interface Props {
  feedInfo: FeedInfo;
  ribbit: Ribbit;
}
interface State {}

export default class UserTopPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  gotoProfilePage = username => {
    return event => {
      event.stopPropagation();
      event.preventDefault();
      window.open(
        `${window.location.pathname}#/${
          this.props.ribbit.networkId
        }/profile/${username}`,
        "_blank"
      );
    };
  };

  render() {
    const { feedInfo } = this.props;
    const userInfo = feedInfo.userInfo;

    const userPanel = (
      <div className="user-panel">
        <Link
          to={`/${this.props.ribbit.networkId}/profile/${
            feedInfo.userInfo.username
          }`}
          target="_blank"
          onClick={this.gotoProfilePage(feedInfo.userInfo.username)}
        >
          <div
            className="profile-image"
            style={{
              backgroundImage: `url("${userInfo.avatar}")`
            }}
          />
        </Link>
        <Link
          to={`/${this.props.ribbit.networkId}/profile/${
            feedInfo.userInfo.username
          }`}
          target="_blank"
          onClick={this.gotoProfilePage(feedInfo.userInfo.username)}
        >
          <div className="name">
            {userInfo.name ? userInfo.name : "Anonymous"}
          </div>
        </Link>
        <div className="username">{userInfo.username}</div>
        {/* <div className="postfix">c862b4eel</div> */}
        {/* <div className="action">post feed</div> */}
        <div className="create-time">
          <span>{formatFeedCreationTime(this.props.feedInfo)}</span>
        </div>
      </div>
    );

    const topBar =
      feedInfo.feedType === "upvote" ? (
        <I18n>
          {(t, { i18n }) => (
            <div className="top-bar">
              <Link
                to={`/${this.props.ribbit.networkId}/profile/${
                  feedInfo.repostUserInfo.username
                }`}
                target="_blank"
                onClick={this.gotoProfilePage(feedInfo.repostUserInfo.username)}
              >
                {feedInfo.repostUserInfo.name}
              </Link>
              <span className="action">{t("general/upvoted")}</span>
            </div>
          )}
        </I18n>
      ) : null;

    return (
      <div className="user-top-panel">
        {topBar}
        {userPanel}
      </div>
    );
  }
}
