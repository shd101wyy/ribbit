import * as React from "react";
import { I18n } from "react-i18next";

interface Props {}
interface State {}
export default class Error extends React.Component<Props, State> {
  render() {
    return (
      <I18n>
        {(t, { i18n }) => (
          <div className="error-page">
            <div className="container" style={{ flexDirection: "column" }}>
              <p className="error-msg">
                {t("components/error/feed-footer-part1", { lng: "zh" })}{" "}
                <a href="https://metamask.io/" target="_blank">
                  MetaMask
                </a>{" "}
                {t("components/error/feed-footer-part2", { lng: "zh" })}
              </p>
              <p className="error-msg">
                {t("components/error/feed-footer-part1", { lng: "en" })}{" "}
                <a href="https://metamask.io/" target="_blank">
                  MetaMask
                </a>{" "}
                {t("components/error/feed-footer-part2", { lng: "en" })}
              </p>
            </div>
          </div>
        )}
      </I18n>
    );
  }
}
