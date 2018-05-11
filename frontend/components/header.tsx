import * as React from "react";
import { Component } from "react";
import { Link } from "react-router-dom";
import { I18n } from "react-i18next";

import { Ribbit } from "../lib/ribbit";
import hashHistory from "../lib/history";
import i18n from "../i18n/i18n";

export enum Page {
  HomePage,
  TopicsPage,
  NotificationsPage,
  SettingsPage
}

interface Props {
  ribbit: Ribbit;
  page?: Page;
  showBackBtn?: boolean;
}

interface State {
  searchBoxValue: string;
}

export default class Header extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchBoxValue: ""
    };
  }

  searchBoxKeydown = async event => {
    const searchValue = this.state.searchBoxValue.trim();
    if (!searchValue.length) {
      return;
    }
    const ribbit = this.props.ribbit;
    if (event.which === 13) {
      // enter key
      if (ribbit.web3.utils.isAddress(searchValue)) {
        // search for user
        const username = await ribbit.getUsernameFromAddress(searchValue);
        if (username && username.length) {
          window.open(
            `${window.location.pathname}#/${
              ribbit.networkId
            }/profile/${username}`,
            "_blank"
          );
        } else {
          new window["Noty"]({
            type: "error",
            text: i18n.t("notification/user-address-doesnt-exist", {
              userAddress: searchValue
            }),
            timeout: 10000
          }).show();
        }
      } else if (searchValue.startsWith("@")) {
        // search for user
        window.open(
          `${window.location.pathname}#/${
            ribbit.networkId
          }/profile/${searchValue.slice(1)}`,
          "_blank"
        );
      } else {
        // search for topic
        window.open(
          `${window.location.pathname}#/${
            ribbit.networkId
          }/topic/${encodeURIComponent(searchValue)}`,
          "_blank"
        );
      }
    }
  };

  render() {
    return (
      <I18n>
        {(t, { i18n }) => (
          <header className="header">
            <div className="wrapper">
              {this.props.showBackBtn ? (
                <h1 className="back-btn" onClick={() => hashHistory.goBack()}>
                  &nbsp;
                  <i className="fas fa-chevron-left" />
                  &nbsp;
                </h1>
              ) : (
                <h1>Ribbit</h1>
              )}
              <nav>
                <Link
                  className={
                    "header-tab " +
                    (this.props.page === Page.HomePage ? "selected" : "")
                  }
                  to={`/${this.props.ribbit.networkId}/`}
                >
                  <i className="icon fas fa-home" />
                  <span>{t("components/header/home")}</span>
                </Link>
                <Link
                  className={
                    "header-tab " +
                    (this.props.page === Page.TopicsPage ? "selected" : "")
                  }
                  to={`/${this.props.ribbit.networkId}/topics`}
                >
                  <i className="icon fas fa-hashtag" />
                  <span>{t("components/header/topics")}</span>
                </Link>
                <Link
                  className={
                    "header-tab " +
                    (this.props.page === Page.NotificationsPage
                      ? "selected"
                      : "")
                  }
                  to={`/${this.props.ribbit.networkId}/notifications`}
                >
                  <i className="icon fas fa-bell" />
                  <span>{t("components/header/notifications")}</span>
                </Link>
                <Link
                  className={
                    "header-tab " +
                    (this.props.page === Page.SettingsPage ? "selected" : "")
                  }
                  to={`/${this.props.ribbit.networkId}/settings`}
                >
                  <i className="icon fas fa-cog" />
                  <span>{t("components/header/settings")}</span>
                </Link>
              </nav>
              <div className="search-box-wrapper">
                <input
                  className="search-box"
                  placeholder={t("components/header/search-box-placeholder")}
                  value={this.state.searchBoxValue}
                  onChange={event => {
                    this.setState({ searchBoxValue: event.target.value });
                  }}
                  onKeyDown={this.searchBoxKeydown}
                />
              </div>
            </div>
          </header>
        )}
      </I18n>
    );
  }
}
