import * as React from "react";
import { Component } from "react";

import * as CodeMirror from "react-codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/markdown/markdown";

import Preview from "./preview";
import FeedCard from "./feed-card";

import history from "../lib/history";
import { Ribbit } from "../lib/ribbit";
import * as utility from "../lib/utility";
import { getTopicsAndMentionsFromHTML, FeedInfo } from "../lib/feed";
import { renderMarkdown } from "../lib/markdown";

interface Props {
  cancel: () => void;
  ribbit: Ribbit;
  /**
   * If feedInfo is provided, then it means it's a reply.
   */
  parentFeedInfo?: FeedInfo;
}
interface State {
  code: string;
  previewIsOn: boolean;
  topics: string[];
  hiddenTopics: { [key: string]: boolean };
  mentions: { name: string; address: string }[];
  hiddenMentions: { [key: string]: boolean }; // key is address
  replies: { name: string; address: string }[];
  hiddenReplies: { [key: string]: boolean }; // key is address
  postToRibbitTopic: boolean;
  postAsIPFSHash: boolean;
  repostToTimeline: boolean;
}

export default class Edit extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      code:
        window.localStorage["markdown-cache"] ||
        `<!-- Enter your text below -->
`,
      previewIsOn: false,
      topics: [],
      hiddenTopics: {},
      mentions: [],
      hiddenMentions: {},
      replies: [],
      hiddenReplies: {},
      postToRibbitTopic: false,
      postAsIPFSHash: false,
      repostToTimeline: false
    };
  }

  componentDidMount() {
    console.log("@@ MOUNT Edit @@", this.props.parentFeedInfo);
    utility.checkUserRegistration(this.props.ribbit);
    this.checkTopicsAndMentions();
    this.analyzeReplies();
    document.body.style.overflow = "hidden";
  }

  componentWillUnmount() {
    document.body.style.overflow = "auto";
  }

  async analyzeReplies() {
    if (!this.props.parentFeedInfo) {
      return;
    }
    const feedInfo = this.props.parentFeedInfo;
    let transactionInfo = feedInfo.transactionInfo;
    const replies = [];
    const exists = {};

    while (transactionInfo) {
      const address = transactionInfo.from;
      const name = (await this.props.ribbit.getUserInfoFromAddress(address))
        .name;
      if (!exists[address]) {
        exists[address] = true;
        replies.push({ name, address });
      }

      if (transactionInfo.decodedInputData.name === "post") {
        break;
      } else if (transactionInfo.decodedInputData.name === "repost") {
        const parentTransactionHash =
          transactionInfo.decodedInputData.params["parentTransactionHash"]
            .value;
        transactionInfo = await this.props.ribbit.getTransactionInfo({
          transactionHash: parentTransactionHash
        });
      } else {
        break;
      }
    }

    this.setState({
      replies
    });
  }

  private updateCode = (newCode: string) => {
    this.setState({ code: newCode }, () => {
      window.localStorage["markdown-cache"] = newCode;
      this.checkTopicsAndMentions();
    });
  };

  private checkTopicsAndMentions() {
    // check topics and mentions
    getTopicsAndMentionsFromHTML(
      renderMarkdown(this.state.code),
      this.props.ribbit
    ).then(({ topics, mentions }) => {
      if (
        JSON.stringify(this.state.topics) !== JSON.stringify(topics) ||
        JSON.stringify(this.state.mentions) !== JSON.stringify(mentions)
      ) {
        this.setState({
          topics,
          mentions
        });
      }
    });
  }

  private postFeed = async () => {
    // TODO: validate feed
    const ribbit = this.props.ribbit,
      content = this.state.code.trim();

    const topics = [];
    for (const topic of this.state.topics) {
      if (!this.state.hiddenTopics[topic]) {
        topics.push(topic);
      }
    }
    if (this.state.postToRibbitTopic) {
      topics.push("ribbit");
    }

    // TODO: replies
    const replies = [];
    for (const reply of this.state.replies) {
      if (!this.state.hiddenReplies[reply.address]) {
        replies.push(reply.address);
      }
    }

    // TODO: mentions
    const mentions = [];
    for (const mention of this.state.mentions) {
      if (!this.state.hiddenMentions[mention.address]) {
        mentions.push(mention.address);
      }
    }

    console.log(
      `${this.props.parentFeedInfo ? "reply" : "post"} feed         : `,
      this.state.code
    );
    console.log("     width replies: ", replies);
    console.log("     with topics  : ", topics);
    console.log("     with mentions: ", mentions);

    const tags = Array.from(new Set([...topics, ...mentions, ...replies]));
    try {
      if (this.props.parentFeedInfo) {
        // reply
        await ribbit.replyFeed(
          content,
          tags,
          this.state.repostToTimeline,
          this.props.parentFeedInfo,
          this.state.postAsIPFSHash
        );
      } else {
        // post
        await ribbit.postFeed(content, tags, this.state.postAsIPFSHash);
      }
      window.localStorage["markdown-cache"] = "";
      this.props.cancel();

      new window["Noty"]({
        type: "info",
        text: `Your post is being published to blockchain.\nPlease wait until the transaction finishes.`,
        timeout: 10000
      }).show();
    } catch (error) {
      alert(error);
    }
  };

  private togglePreview = () => {
    this.setState({ previewIsOn: !this.state.previewIsOn });
  };

  private toggleTopic = (topic: string) => {
    return () => {
      this.state.hiddenTopics[topic] = !this.state.hiddenTopics[topic];
      this.forceUpdate();
    };
  };

  private toggleMention = (address: string) => {
    return () => {
      this.state.hiddenMentions[address] = !this.state.hiddenMentions[address];
      this.forceUpdate();
    };
  };

  private toggleReply = (address: string) => {
    return () => {
      this.state.hiddenReplies[address] = !this.state.hiddenReplies[address];
      this.forceUpdate();
    };
  };

  clickEdit = event => {
    event.preventDefault();
    event.stopPropagation();
  };

  render() {
    const options = {
      lineNumbers: true,
      lineWrapping: true,
      autoFocus: true,
      mode: "markdown"
    };
    return (
      <div
        onClick={this.clickEdit}
        className={"edit " + (this.state.previewIsOn ? "preview-on" : "")}
      >
        {this.props.parentFeedInfo ? (
          <div>
            <h2 style={{ textAlign: "center" }}>Reply to</h2>
            <FeedCard
              ribbit={this.props.ribbit}
              feedInfo={this.props.parentFeedInfo}
              hideActionsPanel={true}
            />
          </div>
        ) : null}
        {this.state.previewIsOn ? (
          <div>
            <h2 style={{ textAlign: "center" }}>Preview</h2>
            {/* topics */}
            <div className="topics-and-mentions card">
              {this.state.topics.length ? (
                <p className="title">Post to topics:</p>
              ) : null}
              <div className="topics-list">
                {this.state.topics.map((topic, offset) => (
                  <div
                    className={
                      "topic " +
                      (this.state.hiddenTopics[topic] ? "hidden" : "")
                    }
                    key={offset}
                    onClick={this.toggleTopic(topic)}
                  >
                    {topic}
                  </div>
                ))}
              </div>
              {this.state.replies.length ? (
                <p className="title">Reply to the following users:</p>
              ) : null}
              <div className="replies-list">
                {this.state.replies.map((reply, offset) => (
                  <div
                    className={
                      "reply " +
                      (this.state.hiddenReplies[reply.address] ? "hidden" : "")
                    }
                    key={offset}
                    onClick={this.toggleReply(reply.address)}
                  >
                    {reply.name}
                  </div>
                ))}
              </div>
              {this.state.mentions.length ? (
                <p className="title">Mention the following users:</p>
              ) : null}
              <div className="mentions-list">
                {this.state.mentions.map((mention, offset) => (
                  <div
                    className={
                      "mention " +
                      (this.state.hiddenMentions[mention.address]
                        ? "hidden"
                        : "")
                    }
                    key={offset}
                    onClick={this.toggleMention(mention.address)}
                  >
                    {mention.name}
                  </div>
                ))}
              </div>
              <p className="title">Configuration:</p>
              <div className="config-list">
                {this.props.parentFeedInfo ? (
                  <div
                    className={
                      "config" + (this.state.repostToTimeline ? "" : " hidden")
                    }
                    onClick={() =>
                      this.setState({
                        repostToTimeline: !this.state.repostToTimeline
                      })
                    }
                  >
                    {" "}
                    Repost to timeline
                  </div>
                ) : null}
                <div
                  className={
                    "config" + (this.state.postToRibbitTopic ? "" : " hidden")
                  }
                  onClick={() =>
                    this.setState({
                      postToRibbitTopic: !this.state.postToRibbitTopic
                    })
                  }
                >
                  {" "}
                  Post to #ribbit
                </div>
                <div
                  className={
                    "config" + (this.state.postAsIPFSHash ? "" : " hidden")
                  }
                  onClick={() =>
                    this.setState({
                      postAsIPFSHash: !this.state.postAsIPFSHash
                    })
                  }
                >
                  {" "}
                  Post as IPFS hash
                </div>
              </div>
            </div>
            {/* preview */}
            <Preview markdown={this.state.code} ribbit={this.props.ribbit} />
          </div>
        ) : (
          <div>
            <h2 style={{ textAlign: "center" }}>Write below</h2>
            <div className="editor-wrapper">
              <CodeMirror
                value={this.state.code}
                onChange={this.updateCode}
                options={options}
              />
            </div>
          </div>
        )}
        <div className="button-group">
          {this.state.previewIsOn ? (
            <div className="button" onClick={this.postFeed}>
              <i className="fa fa-paper-plane" aria-hidden="true" />
            </div>
          ) : null /* We can only show `post` button after user has seen the preview. */}

          <div className="button" onClick={this.togglePreview}>
            {this.state.previewIsOn ? (
              <i className="fa fa-eye-slash" aria-hidden="true" />
            ) : (
              <i className="fa fa-eye" aria-hidden="true" />
            )}
          </div>
          <div className="button" onClick={this.props.cancel}>
            <i className="fa fa-times" aria-hidden="true" />
          </div>
        </div>
      </div>
    );
  }
}
