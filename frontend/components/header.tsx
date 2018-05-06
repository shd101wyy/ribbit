import * as React from "react";
import { Component } from "react";
import { Link } from "react-router-dom";

import { Ribbit } from "../lib/ribbit";

interface Props {
  ribbit: Ribbit;
}

interface State {}

export default class Header extends Component<Props, State> {
  render() {
    return (
      <header className="header">
        <div className="wrapper">
          <h1>Ribbit</h1>
          <nav>
            <Link className="selected" to={`/${this.props.ribbit.networkId}/`}>
              <i className="icon fas fa-home" />Home
            </Link>
            <Link to={`/${this.props.ribbit.networkId}/topics`}>
              <i className="icon fab fa-slack-hash" />Topics
            </Link>
            <Link to={`/${this.props.ribbit.networkId}/notifications`}>
              <i className="icon fas fa-bell" />Notifications
            </Link>
            <Link to={`/${this.props.ribbit.networkId}/settings`}>
              <i className="icon fas fa-cog" />Settings
            </Link>
          </nav>
          <div className="search-box-wrapper">
            <input
              className="search-box"
              placeholder="Enter @username here or #topic that you are interested. "
            />
          </div>
        </div>
      </header>
    );
  }
}
