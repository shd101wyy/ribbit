import * as React from "react";
import { Component } from "react";

import Article from "./article";
import Card from "./card";

import * as utility from "../lib/utility";
import { Summary } from "../lib/utility";

interface Props {
  markdown: string;
}

interface State {
  html: string;
  summary: Summary;
}

export default class Preview extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      html: "",
      summary: {
        title: "",
        summary: "",
        images: [],
        tags: []
      }
    };
  }

  componentDidMount() {
    this.renderContent();
  }

  private renderContent = async () => {
    const html = utility.renderMarkdown(this.props.markdown);
    const summary = await utility.generateSummaryFromHTML(html);

    console.log(html, summary);

    this.setState({
      html,
      summary
    });
  };

  render() {
    return (
      <div className="preview">
        <Card summary={this.state.summary} />
        <Article html={this.state.html} />
      </div>
    );
  }
}
