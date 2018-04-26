import * as React from "react";

import Edit from "../components/edit";

import { FeedInfo } from "../lib/feed";
import { User } from "../lib/user";

interface Props {
  feedInfo: FeedInfo;
  user: User;
}
interface State {
  showEditPanel: boolean;
}

export default class ActionsBottomPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showEditPanel: false
    };
  }

  upvote = event => {
    event.preventDefault();
    event.stopPropagation();
    this.props.user
      .upvote(this.props.feedInfo.transactionInfo.hash)
      .then(hash => {
        // do nothing.
      })
      .catch(error => {
        alert(error);
      });
  };

  downvote = event => {
    event.preventDefault();
    event.stopPropagation();
    this.props.user
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

  donate = () => {
    alert("Not implemented");
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
          user={this.props.user}
          parentFeedInfo={this.props.feedInfo}
        />
      );
    }

    return (
      <div className="actions-bottom-panel">
        <div className="upvote-btn btn" onClick={this.upvote}>
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
        <div className="donate-btn btn" onClick={this.donate}>
          <i className="fas fa-dollar-sign" />
          <span className="comment-num">{stateInfo.earnings || ""}</span>
        </div>
      </div>
    );
  }
}
