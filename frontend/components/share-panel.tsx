import * as React from "react";
import { I18n } from "react-i18next";

interface Props {
  close: () => void;
  networkId: number;
  transactionHash: string;
}
interface State {}

export default class SharePanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  clickSharePanel = event => {
    event.preventDefault();
    event.stopPropagation();
    this.props.close();
  };

  shareToFacebook = () => {
    const targetUrl = `https://shd101wyy.github.io/ribbit/#/${
      this.props.networkId
    }/tx/${this.props.transactionHash}`;
    window.open(
      "https://www.facebook.com/sharer/sharer.php?u=" +
        encodeURIComponent(targetUrl),
      "_blank"
    );
  };

  shareToTwitter = () => {
    const targetUrl = `https://shd101wyy.github.io/ribbit/#/${
      this.props.networkId
    }/tx/${this.props.transactionHash}`;
    window.open(
      "https://twitter.com/intent/tweet?text=" +
        encodeURIComponent("Check this Ribbit post!") +
        "&url=" +
        encodeURIComponent(targetUrl),
      "_blank"
    );
  };

  shareToReddit = () => {
    const targetUrl = `https://shd101wyy.github.io/ribbit/#/${
      this.props.networkId
    }/tx/${this.props.transactionHash}`;
    window.open(
      `http://www.reddit.com/submit?url=` + encodeURIComponent(targetUrl),
      "_blank"
    );
  };

  shareToLinkedin = () => {
    const targetUrl = `https://shd101wyy.github.io/ribbit/#/${
      this.props.networkId
    }/tx/${this.props.transactionHash}`;
    window.open(
      "https://www.linkedin.com/shareArticle?mini=true&url=" +
        encodeURIComponent(targetUrl) +
        "&title=" +
        encodeURIComponent("Check this Ribbit post!"),
      "_blank"
    );
  };

  shareToWeibo = () => {
    const targetUrl = `https://shd101wyy.github.io/ribbit/#/${
      this.props.networkId
    }/tx/${this.props.transactionHash}`;
    window.open(
      `http://service.weibo.com/share/share.php?url=${encodeURIComponent(
        targetUrl
      )}&title=${encodeURIComponent(
        "Check this Ribbit post!"
      )}&pic=&ralateUid=&language=zh_cn`
    );
  };

  render() {
    return (
      <I18n>
        {t => (
          <div className="share-panel" onClick={this.clickSharePanel}>
            <div
              className="share-card card"
              onClick={event => {
                event.stopPropagation();
              }}
            >
              <i className="fas fa-times" onClick={this.clickSharePanel} />
              <p className="title">Share to (WIP) </p>
              <div className="icons">
                <div
                  className="icon facebook-icon"
                  onClick={this.shareToFacebook}
                >
                  <i className="fab fa-facebook-f" />
                </div>
                <div
                  className="icon twitter-icon"
                  onClick={this.shareToTwitter}
                >
                  <i className="fab fa-twitter" />
                </div>
                <div className="icon reddit-icon" onClick={this.shareToReddit}>
                  <i className="fab fa-reddit-alien" />
                </div>
                <div
                  className="icon linkedin-icon"
                  onClick={this.shareToLinkedin}
                >
                  <i className="fab fa-linkedin-in" />
                </div>
                <div className="icon weibo-icon" onClick={this.shareToWeibo}>
                  <i className="fab fab fa-weibo" />
                </div>
              </div>
            </div>
          </div>
        )}
      </I18n>
    );
  }
}
