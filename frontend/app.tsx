import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, Switch } from "react-router";
const Web3 = require("web3");
// import Web3 from "web3";
import history from "./lib/history";
import { User } from "./lib/user";

import "./less/entry.less";

import Home from "./routes/home";
import Profile from "./routes/profile";
import Topic from "./routes/topic";
import Footer from "./components/footer";

interface Props {}
interface State {
  injectWeb3: boolean;
  user: User;
}
class App extends React.Component<Props, State> {
  state = {
    injectWeb3: false,
    user: null
  };
  componentDidMount() {
    let web3 = null;
    if (typeof window["web3"] === "undefined") {
      console.log("metamask not installed.");
      web3 = new Web3("ws://localhost:8546");
    } else {
      console.log("metamask installed.");
      web3 = new Web3(window["web3"].currentProvider);
    }
    const user = new User(web3);
    window["web3"] = web3; // override metamask web3.
    window["user"] = user;
    user
      .initialize()
      .then(() => {
        console.log("user initialized.");
        this.setState(
          {
            injectWeb3: true,
            user: user
          },
          () => {
            if (history.location.pathname === "/") {
              history.push(`/${user.networkId}/`);
            }
          }
        );
      })
      .catch(error => {
        alert(error);
        this.setState({ user: null }, () => {
          if (history.location.pathname === "/") {
            history.push(`/${user.networkId}/`);
          }
        });
      });
  }
  render() {
    if (!this.state.user) {
      return (
        <div className="home">
          <h1 className="title is-1">
            Please make sure{" "}
            <a href="https://metamask.io/" target="_blank">
              MetaMask
            </a>{" "}
            is working in your browser.
          </h1>
        </div>
      );
    }
    return (
      <Router history={history}>
        <Switch>
          <Route
            path={`${process.env.PUBLIC_URL || ""}/:networkId/`}
            render={props => (
              <Home
                networkId={props.match.params["networkId"]}
                user={this.state.user}
              />
            )}
            exact
          />
          <Route
            path={`${process.env.PUBLIC_URL ||
              ""}/:networkId/profile/:userAddress`}
            render={props => (
              <Profile
                networkId={props.match.params["networkId"]}
                user={this.state.user}
                guestUserAddress={props.match.params["userAddress"]}
              />
            )}
            exact
          />
          <Route
            path={`${process.env.PUBLIC_URL || ""}/:networkId/topic/:topic`}
            render={props => (
              <Topic
                networkId={props.match.params["networkId"]}
                user={this.state.user}
                topic={props.match.params["topic"]}
              />
            )}
            exact
          />
        </Switch>
      </Router>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
