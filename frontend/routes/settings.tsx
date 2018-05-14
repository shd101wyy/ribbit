import * as React from "react";

import Header, { Page } from "../components/header";
import ProfileSettingsCard from "../components/profile-settings-card";
import { Ribbit, UserInfo } from "../lib/ribbit";
import { checkUserRegistration, checkNetworkId } from "../lib/utility";

interface Props {
  ribbit: Ribbit;
  networkId: number;
}
interface State {}

export default class Settings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    checkNetworkId(this.props.ribbit, this.props.networkId);
    checkUserRegistration(this.props.ribbit);
  }

  componentWillReceiveProps(newProps: Props) {
    checkNetworkId(newProps.ribbit, newProps.networkId);
    checkUserRegistration(newProps.ribbit);
  }

  render() {
    return (
      <div className="settings-page">
        <Header ribbit={this.props.ribbit} page={Page.SettingsPage} />
        <ProfileSettingsCard
          ribbit={this.props.ribbit}
          showDeleteAppCacheButton={true}
        />
      </div>
    );
  }
}
