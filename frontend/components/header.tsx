import * as React from "react";
import { Component } from "react";
import { Link } from "react-router-dom";

import { Ribbit } from "../lib/ribbit";
import hashHistory from "../lib/history";

export enum Page {
  HomePage,
  TopicsPage,
  NotificationsPage,
  SettingsPage
}

interface Props {
  ribbit: Ribbit;
  page?: Page;
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
          alert(`User with address ${searchValue} doesn't exist.`);
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
      <header className="header">
        <div className="wrapper">
          <h1>Ribbit</h1>
          <nav>
            <Link
              className={this.props.page === Page.HomePage ? "selected" : ""}
              to={`/${this.props.ribbit.networkId}/`}
            >
              <i className="icon fas fa-home" />Home
            </Link>
            <Link
              className={this.props.page === Page.TopicsPage ? "selected" : ""}
              to={`/${this.props.ribbit.networkId}/topics`}
            >
              <i className="icon fab fa-slack-hash" />Topics
            </Link>
            <Link
              className={
                this.props.page === Page.NotificationsPage ? "selected" : ""
              }
              to={`/${this.props.ribbit.networkId}/notifications`}
            >
              <i className="icon fas fa-bell" />Notifications
            </Link>
            <Link
              className={
                this.props.page === Page.SettingsPage ? "selected" : ""
              }
              to={`/${this.props.ribbit.networkId}/settings`}
            >
              <i className="icon fas fa-cog" />Settings
            </Link>
          </nav>
          <div className="search-box-wrapper">
            <input
              className="search-box"
              placeholder="Enter @username here or #topic that you are interested. "
              value={this.state.searchBoxValue}
              onChange={event => {
                this.setState({ searchBoxValue: event.target.value });
              }}
              onKeyDown={this.searchBoxKeydown}
            />
          </div>
        </div>
      </header>
    );
  }
}
