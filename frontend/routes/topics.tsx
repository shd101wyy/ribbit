import * as React from "react";

import Header, { Page } from "../components/header";
import { Ribbit, UserInfo } from "../lib/ribbit";

interface Props {
  ribbit: Ribbit;
}
interface State {}

export default class Topics extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <div className="topics-page">
        <Header ribbit={this.props.ribbit} page={Page.TopicsPage} />
      </div>
    );
  }
}
