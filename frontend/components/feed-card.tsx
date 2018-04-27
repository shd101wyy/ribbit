import * as React from "react";
import { Component } from "react";
import { Link } from "react-router-dom";

import ImagesPanel from "./images-panel";
import UserTopPanel from "./user-top-panel";
import ActionsBottomPanel from "./actions-bottom-panel";

import { FeedInfo, formatFeedCreationTime } from "../lib/feed";
import { formatDate } from "../lib/utility";
import { getTransactionCreationTimestamp } from "../lib/transaction";
import { Ribbit } from "../lib/ribbit";
import hashHistory from "../lib/history";

interface Props {
  feedInfo: FeedInfo;
  ribbit: Ribbit;
  hideActionsPanel?: boolean;
}
interface State {}

export default class FeedCard extends Component<Props, State> {
  private elem: HTMLDivElement;
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.addTargetBlankToAnchorElements();
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

  clickCard = () => {
    if (!this.props.feedInfo.transactionInfo.hash) {
      return;
    }
    /* window.open(
      `${window.location.pathname}#/${this.props.ribbit.networkId}/tx/${
        this.props.feedInfo.transactionInfo.hash
      }`,
    );
    */
    console.log(
      "push: ",
      `/${this.props.ribbit.networkId}/tx/${
        this.props.feedInfo.transactionInfo.hash
      }`
    );
    hashHistory.push(
      `/${this.props.ribbit.networkId}/tx/${
        this.props.feedInfo.transactionInfo.hash
      }`
    );
  };

  render() {
    if (!this.props.feedInfo) {
      return null;
    }
    const summary = this.props.feedInfo.summary;
    const transactionInfo = this.props.feedInfo.transactionInfo;
    const userInfo = this.props.feedInfo.userInfo;
    const stateInfo = this.props.feedInfo.stateInfo;
    const repostUserInfo = this.props.feedInfo.repostUserInfo;
    const feedType = this.props.feedInfo.feedType;

    if (summary.title) {
      // Article
      return (
        <div className="feed-card card" onClick={this.clickCard}>
          <UserTopPanel ribbit={this.props.ribbit} feedInfo={this.props.feedInfo} />
          <div className="content-panel">
            {summary.images.length ? (
              <div
                className="cover"
                style={{
                  backgroundImage: `url("${summary.images[0]}")`
                }}
              />
            ) : null}
            <div className="title">{summary.title}</div>
            <div
              ref={elem => (this.elem = elem)}
              className="summary"
              dangerouslySetInnerHTML={{ __html: summary.summary }}
            />
          </div>
          {this.props.hideActionsPanel ? null : (
            <ActionsBottomPanel
              feedInfo={this.props.feedInfo}
              ribbit={this.props.ribbit}
            />
          )}
        </div>
      );
    } else {
      // Normal
      return (
        <div className="feed-card card" onClick={this.clickCard}>
          <UserTopPanel feedInfo={this.props.feedInfo} ribbit={this.props.ribbit} />
          <div className="content-panel">
            <div
              ref={elem => (this.elem = elem)}
              className="summary"
              dangerouslySetInnerHTML={{ __html: summary.summary }}
            />
            <ImagesPanel images={summary.images} />
            {this.props.hideActionsPanel ? null : (
              <ActionsBottomPanel
                feedInfo={this.props.feedInfo}
                ribbit={this.props.ribbit}
              />
            )}
          </div>
        </div>
      );
    }
  }
}
