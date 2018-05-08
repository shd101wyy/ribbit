import * as React from "react";
import { I18n } from "react-i18next";
import { UserInfo, Ribbit } from "../lib/ribbit";
import { decompressString } from "../lib/utility";
import { renderMarkdown } from "../lib/markdown";
import { generateSummaryFromHTML } from "../lib/feed";

interface Props {
  userInfo: UserInfo;
  ribbit: Ribbit;
  hideFollowingBtn?: boolean;
}
interface State {
  following: boolean;
  mouseOver: boolean;
  bio: string;
}
export default class ProfileCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      following: false,
      mouseOver: false,
      bio: "loading..."
    };
  }

  componentDidMount() {
    this.initState(this.props.userInfo);
  }

  componentWillReceiveProps(newProps: Props) {
    if (
      !this.props.userInfo ||
      newProps.userInfo.username !== this.props.userInfo.username ||
      newProps.userInfo.bio !== this.props.userInfo.bio
    ) {
      return this.initState(newProps.userInfo);
    }
  }

  initState(userInfo: UserInfo) {
    if (!userInfo) {
      return;
    }
    const username = userInfo.username;
    const followingUsernames = this.props.ribbit.settings.followingUsernames;
    const following = !!followingUsernames.filter(x => x.username === username)
      .length;
    this.setState(
      {
        following
      },
      () => {
        this.initBio();
      }
    );
  }

  async initBio() {
    const summary = await generateSummaryFromHTML(
      renderMarkdown(this.props.userInfo.bio),
      this.props.ribbit
    );
    this.setState({
      bio: summary.html
    });
  }

  unfollowUser = () => {
    this.props.ribbit
      .unfollowUser(this.props.userInfo.username)
      .then(() => {
        this.setState({
          following: false
        });
      })
      .catch(error => {
        alert(error);
      });
  };

  followUser = () => {
    this.props.ribbit
      .followUser(this.props.userInfo.username)
      .then(() => {
        this.setState({
          following: true
        });
      })
      .catch(error => {
        alert(error);
      });
  };

  render() {
    const userInfo = this.props.userInfo;
    const ribbit = this.props.ribbit;
    if (!userInfo) return null;
    return (
      <I18n>
        {(t, { i18n }) => (
          <div className="profile-card card">
            <div
              className="cover"
              style={{
                backgroundImage: userInfo.cover
                  ? `url("${userInfo.cover}")`
                  : null
              }}
            />
            <div
              className="avatar"
              style={{ backgroundImage: `url("${userInfo.avatar}")` }}
            />
            <div className="name-group">
              <p className="name">{userInfo.name}</p>
              <p className="username">@{userInfo.username}</p>
            </div>
            {this.props.hideFollowingBtn ||
            this.props.ribbit.userInfo.username ===
              this.props.userInfo.username ? null : (
              <div className="button-group">
                {this.state.following ? (
                  this.state.mouseOver ? (
                    <div
                      className="follow-btn"
                      onMouseEnter={() => this.setState({ mouseOver: true })}
                      onMouseLeave={() => this.setState({ mouseOver: false })}
                      onClick={this.unfollowUser}
                    >
                      {t("general/unfollow")}
                    </div>
                  ) : (
                    <div
                      className="follow-btn"
                      onMouseEnter={() => this.setState({ mouseOver: true })}
                      onMouseLeave={() => this.setState({ mouseOver: false })}
                    >
                      {t("general/following")}
                    </div>
                  )
                ) : (
                  <div className="follow-btn" onClick={this.followUser}>
                    {t("general/follow")}
                  </div>
                )}
              </div>
            )}
            <div
              className="bio"
              dangerouslySetInnerHTML={{ __html: this.state.bio }}
            />
          </div>
        )}
      </I18n>
    );
  }
}
