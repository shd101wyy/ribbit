import * as React from "react";

interface TopicProps {
  name: string;
  networkId: number;
}
interface TopicState {}
class Topic extends React.Component<TopicProps, TopicState> {
  constructor(props: TopicProps) {
    super(props);
  }

  render() {
    return (
      <a
        href={`/#/${this.props.networkId}/topic/${this.props.name}`}
        target="_blank"
      >
        <div className="topic">
          <i className="fas fa-hashtag" />
          <span className="name">{this.props.name}</span>
        </div>
      </a>
    );
  }
}

interface Props {
  networkId: number;
}
interface State {}
export default class TopicsCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <div className="topics-card card">
        <p className="title">my favorite topics</p>
        <div className="topics-list">
          <Topic name="ribbit" networkId={this.props.networkId} />
        </div>
      </div>
    );
  }
}
