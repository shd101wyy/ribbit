import * as React from "react";
import { Component } from "react";

import Article from "./article";
import FeedCard from "./feed-card";

import * as utility from "../lib/utility";
import { User } from "../lib/user";
import { FeedInfo, Summary, generateSummaryFromHTML } from "../lib/feed";
import { generateFakeTransactionInfo } from "../lib/transaction";
import { renderMarkdown } from "../lib/markdown";

interface Props {
  markdown: string;
  user: User;
}

interface State {
  html: string;
  feedInfo: FeedInfo;
}

export default class Preview extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      html: "",
      feedInfo: null
    };
  }

  componentDidMount() {
    this.renderContent();
  }

  private renderContent = async () => {
    const html = renderMarkdown(this.props.markdown);
    const summary = await generateSummaryFromHTML(html, this.props.user);
    const userInfo = await this.props.user.getUserInfo(
      this.props.user.accountAddress
    );
    const transactionInfo = generateFakeTransactionInfo();

    this.setState({
      html,
      feedInfo: {
        summary,
        userInfo,
        transactionInfo
      }
    });
  };

  render() {
    if (!this.state.feedInfo) {
      return null;
    } else {
      return (
        <div className="preview">
          <FeedCard feedInfo={this.state.feedInfo} />
          {// Only render article if it is article
          this.state.feedInfo.summary.title ? (
            <Article html={this.state.html} />
          ) : null}
        </div>
      );
    }
  }
}
