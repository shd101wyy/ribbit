import * as React from "react";
import { I18n } from "react-i18next";
import ProfileCard from "./profile-card";
import { Ribbit, UserInfo } from "../lib/ribbit";

import { UnControlled as CodeMirror, IInstance } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/markdown/markdown";

import i18n from "../i18n/i18n";

interface Props {
  ribbit: Ribbit;
  reset?: boolean;
  showDeleteAppCacheButton?: boolean;
}
interface State {
  username: string;
  name: string;
  avatar: string;
  cover: string;
  bio: string;
  lang: string;
}

export default class ProfileSettingsCard extends React.Component<Props, State> {
  private cm: IInstance;

  constructor(props: Props) {
    super(props);
    this.state = {
      username: "",
      name: "",
      avatar: "",
      cover: "",
      bio: "ribbit, ribbit, ribbit…",
      lang: "en"
    };
  }

  componentDidMount() {
    const ribbit = this.props.ribbit;
    if (this.props.reset) {
      return;
    }
  }

  initUserProfile() {
    const ribbit = this.props.ribbit;
    ribbit
      .getUserInfoFromAddress(ribbit.accountAddress)
      .then(userInfo => {
        console.log(userInfo);
        this.setState({
          username: userInfo.username,
          name: userInfo.name,
          avatar: userInfo.avatar.startsWith("data:image")
            ? ""
            : userInfo.avatar,
          cover: userInfo.cover,
          bio: userInfo.bio || "ribbit, ribbit, ribbit…",
          lang: ribbit.settings.language
        });
      })
      .catch(error => {
        new window["Noty"]({
          type: "error",
          text: error.toString(),
          timeout: 10000
        }).show();
      });
  }

  updatebio = (editor, data, newCode) => {
    this.setState({ bio: newCode });
  };

  changeUsername = event => {
    this.setState({ username: event.target["value"] });
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
      username: this.state.username,
      name: this.state.name,
      cover: this.state.cover,
      avatar: this.state.avatar,
      bio: this.state.bio,
      address: this.props.ribbit.accountAddress
    };
    this.props.ribbit
      .setUserMetadata(userInfo)
      .then(hash => {
        new window["Noty"]({
          type: "info",
          text: i18n.t("notification/publish-profile"),
          timeout: 10000
        }).show();
      })
      .catch(error => {
        new window["Noty"]({
          type: "error",
          text: i18n.t("notification/publish-profile-failure"),
          timeout: 10000
        }).show();
      });
  };

  handleLanguageChange = event => {
    const lang: string = event.target.value;
    console.log(lang);
    this.setState(
      {
        lang
      },
      () => {
        const ribbit = this.props.ribbit;
        ribbit.settings.language = lang;
        ribbit.setSettings(ribbit.settings);
        i18n.changeLanguage(lang);
      }
    );
  };

  deleteAppCache = () => {
    this.props.ribbit
      .destroyDB()
      .then(() => {
        new window["Noty"]({
          type: "success",
          text: i18n.t("notification/app-local-cache-deletion-success"),
          timeout: 60000
        }).show();
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      })
      .catch(error => {
        new window["Noty"]({
          type: "error",
          text: i18n.t("notification/app-local-cache-deletion-failure"),
          timeout: 60000
        }).show();
      });
  };

  render() {
    const options = {
      lineNumbers: false,
      autoFocus: true,
      mode: "markdown"
    };
    const userInfo: UserInfo = {
      username: this.state.username,
      address: this.props.ribbit.accountAddress,
      name: this.state.name,
      avatar: this.state.avatar,
      cover: this.state.cover,
      bio: this.state.bio
    };
    return (
      <I18n>
        {(t, { i18n }) => (
          <div className="profile-settings-card card">
            <p className="title">
              {t("components/profile-settings-card/title")}
            </p>
            <div className="form">
              <div className="entry">
                <p className="entry-title">Language/语言:</p>
                <select
                  value={this.state.lang}
                  onChange={this.handleLanguageChange}
                >
                  <option value="en"> English </option>
                  <option value="zh"> 简体中文 </option>
                </select>
              </div>
              <div className="entry">
                <p className="entry-title">{t("general/Username")}: </p>
                <input
                  placeholder={"@" + t("general/username")}
                  value={this.state.username}
                  onChange={this.changeUsername}
                />
              </div>
              <div className="entry">
                <p className="entry-title">{t("general/Display-name")}: </p>
                <input
                  placeholder={t("general/Display-name")}
                  value={this.state.name}
                  onChange={this.changeName}
                />
              </div>
              <div className="entry">
                <p className="entry-title">{t("general/Avatar-URL")}: </p>
                <input
                  placeholder={t(
                    "components/profile-settings-card/avatar-url-placeholder"
                  )}
                  value={this.state.avatar}
                  onChange={this.changeAvatar}
                />
              </div>
              <div className="entry">
                <p className="entry-title">{t("general/Cover-URL")}: </p>
                <input
                  placeholder={t(
                    "components/profile-settings-card/cover-url-placeholder"
                  )}
                  value={this.state.cover}
                  onChange={this.changeCover}
                />
              </div>
              <div className="entry markdown-entry">
                <p className="entry-title">
                  {t("general/Bio-markdown-ready")}:{" "}
                </p>
                <CodeMirror
                  editorDidMount={editor => {
                    this.cm = editor;
                    this.initUserProfile();
                  }}
                  value={this.state.bio}
                  onChange={this.updatebio}
                  options={options}
                  autoCursor={false}
                />
              </div>
            </div>
            <div
              id="publish-profile"
              className="btn"
              onClick={this.publishProfile}
            >
              {t("components/profile-settings-card/publish")}
            </div>
            <p className="title">{t("general/Profile-preview")}</p>
            <ProfileCard
              userInfo={userInfo}
              ribbit={this.props.ribbit}
              hideFollowingBtn={true}
            />
            {this.props.showDeleteAppCacheButton ? (
              <div style={{ padding: "24px 0" }}>
                <div
                  id="delete-app-cache"
                  className="btn"
                  onClick={this.deleteAppCache}
                >
                  {t("components/profile-settings-card/delete-app-cache")}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </I18n>
    );
  }
}
