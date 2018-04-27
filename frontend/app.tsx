import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, Switch } from "react-router";
const Web3 = require("web3");
// import Web3 from "web3";
import history from "./lib/history";
import { Ribbit } from "./lib/ribbit";

import "./less/entry.less";

import Home from "./routes/home";
import Profile from "./routes/profile";
import Topic from "./routes/topic";
import Tx from "./routes/tx";
import Footer from "./components/footer";

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
    ribbit
      .initialize()
      .then(() => {
        console.log("user initialized.", ribbit.accountAddress);
        this.setState(
          {
            injectWeb3: true,
            ribbit
          },
          () => {
            if (history.location.pathname === "/") {
              history.push(`/${ribbit.networkId}/`);
            }
          }
        );
      })
      .catch(error => {
        alert(error);
        this.setState({ ribbit: null }, () => {
          if (history.location.pathname === "/") {
            history.push(`/${ribbit.networkId}/`);
          }
        });
      });
  }
  render() {
    if (!this.state.ribbit) {
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
                ribbit={this.state.ribbit}
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
                ribbit={this.state.ribbit}
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
