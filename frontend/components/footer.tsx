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
          <Link to="/">Home</Link>
          <Link to="/">Topic</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </div>
    );
  }
}
