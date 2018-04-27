import * as React from "react";
import { Component } from "react";
import { BigNumber } from "bignumber.js";

import UserTopPanel from "./user-top-panel";
import ActionsBottomPanel from "./actions-bottom-panel";
import FeedCard from "./feed-card";

import * as utility from "../lib/utility";
import { FeedInfo, generateFeedInfoFromTransactionInfo } from "../lib/feed";
import { Ribbit } from "../lib/ribbit";

interface Props {
  feedInfo: FeedInfo;
  ribbit: Ribbit;
  hideActionsPanel?: boolean;
}

interface State {
  replies: FeedInfo[];
  loadingReplies: boolean;
  parent: FeedInfo;
}

export default class ArticleCard extends Component<Props, State> {
  private elem: HTMLDivElement;
  constructor(props: Props) {
    super(props);

    this.state = {
      replies: [],
      loadingReplies: false,
      parent: null
    };
  }

  componentDidMount() {
    this.addTargetBlankToAnchorElements();
    this.loadParent(this.props.feedInfo);
    this.loadReplies(this.props.feedInfo);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.feedInfo.transactionInfo.hash !==
      this.props.feedInfo.transactionInfo.hash
    ) {
      // reset state
      this.setState(
        {
          replies: [],
          loadingReplies: false,
          parent: null
        },
        () => {
          this.loadParent(nextProps.feedInfo);
          this.loadReplies(nextProps.feedInfo);
        }
      );
    }
  }

  componentDidUpdate() {
    this.addTargetBlankToAnchorElements();
  }

  async loadReplies(feedInfo: FeedInfo) {
    if (!feedInfo.transactionInfo.hash) {
      return;
    }
    const originTransactionHash = feedInfo.transactionInfo.hash;
    this.setState(
      {
        replies: [],
        loadingReplies: true
      },
      () => {
        const ribbit = this.props.ribbit;
        // load comments by time
        ribbit.getFeedsFromTagByTime(
          feedInfo.transactionInfo.hash,
          { num: -1 },
          async (done, offset, transactionInfo) => {
            console.log(done, offset, transactionInfo);
            if (done) {
              return this.setState({ loadingReplies: false });
            }
            try {
              const feedInfo = await generateFeedInfoFromTransactionInfo(
                ribbit,
                transactionInfo
              );
              if (feedInfo) {
                const replies = this.state.replies;
                if (
                  this.props.feedInfo.transactionInfo.hash ===
                  originTransactionHash
                ) {
                  replies.push(feedInfo);
                  this.setState({ replies });
                }
              }
            } catch (error) {
              console.log(error);
            }
          }
        );
      }
    );
  }

  async loadParent(feedInfo: FeedInfo) {
    if (
      !feedInfo ||
      feedInfo.transactionInfo.decodedInputData.name !== "reply"
    ) {
      return;
    }
    const originTransactionHash = feedInfo.transactionInfo.hash;
    const parentTransactionHash =
      feedInfo.transactionInfo.decodedInputData.params["parentTransactionHash"]
        .value;
    try {
      const transactionInfo = await this.props.ribbit.getTransactionInfo({
        transactionHash: parentTransactionHash
      });
      const feedInfo = await generateFeedInfoFromTransactionInfo(
        this.props.ribbit,
        transactionInfo
      );

      if (feedInfo) {
        this.setState({ parent: feedInfo });
      }
    } catch (error) {
      console.log(error);
    }
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
      <div className="article-panel">
        <div className="parent">
          {this.state.parent ? (
            <FeedCard ribbit={this.props.ribbit} feedInfo={this.state.parent} />
          ) : null}
        </div>
        <div className="article-card card">
          <UserTopPanel ribbit={this.props.ribbit} feedInfo={feedInfo} />
          <div
            className="content"
            ref={elem => {
              this.elem = elem;
            }}
            dangerouslySetInnerHTML={{ __html: feedInfo.summary.html }}
          />
          {this.props.hideActionsPanel ? null : (
            <ActionsBottomPanel
              ribbit={this.props.ribbit}
              feedInfo={feedInfo}
            />
          )}
        </div>
        <div className="replies">
          {this.state.replies.map((feedInfo, index) => {
            return (
              <FeedCard
                key={index}
                feedInfo={feedInfo}
                ribbit={this.props.ribbit}
              />
            );
          })}
        </div>
        {this.state.replies.length ? (
          this.state.loadingReplies ? (
            <p id="feed-footer">Loading replies...</p>
          ) : (
            <p id="feed-footer">No more replies</p>
          )
        ) : null}
      </div>
    );
  }
}
