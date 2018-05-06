import * as React from "react";

import Header, { Page } from "../components/header";
import ProfileSettingsCard from "../components/profile-settings-card";
import { Ribbit, UserInfo } from "../lib/ribbit";

interface Props {
  ribbit: Ribbit;
}
interface State {}

export default class Settings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <div className="settings-page">
        <Header ribbit={this.props.ribbit} page={Page.NotificationsPage} />
        <ProfileSettingsCard ribbit={this.props.ribbit} />
      </div>
    );
  }
}
