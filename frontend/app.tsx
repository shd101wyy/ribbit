import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, Switch } from "react-router";
// import Web3 from "web3";
import history from "./lib/history";
import { User } from "./lib/user";

import "./less/entry.less";

import Home from "./routes/home";
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
    if (typeof window["web3"] === "undefined") {
      alert("metamask not installed");
    } else {
      console.log("metamask installed");
      const user = new User(window["web3"]);
      window["user"] = user;
      this.setState({
        injectWeb3: true,
        user: user
      });
    }
  }
  render() {
    return (
      <Router history={history}>
        <div id="router-container">
          <Route
            path="/"
            render={props => <Home user={this.state.user} />}
            exact
          />
        </div>
      </Router>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
