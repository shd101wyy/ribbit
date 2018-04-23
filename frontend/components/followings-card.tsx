import * as React from "react";
import { User, UserInfo } from "../lib/user";
import { Link } from "react-router-dom";

interface FollowingProps {
  userAddress: string;
  user: User;
  networkId: number;
}
interface FollowingState {
  userInfo: UserInfo;
}
class Following extends React.Component<FollowingProps, FollowingState> {
  constructor(props: FollowingProps) {
    super(props);
    this.state = {
      userInfo: null
    };
  }

  componentDidMount() {
    this.initializeFollowing(this.props.userAddress);
  }

  componentWillUpdate(newProps: FollowingProps) {
    if (newProps.userAddress !== this.props.userAddress) {
      this.initializeFollowing(newProps.userAddress);
    }
  }

  private async initializeFollowing(userAddress: string) {
    const userInfo = await this.props.user.getUserInfo(userAddress);
    this.setState({
      userInfo
    });
  }

  render() {
    const userInfo = this.state.userInfo;
    if (!userInfo) {
      return (
        <Link
          to={`/${this.props.networkId}/profile/${this.props.userAddress}`}
          target="_blank"
        >
          <div className="following">
            <p className="msg">loading {this.props.userAddress}</p>
          </div>
        </Link>
      );
    }
    return (
      <Link
        to={`/${this.props.networkId}/profile/${this.props.userAddress}`}
        target="_blank"
      >
        <div className="following">
          <div
            className="avatar"
            style={{ backgroundImage: `url("${userInfo.avatar}")` }}
          />
          <div className="name-group">
            <p className="name">{userInfo.name}</p>
          </div>
        </div>
      </Link>
    );
  }
}

interface Props {
  user: User;
  networkId: number;
}
interface State {}
export default class FollowingsCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <div className="followings-card card">
        <p className="title">my followings</p>
        <div className="followings-list">
          <Following
            userAddress={this.props.user.accountAddress}
            user={this.props.user}
            networkId={this.props.networkId}
          />
        </div>
      </div>
    );
  }
}
