import * as React from "react";
import { Component } from "react";

import ArticleCard from "./article-card";
import FeedCard from "./feed-card";

import * as utility from "../lib/utility";
import { User } from "../lib/user";
import { FeedInfo, Summary, generateSummaryFromHTML } from "../lib/feed";
import { generateFakeTransactionInfo } from "../lib/transaction";
import { renderMarkdown } from "../lib/markdown";
import { generateFakeStateInfo } from "../lib/feed";

interface Props {
  markdown: string;
  user: User;
}

interface State {
  feedInfo: FeedInfo;
}

export default class Preview extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
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
    const stateInfo = generateFakeStateInfo();

    this.setState({
      feedInfo: {
        summary,
        userInfo,
        transactionInfo,
        stateInfo,
        feedType: "post" // TODO: support differnet feedType.
      }
    });
  };

  render() {
    if (!this.state.feedInfo) {
      return null;
    } else {
      return (
        <div className="preview">
          <FeedCard feedInfo={this.state.feedInfo} user={this.props.user} />
          {// Only render article if it is article
          this.state.feedInfo.summary.title ? (
            <ArticleCard
              feedInfo={this.state.feedInfo}
              user={this.props.user}
            />
          ) : null}
        </div>
      );
    }
  }
}
