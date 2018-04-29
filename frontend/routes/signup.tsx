import * as React from "react";

import { Ribbit } from "../lib/ribbit";
import hashHistory from "../lib/history";

import ProfileSettingsCard from "../components/profile-settings-card";

interface Props {
  networkId: string;
  ribbit: Ribbit;
}
interface State {}
export default class Signup extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    this.checkUsernameExists();
  }

  async checkUsernameExists() {
    const username = await this.props.ribbit.getUsernameFromAddress(
      this.props.ribbit.accountAddress
    );
    if (username.length) {
      hashHistory.replace(`/${this.props.networkId}/`);
    }
  }

  render() {
    return (
      <div className="signup-page">
        <h1>Welcome to Ribbit!</h1>
        <p className="subtitle">
          Please finish your account registration below
        </p>
        <ProfileSettingsCard ribbit={this.props.ribbit} reset={true} />
      </div>
    );
  }
}
