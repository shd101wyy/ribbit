import * as React from "react";
import { I18n } from "react-i18next";
import { Ribbit } from "../lib/ribbit";
import hashHistory from "../lib/history";
import { checkNetworkId } from "../lib/utility";

import ProfileSettingsCard from "../components/profile-settings-card";

interface Props {
  networkId: number;
  ribbit: Ribbit;
}
interface State {}
export default class Signup extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    checkNetworkId(this.props.ribbit, this.props.networkId);
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
      <I18n>
        {(t, { i18n }) => (
          <div className="signup-page">
            <h1>{t("routes/signup/title")}</h1>
            <p className="subtitle">{t("routes/signup/subtitle")}</p>
            <ProfileSettingsCard ribbit={this.props.ribbit} reset={true} />
          </div>
        )}
      </I18n>
    );
  }
}
