import * as React from "react";

interface TopicProps {
  // topic name
  name: string;
}
interface TopicState {}
class Topic extends React.Component<TopicProps, TopicState> {
  constructor(props: TopicProps) {
    super(props);
  }

  render() {
    return (
      <div className="topic">
        <i className="icon fab fa-slack-hash" />
        <span className="name">{this.props.name}</span>
      </div>
    );
  }
}

interface Props {}
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
          <Topic name="ribbit" />
        </div>
      </div>
    );
  }
}
