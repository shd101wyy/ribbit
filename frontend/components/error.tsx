import * as React from "react";

interface Props {}
interface State {}
export default class Error extends React.Component<Props, State> {
  render() {
    return (
      <div className="home">
        <div className="container">
          <p id="feed-footer">
            Please make sure{" "}
            <a href="https://metamask.io/" target="_blank">
              MetaMask
            </a>{" "}
            is working in your browser.
          </p>
        </div>
      </div>
    );
  }
}
