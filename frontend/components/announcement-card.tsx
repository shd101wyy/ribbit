import * as React from "react";

interface Props {}
interface State {}

export default class AnnouncementCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <div className="announcement-card card">
        <div className="top-bar">
          <i className="fas fa-bullhorn" />
        </div>
      </div>
    );
  }
}
