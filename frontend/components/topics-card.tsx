import * as React from "react";
import { Link } from "react-router-dom";

import { Ribbit } from "../lib/ribbit";

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
      <Link
        to={`/${this.props.networkId}/topic/${this.props.name}`}
        target="_blank"
      >
        <div className="topic">
          <i className="fas fa-hashtag" />
          <span className="name">{this.props.name}</span>
        </div>
      </Link>
    );
  }
}

interface Props {
  ribbit: Ribbit;
}
interface State {}
export default class TopicsCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const ribbit = this.props.ribbit;
    return (
      <div className="topics-card card">
        <p className="title">my favorite topics</p>
        <div className="topics-list">
          {ribbit.settings.followingTopics.map((followingTopic, offset) => {
            return (
              <Topic
                name={followingTopic.topic}
                networkId={ribbit.networkId}
                key={offset}
              />
            );
          })}
        </div>
      </div>
    );
  }
}
