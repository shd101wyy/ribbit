/**
 * /:networkId/topic/:topic
 */
import * as React from "react";
import { I18n } from "react-i18next";
import { Ribbit, UserInfo } from "../lib/ribbit";
import {
  FeedInfo,
  generateSummaryFromHTML,
  generateFeedInfoFromTransactionInfo
} from "../lib/feed";
import { checkNetworkId } from "../lib/utility";
import { renderMarkdown } from "../lib/markdown";
import FeedCard from "../components/feed-card";
import ProfileCard from "../components/profile-card";
import Header from "../components/header";
import TopicFeedCards from "../components/topic-feed-cards";
import { TransactionInfo } from "../lib/transaction";

interface Props {
  ribbit: Ribbit;
  networkId: number;
  topic: string;
}
interface State {
  cover: string;
  following: boolean;
  mouseOver: boolean;
}

export default class profile extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      cover: null,
      following: true,
      mouseOver: false
    };
  }

  componentDidMount() {
    checkNetworkId(this.props.ribbit, this.props.networkId);
    this.initializeTopic(this.props.topic);
  }

  componentWillReceiveProps(newProps: Props) {
    // if (newProps.topic !== this.props.topic) {
    checkNetworkId(newProps.ribbit, newProps.networkId);
    this.initializeTopic(newProps.topic);
    // }
  }

  async initializeTopic(topic: string) {
    // check following or not
    const followingTopics = this.props.ribbit.settings.followingTopics;
    const following = !!followingTopics.filter(x => x.topic === topic).length;
    this.setState({
      following
    });

    // update cover
    const ribbit = this.props.ribbit;
    const formattedTag = ribbit.formatTag(topic);
    const blockNumber = parseInt(
      await ribbit.contractInstance.methods
        .getCurrentTagInfoByTrend(formattedTag)
        .call()
    );
    if (blockNumber) {
      const transactionInfo = await ribbit.getTransactionInfo({
        tag: formattedTag,
        maxCreation: Date.now(),
        blockNumber
      });
      if (transactionInfo) {
        const authorAddress = transactionInfo.from;
        const userInfo = await ribbit.getUserInfoFromAddress(authorAddress);
        if (userInfo) {
          this.setState({
            cover: userInfo.cover
          });
        }
      }
    }
  }

  followTopic = () => {
    this.props.ribbit
      .followTopic(this.props.topic)
      .then(() => {
        this.setState({
          following: true
        });
      })
      .catch(error => {
        new window["Noty"]({
          type: "error",
          text: error,
          timeout: 10000
        }).show();
      });
  };

  unfollowTopic = () => {
    this.props.ribbit
      .unfollowTopic(this.props.topic)
      .then(() => {
        this.setState({
          following: false
        });
      })
      .catch(error => {
        new window["Noty"]({
          type: "error",
          text: error,
          timeout: 10000
        }).show();
      });
  };

  render() {
    /**
     * Prevent from loading user address as topic.
     */
    if (this.props.ribbit.web3.utils.isAddress(this.props.topic)) {
      return (
        <I18n>
          {(t, { i18n }) => (
            <div className="topic-page">
              <p id="feed-footer">
                {t("general/invalid-topic")} {this.props.topic}
              </p>
            </div>
          )}
        </I18n>
      );
    }
    return (
      <I18n>
        {(t, { i18n }) => (
          <div className="topic-page">
            <Header ribbit={this.props.ribbit} />
            <div className="container">
              <div className="topic-card card">
                <div
                  className="cover"
                  style={{
                    backgroundImage: this.state.cover
                      ? `url("${this.state.cover}")`
                      : null
                  }}
                />
                <p className="title">#{this.props.topic}</p>
                {this.state.following ? (
                  this.state.mouseOver ? (
                    <div
                      className="follow-btn"
                      onMouseEnter={() => this.setState({ mouseOver: true })}
                      onMouseLeave={() => this.setState({ mouseOver: false })}
                      onClick={this.unfollowTopic}
                    >
                      {t("general/unfollow")}
                    </div>
                  ) : (
                    <div
                      className="follow-btn"
                      onMouseEnter={() => this.setState({ mouseOver: true })}
                      onMouseLeave={() => this.setState({ mouseOver: false })}
                    >
                      {t("general/following")}
                    </div>
                  )
                ) : (
                  <div className="follow-btn" onClick={this.followTopic}>
                    {t("general/follow")}
                  </div>
                )}
              </div>
              <TopicFeedCards
                ribbit={this.props.ribbit}
                topic={this.props.topic}
              />
            </div>
          </div>
        )}
      </I18n>
    );
  }
}
