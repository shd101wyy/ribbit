import * as React from "react";
import ProfileCard from "./profile-card";
import { User, UserInfo } from "../lib/user";

import * as CodeMirror from "react-codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/markdown/markdown";

interface Props {
  user: User;
}
interface State {
  name: string;
  avatar: string;
  cover: string;
  bio: string;
}

export default class ProfileSettingsCard extends React.Component<Props, State> {
  private cm: HTMLElement;

  constructor(props: Props) {
    super(props);
    this.state = {
      name: "",
      avatar: "",
      cover: "",
      bio: "ribbit, ribbit, ribbit…"
    };
  }

  componentDidMount() {
    const user = this.props.user;
    user
      .getUserInfo(user.coinbase)
      .then(userInfo => {
        this.setState(
          {
            name: userInfo.name,
            avatar: userInfo.avatar.startsWith("data:image")
              ? ""
              : userInfo.avatar,
            cover: userInfo.cover,
            bio: userInfo.bio || "ribbit, ribbit, ribbit…"
          },
          () => {
            if (this.cm) {
              // This is a hack. https://github.com/JedWatson/react-codemirror/issues/121
              this.cm["codeMirror"].setValue(this.state.bio);
            }
          }
        );
      })
      .catch(error => {
        alert(error);
      });
  }

  updatebio = newCode => {
    this.setState({ bio: newCode });
  };

  changeName = event => {
    this.setState({ name: event.target["value"] });
  };

  changeAvatar = event => {
    this.setState({ avatar: event.target["value"] });
  };

  changeCover = event => {
    this.setState({ cover: event.target["value"] });
  };

  publishProfile = event => {
    const userInfo = {
      name: this.state.name,
      cover: this.state.cover,
      avatar: this.state.avatar,
      bio: this.state.bio,
      address: this.props.user.coinbase
    };
    this.props.user
      .setUserMetadata(userInfo)
      .then(hash => {
        alert(
          "Published profile to blockchain with transaction hash: " +
            hash +
            "\nPlease wait until the transaction finishes."
        );
      })
      .catch(error => {
        alert(error);
      });
  };

  render() {
    const options = {
      lineNumbers: false,
      autoFocus: true,
      mode: "markdown"
    };
    const userInfo: UserInfo = {
      address: this.props.user.coinbase,
      name: this.state.name,
      avatar: this.state.avatar,
      cover: this.state.cover,
      bio: this.state.bio
    };
    return (
      <div className="profile-settings-card card">
        <p className="title">Profile settings</p>
        <div className="form">
          <div className="entry">
            <p className="entry-title">Display name: </p>
            <input
              placeholder="Display name"
              value={this.state.name}
              onChange={this.changeName}
            />
          </div>
          <div className="entry">
            <p className="entry-title">Avatar URL: </p>
            <input
              placeholder="Avatar image url starting with http:// or https://"
              value={this.state.avatar}
              onChange={this.changeAvatar}
            />
          </div>
          <div className="entry">
            <p className="entry-title">Cover URL: </p>
            <input
              placeholder="Cover image url starting with https:// or https://"
              value={this.state.cover}
              onChange={this.changeCover}
            />
          </div>
          <div className="entry markdown-entry">
            <p className="entry-title">Bio (markdown ready): </p>
            <CodeMirror
              ref={elem => (this.cm = elem)}
              value={this.state.bio}
              onChange={this.updatebio}
              options={options}
            />
          </div>
        </div>
        <div id="publish-profile" className="btn" onClick={this.publishProfile}>
          Publish profile to blockchain
        </div>
        <p className="title">Profile preview</p>
        <ProfileCard userInfo={userInfo} />
      </div>
    );
  }
}
