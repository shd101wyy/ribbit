import * as React from "react";
import { Component } from "react";

import * as CodeMirror from "react-codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/markdown/markdown";

import Preview from "./preview";

import history from "../lib/history";
import { User } from "../lib/user";
import * as utility from "../lib/utility";
import { getTopicsAndMentionsFromHTML } from "../lib/feed";
import { renderMarkdown } from "../lib/markdown";

interface Props {
  cancel: () => void;
  user: User;
}
interface State {
  code: string;
  previewIsOn: boolean;
  topics: string[];
  hiddenTopics: { [key: string]: boolean };
  mentions: string[];
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
      mentions: []
    };
  }

  componentDidMount() {
    console.log("@@ MOUNT Edit @@");
    this.checkTopicsAndMentions();
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
      this.props.user
    ).then(({ topics, mentions }) => {
      if (JSON.stringify(this.state.topics) !== JSON.stringify(topics)) {
        this.setState({
          topics: topics
        });
      }
    });
  }

  private postFeed = async () => {
    // TODO: validate feed
    const user = this.props.user,
      content = this.state.code.trim();

    const topics = [];
    for (const topic of this.state.topics) {
      if (!this.state.hiddenTopics[topic]) {
        topics.push(topic);
      }
    }
    console.log("post feed       : ", this.state.code);
    console.log("     with topics: ", topics);

    const tags = [];
    try {
      await user.postFeed(content, tags);
      window.localStorage["markdown-cache"] = "";
      this.props.cancel();
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

  render() {
    const options = {
      lineNumbers: false,
      autoFocus: true,
      mode: "markdown"
    };
    return (
      <div className="edit">
        {this.state.previewIsOn ? (
          <div>
            {/* topics */}
            <div className="topics-and-mentions card">
              <p className="title">Post to topics:</p>
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
            </div>
            {/* preview */}
            <Preview markdown={this.state.code} user={this.props.user} />
          </div>
        ) : (
          <CodeMirror
            value={this.state.code}
            onChange={this.updateCode}
            options={options}
          />
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
