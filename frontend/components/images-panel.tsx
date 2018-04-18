import * as React from "react";
import { Component } from "react";

import * as utility from "../lib/utility";

interface Props {
  images: string[];
}

interface State {}

export default class ImagesPanel extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    if (!this.props.images.length) {
      return <div />;
    } else if (this.props.images.length === 1) {
      return (
        <div className="images-panel single-image">
          <img src={this.props.images[0]} />
        </div>
      );
    } else if (this.props.images.length <= 4) {
      return (
        <div className="images-panel le-four-images">
          {this.props.images.map((imageSrc, index) => (
            <div className="image-wrapper" key={index}>
              <div
                className="image"
                style={{ backgroundImage: `url("${imageSrc}")` }}
              />
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="images-panel gt-four-images">
          {this.props.images.map((imageSrc, index) => {
            if (index > 8) {
              return null; // maximal 9 images
            } else {
              return (
                <div className="image-wrapper" key={index}>
                  <div
                    className="image"
                    style={{ backgroundImage: `url("${imageSrc}")` }}
                  />
                </div>
              );
            }
          })}
        </div>
      );
    }
  }
}
