import * as React from "react";
import { Component } from "react";
import { Link } from "react-router-dom";

interface Props {}

interface State {}

export default class Header extends Component<Props, State> {
  render() {
    return (
      <header className="header">
        <h1>React App</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/profile">Me</Link>
          <Link to="/profile/john">John</Link>
        </nav>
      </header>
    );
  }
}
