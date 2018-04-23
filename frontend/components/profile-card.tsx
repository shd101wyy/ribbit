import * as React from "react";
import { UserInfo } from "../lib/user";
import { decompressString } from "../lib/utility";
import { renderMarkdown } from "../lib/markdown";

interface Props {
  userInfo: UserInfo;
}
interface State {}
export default class ProfileCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const userInfo = this.props.userInfo;
    if (!userInfo) return null;
    const bio = renderMarkdown(userInfo.bio || "ribbit, ribbit, ribbit...");
    return (
      <div className="profile-card card">
        <div
          className="cover"
          style={{
            backgroundImage: userInfo.cover ? `url("${userInfo.cover}")` : null
          }}
        />
        <div
          className="avatar"
          style={{ backgroundImage: `url("${userInfo.avatar}")` }}
        />
        <div className="name-group">
          <p className="name">{userInfo.name}</p>
          <p className="address">@{userInfo.address}</p>
        </div>
        <div className="bio" dangerouslySetInnerHTML={{ __html: bio }} />
      </div>
    );
  }
}
