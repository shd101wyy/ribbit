import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, Switch } from "react-router";
import { I18nextProvider } from "react-i18next";
const Web3 = require("web3");

// import Web3 from "web3";
import hashHistory from "./lib/history";
import { Ribbit } from "./lib/ribbit";

window["hashHistory"] = hashHistory;

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
import i18n from "./i18n/i18n";

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
      console.log("user language: ", ribbit.settings.language);
      i18n.changeLanguage(ribbit.settings.language || "en");
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
      console.log(error);
      new window["Noty"]({
        type: "error",
        text: i18n.t("notification/init-error"),
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
                networkId={parseInt(props.match.params["networkId"])}
                ribbit={this.state.ribbit}
              />
            )}
            exact
          />
          <Route
            path={`${process.env.PUBLIC_URL || ""}/:networkId/`}
            render={props => (
              <Home
                networkId={parseInt(props.match.params["networkId"])}
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
                networkId={parseInt(props.match.params["networkId"])}
              />
            )}
            exact
          />
          <Route
            path={`${process.env.PUBLIC_URL || ""}/:networkId/settings`}
            render={props => (
              <Settings
                ribbit={this.state.ribbit}
                networkId={parseInt(props.match.params["networkId"])}
              />
            )}
            exact
          />
          <Route
            path={`${process.env.PUBLIC_URL || ""}/:networkId/notifications`}
            render={props => (
              <Notifications
                ribbit={this.state.ribbit}
                networkId={parseInt(props.match.params["networkId"])}
              />
            )}
            exact
          />
          <Route
            path={`${process.env.PUBLIC_URL ||
              ""}/:networkId/profile/:username`}
            render={props => (
              <Profile
                networkId={parseInt(props.match.params["networkId"])}
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
                networkId={parseInt(props.match.params["networkId"])}
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
                networkId={parseInt(props.match.params["networkId"])}
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

ReactDOM.render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>,
  document.getElementById("root")
);
