import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, Switch } from "react-router";
const Web3 = require("web3");
// import Web3 from "web3";
import hashHistory from "./lib/history";
import { Ribbit } from "./lib/ribbit";

import "./less/entry.less";

import Home from "./routes/home";
import Signup from "./routes/signup";
import Profile from "./routes/profile";
import Topic from "./routes/topic";
import Tx from "./routes/tx";
import Settings from "./routes/settings";
import Notifications from "./routes/notifications";
import Topics from "./routes/topics";
import Footer from "./components/footer";
import Header from "./components/header";
import Error from "./components/error";

interface Props {}
interface State {
  injectWeb3: boolean;
  ribbit: Ribbit;
}
class App extends React.Component<Props, State> {
  state = {
    injectWeb3: false,
    ribbit: null
  };

  componentDidMount() {
    this.initializeRibbit();
  }

  async initializeRibbit() {
    let web3 = null;
    if (typeof window["web3"] === "undefined") {
      console.log("metamask not installed.");
      web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    } else {
      console.log("metamask installed.");
      web3 = new Web3(window["web3"].currentProvider);
    }
    const ribbit = new Ribbit(web3);
    window["web3"] = web3; // override metamask web3.
    window["ribbit"] = ribbit;
    console.log("start initializing user.");
    try {
      await ribbit.initialize();
      console.log("user initialized.", ribbit.accountAddress);
      this.setState(
        {
          injectWeb3: true,
          ribbit
        },
        async () => {
          if (hashHistory.location.pathname === "/") {
            hashHistory.replace(`/${ribbit.networkId}/`);
          }
        }
      );
    } catch (error) {
      new window["Noty"]({
        type: "error",
        text: `Failed to initialize Ribbit. Please make sure you have MetaMask enabled and unlocked.`,
        timeout: 10000
      }).show();
      this.setState({ ribbit: null }, () => {
        if (hashHistory.location.pathname === "/") {
          hashHistory.replace(`/${ribbit.networkId}/`);
        }
      });
    }
  }

  render() {
    if (!this.state.ribbit) {
      return <Error />;
    }
    return (
      <Router history={hashHistory}>
        <Switch>
          <Route
            path={`${process.env.PUBLIC_URL || ""}/:networkId/signup`}
            render={props => (
              <Signup
                networkId={props.match.params["networkId"]}
                ribbit={this.state.ribbit}
              />
            )}
            exact
          />
          <Route
            path={`${process.env.PUBLIC_URL || ""}/:networkId/`}
            render={props => (
              <Home
                networkId={props.match.params["networkId"]}
                ribbit={this.state.ribbit}
              />
            )}
            exact
          />
          <Route
            path={`${process.env.PUBLIC_URL || ""}/:networkId/topics`}
            render={props => (
              <Topics
                ribbit={this.state.ribbit}
                networkId={props.match.params["networkId"]}
              />
            )}
            exact
          />
          <Route
            path={`${process.env.PUBLIC_URL || ""}/:networkId/settings`}
            render={props => <Settings ribbit={this.state.ribbit} />}
            exact
          />
          <Route
            path={`${process.env.PUBLIC_URL || ""}/:networkId/notifications`}
            render={props => <Notifications ribbit={this.state.ribbit} />}
            exact
          />
          <Route
            path={`${process.env.PUBLIC_URL ||
              ""}/:networkId/profile/:username`}
            render={props => (
              <Profile
                networkId={props.match.params["networkId"]}
                ribbit={this.state.ribbit}
                username={props.match.params["username"]}
              />
            )}
            exact
          />
          <Route
            path={`${process.env.PUBLIC_URL || ""}/:networkId/topic/:topic`}
            render={props => (
              <Topic
                networkId={props.match.params["networkId"]}
                ribbit={this.state.ribbit}
                topic={decodeURIComponent(props.match.params["topic"])}
              />
            )}
            exact
          />
          <Route
            path={`${process.env.PUBLIC_URL ||
              ""}/:networkId/tx/:transactionHash`}
            render={props => (
              <Tx
                networkId={props.match.params["networkId"]}
                ribbit={this.state.ribbit}
                transactionHash={props.match.params["transactionHash"]}
              />
            )}
          />
        </Switch>
      </Router>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
