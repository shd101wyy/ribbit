import * as React from "react";
import * as ReactDOM from "react-dom";

import "./less/entry.less";

interface Props {}
interface State {}
class App extends React.Component<Props, State> {
  render() {
    return <div>Hello World</div>;
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
