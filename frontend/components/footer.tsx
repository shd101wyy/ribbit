import * as React from "react";
import { Component } from "react";
import { Link } from "react-router-dom";

interface Props {}

interface State {}

export default class Footer extends Component<Props, State> {
  render() {
    return (
      <div className="app-footer">
        <nav>
          <Link to="/settings" id="icon-settings">
            <i className="fas fa-cog" />
          </Link>
          <Link to="/" id="icon-profile">
            <i className="fas fa-user-circle" />
          </Link>
          <Link to="/topics" id="icon-topics">
            <i className="fab fa-slack-hash" />
          </Link>
          <Link to="/" id="icon-home">
            <i className="fas fa-home" />
          </Link>
        </nav>
      </div>
    );
  }
}
