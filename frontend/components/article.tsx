import * as React from "react";
import { Component } from "react";

import * as utility from "../lib/utility";

interface Props {
  html: string;
}

interface State {}

export default class Article extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    // console.log('html: ', this.props.html)
  }

  componentWillReceiveProps(nextProps: Props) {
    // console.log('html: ', nextProps.html)
  }

  render() {
    return (
      <div className="article">
        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: this.props.html }}
        />
        <div className="comments" />
      </div>
    );
  }
}
