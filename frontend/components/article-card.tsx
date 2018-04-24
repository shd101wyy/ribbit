import * as React from "react";
import { Component } from "react";

import UserTopPanel from "./user-top-panel";

import * as utility from "../lib/utility";
import { FeedInfo } from "../lib/feed";
import { User } from "../lib/user";

interface Props {
  feedInfo: FeedInfo;
  user: User;
}

interface State {}

export default class ArticleCard extends Component<Props, State> {
  private elem: HTMLDivElement;
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    // console.log('html: ', this.props.html)
    this.addTargetBlankToAnchorElements();
  }

  componentWillReceiveProps(nextProps: Props) {
    // console.log('html: ', nextProps.html)
  }

  componentDidUpdate() {
    this.addTargetBlankToAnchorElements();
  }

  addTargetBlankToAnchorElements() {
    if (!this.elem) {
      return;
    }
    const anchorElements = this.elem.getElementsByTagName("A");
    for (let i = 0; i < anchorElements.length; i++) {
      const anchorElement = anchorElements[i];
      anchorElement.setAttribute("target", "_blank");
    }
  }

  render() {
    const feedInfo = this.props.feedInfo;
    return (
      <div className="article-card card">
        <UserTopPanel user={this.props.user} feedInfo={feedInfo} />
        <div
          className="content"
          ref={elem => {
            this.elem = elem;
          }}
          dangerouslySetInnerHTML={{ __html: feedInfo.summary.html }}
        />
        <div className="comments" />
      </div>
    );
  }
}
