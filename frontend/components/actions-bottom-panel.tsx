import * as React from "react";

import Edit from "../components/edit";
import DonatePanel from "../components/donate-panel";

import { FeedInfo } from "../lib/feed";
import { Ribbit } from "../lib/ribbit";

interface Props {
  feedInfo: FeedInfo;
  ribbit: Ribbit;
}
interface State {
  showEditPanel: boolean;
  showDonatePanel: boolean;
}

export default class ActionsBottomPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showEditPanel: false,
      showDonatePanel: false
    };
  }

  /*
  upvote = event => {
    event.preventDefault();
    event.stopPropagation();
    this.props.ribbit
      .upvote(this.props.feedInfo.transactionInfo.hash)
      .then(hash => {
        // do nothing.
      })
      .catch(error => {
        alert(error);
      });
  };
  */

  downvote = event => {
    event.preventDefault();
    event.stopPropagation();
    this.props.ribbit
      .downvote(this.props.feedInfo.transactionInfo.hash)
      .then(hash => {
        // do nothing
      })
      .catch(error => {
        alert(error);
      });
  };

  reply = event => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      showEditPanel: true
    });
  };

  toggleDonatePanel = event => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ showDonatePanel: true });
  };

  render() {
    const summary = this.props.feedInfo.summary;
    const transactionInfo = this.props.feedInfo.transactionInfo;
    const userInfo = this.props.feedInfo.userInfo;
    const stateInfo = this.props.feedInfo.stateInfo;
    const repostUserInfo = this.props.feedInfo.repostUserInfo;
    const feedType = this.props.feedInfo.feedType;

    if (!transactionInfo || !transactionInfo.hash) {
      return null;
    }

    if (this.state.showEditPanel) {
      return (
        <Edit
          cancel={() => {
            this.setState({ showEditPanel: false });
          }}
          ribbit={this.props.ribbit}
          parentFeedInfo={this.props.feedInfo}
        />
      );
    }

    return (
      <div className="actions-bottom-panel">
        <div className="upvote-btn btn" onClick={this.toggleDonatePanel}>
          <i className="fas fa-caret-up">
            {stateInfo.upvotes ? (
              <span className="upvote-num">{stateInfo.upvotes}</span>
            ) : null}
          </i>
        </div>
        <div className="downvote-btn btn" onClick={this.downvote}>
          <i className="fas fa-caret-down" />
          {/* <span className="downvote-num">{stateInfo.downvotes || ""}</span> */}
        </div>
        <div className="reply-btn btn" onClick={this.reply}>
          <i className="far fa-comment" />
          <span className="comment-num">{stateInfo.replies || ""}</span>
        </div>
        {/*
        <div className="donate-btn btn" onClick={this.donate}>
          <i className="fas fa-dollar-sign" />
          <span className="comment-num">{stateInfo.earnings || ""}</span>
        </div>
        */}
        {this.state.showDonatePanel ? (
          <DonatePanel
            close={() => this.setState({ showDonatePanel: false })}
            feedInfo={this.props.feedInfo}
            ribbit={this.props.ribbit}
          />
        ) : null}
      </div>
    );
  }
}
