import * as React from "react";
import { Component } from "react";

import * as CodeMirror from "react-codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/markdown/markdown";

import Preview from "./preview";

import history from "../lib/history";
import { User } from "../lib/user";
import * as utility from "../lib/utility";

interface Props {
  cancel: () => void;
  user: User;
}
interface State {
  code: string;
  previewIsOn: boolean;
}

export default class Edit extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      code:
        window.localStorage["markdown-cache"] ||
        `<!-- Enter your text below -->
`,
      previewIsOn: false
    };
  }

  componentDidMount() {
    console.log("@@ MOUNT Edit @@");
  }

  private updateCode = (newCode: string) => {
    this.setState({ code: newCode }, () => {
      window.localStorage["markdown-cache"] = newCode;
    });
  };

  private postFeed = async () => {
    // TODO: validate feed
    console.log("post feed: ", this.state.code);
    const user = this.props.user,
      content = this.state.code.trim();

    try {
      await user.postFeed(content);
      window.localStorage["markdown-cache"] = "";
      this.props.cancel();
    } catch (error) {
      alert(error);
    }
  };

  private togglePreview = () => {
    this.setState({ previewIsOn: !this.state.previewIsOn });
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
          <Preview markdown={this.state.code} />
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
