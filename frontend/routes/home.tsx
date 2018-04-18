import * as React from "react";

import { User } from "../lib/user";

import Footer from "../components/footer";
import Edit from "../components/edit";
import Card from "../components/card";

interface Props {
  user: User;
}
interface State {
  showEditPanel: boolean;
  msg: string;
}
export default class Home extends React.Component<Props, State> {
  state = {
    showEditPanel: false,
    msg: ""
  };

  toggleEditPanel = () => {
    const { showEditPanel } = this.state;
    this.setState({ showEditPanel: !showEditPanel });
  };

  render() {
    if (this.props.user) {
      const user = this.props.user;
      return (
        <div className="home">
          <p>{this.state.msg}</p>
          <h1>Using {user.getNetworkName()}</h1>
          <p>{user.coinbase}</p>
          {/* <h1> {user.userid + '_' + user.postfix} </h1>
					<p> {user.dbMoniAddress}</p> */}
          <div className="cards">
            {/*this.state.feeds.map((feed, index)=> <Card key={index} feed={feed}></Card>)*/}
          </div>
          <div className="floating-button" onClick={this.toggleEditPanel}>
            <i className="fa fa-plus" />
          </div>
          <Footer />
          {this.state.showEditPanel ? (
            <Edit cancel={this.toggleEditPanel} user={this.props.user} />
          ) : null}
        </div>
      );
    } else {
      return (
        <div className="home">
          <h1 className="title is-1">
            Please make sure metamask is working in yoru browser.
          </h1>
        </div>
      );
    }
  }
}
