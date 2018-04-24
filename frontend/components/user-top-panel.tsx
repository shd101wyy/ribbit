import * as React from "react";
import { Link } from "react-router-dom";

import { FeedInfo, formatFeedCreationTime } from "../lib/feed";
import { UserInfo, User } from "../lib/user";

interface Props {
  feedInfo: FeedInfo;
  user: User;
}
interface State {}

export default class UserTopPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    const { feedInfo } = this.props;
    const userInfo = feedInfo.userInfo;

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
      feedInfo.feedType === "repost" ? (
        <div className="top-bar">
          <i className="fas fa-retweet" />
          <Link
            to={`/${this.props.user.networkId}/profile/${
              feedInfo.repostUserInfo.address
            }`}
          >
            {feedInfo.repostUserInfo.name}
          </Link>
          <span>reposted</span>
        </div>
      ) : null;

    return (
      <div className="user-top-panel">
        {topBar}
        {userPanel}
      </div>
    );
  }
}
