import * as React from "react";
import { I18n } from "react-i18next";

interface Props {}
interface State {}
export default class Error extends React.Component<Props, State> {
  render() {
    return (
      <I18n>
        {(t, { i18n }) => (
          <div className="home">
            <div className="container">
              <p id="feed-footer">
                {t("components/error/feed-footer-part1")}{" "}
                <a href="https://metamask.io/" target="_blank">
                  MetaMask
                </a>{" "}
                {t("components/error/feed-footer-part2")}
              </p>
            </div>
          </div>
        )}
      </I18n>
    );
  }
}
