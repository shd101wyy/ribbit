import * as React from "react";

import Header, { Page } from "../components/header";
import ProfileSettingsCard from "../components/profile-settings-card";
import { Ribbit, UserInfo } from "../lib/ribbit";
import { checkUserRegistration } from "../lib/utility";

interface Props {
  ribbit: Ribbit;
}
interface State {}

export default class Settings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    checkUserRegistration(this.props.ribbit);
  }

  componentWillReceiveProps(newProps: Props) {
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
