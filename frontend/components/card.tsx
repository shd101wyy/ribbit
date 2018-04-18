import * as React from "react";
import { Component } from "react";

import ImagesPanel from "./images-panel";

import { Summary } from "../lib/utility";

interface Props {
  summary: Summary;
}
interface State {}

export default class Card extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  render() {
    const userPanel = (
      <div className="user-panel">
        <div
          className="profile-image"
          style={{
            backgroundImage: `url("https://avatars3.githubusercontent.com/u/1908863?s=460&v=4")`
          }}
        />
        <div className="name">Yiyi Wang</div>
        <div className="userid">shd101wyy</div>
        <div className="postfix">c862b4eel</div>
        <div className="action">post feed</div>
        <div className="create-time">
          <span> 1 hour ago</span>
        </div>
      </div>
    );

    if (this.props.summary.title) {
      // Article
      return (
        <div className="card">
          {userPanel}
          <div className="content-panel">
            {this.props.summary.images.length ? (
              <div
                className="cover"
                style={{
                  backgroundImage: `url("${this.props.summary.images[0]}")`
                }}
              />
            ) : null}
            <div className="title">{this.props.summary.title}</div>
            <div
              className="summary"
              dangerouslySetInnerHTML={{ __html: this.props.summary.summary }}
            />
          </div>
          <div className="button-group" />
        </div>
      );
    } else {
      // Normal
      return (
        <div className="card">
          {userPanel}
          <div className="content-panel">
            <div
              className="summary"
              dangerouslySetInnerHTML={{ __html: this.props.summary.summary }}
            />
            <ImagesPanel images={this.props.summary.images} />
          </div>
        </div>
      );
    }
  }
}
