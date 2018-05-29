import * as React from "react";
import { I18n } from "react-i18next";

import { Ribbit } from "../lib/ribbit";
import { FeedInfo } from "../lib/feed";
import i18n from "../i18n/i18n";

interface Props {
  ribbit: Ribbit;
  feedInfo: FeedInfo;
  close: () => void;
}
interface State {
  exchangeRate: number;
  etherInput: string;
  currency: number;
  ether: number;
}

export default class DonatePanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      exchangeRate: 0,
      etherInput: "",
      currency: 0,
      ether: 0
    };
  }

  componentDidMount() {
    fetch("https://api.coinmarketcap.com/v1/ticker/ethereum/")
      .then(x => x.json())
      .then(([data]) => {
        const priceUSD = parseFloat(data["price_usd"]);
        if (priceUSD > 0) {
          this.setState({
            exchangeRate: priceUSD
          });
        }
      });
  }

  clickDonatePanel = event => {
    event.preventDefault();
    event.stopPropagation();
    this.props.close();
  };

  changeEther = event => {
    this.setState(
      {
        etherInput: event.target.value
      },
      () => {
        const exchangeRate = this.state.exchangeRate;
        if (exchangeRate) {
          const ether = parseFloat(this.state.etherInput);
          const currency = ether * exchangeRate;
          if (!isNaN(currency)) {
            this.setState({
              currency,
              ether
            });
          }
        }
      }
    );
  };

  upvote = () => {
    const ether = this.state.ether;
    const wei = ether * 1000000000000000000;
    const authorAddress = wei
      ? this.props.feedInfo.userInfo.address
      : "0x0000000000000000000000000000000000000000"; // if wei is zero, then no donation, set userAddress to empty
    this.props.ribbit
      .upvote(this.props.feedInfo.transactionInfo.hash, authorAddress, wei)
      .then(hash => {
        // do nothing.
        new window["Noty"]({
          type: "info",
          text: i18n.t("notification/publish-upvote"),
          timeout: 10000
        }).show();
      })
      .catch(error => {
        new window["Noty"]({
          type: "error",
          text: JSON.stringify(error),
          timeout: 10000
        }).show();
      });
    this.props.close();
  };

  render() {
    const userInfo = this.props.feedInfo.userInfo;
    return (
      <I18n>
        {t => (
          <div className="donate-panel" onClick={this.clickDonatePanel}>
            <div
              className="donate-card card"
              onClick={event => {
                event.stopPropagation();
              }}
            >
              <i className="fas fa-times" onClick={this.clickDonatePanel} />
              <div
                className="avatar"
                style={{ backgroundImage: `url("${userInfo.avatar}")` }}
              />
              <p className="name">{userInfo.name}</p>
              <div className="donate-wrapper">
                <input
                  className="donate-input"
                  type="text"
                  placeholder={t("components/donate-panel/donate-placeholder")}
                  value={this.state.etherInput}
                  onChange={this.changeEther}
                />
                {this.state.exchangeRate && this.state.currency ? (
                  <p className="currency">
                    {this.state.currency} {t("general/USD")}
                  </p>
                ) : null}
              </div>
              <div className="upvote-btn" onClick={this.upvote}>
                <i className="fas fa-caret-up" />
                <span>{t("general/Upvote")}</span>
              </div>
            </div>
          </div>
        )}
      </I18n>
    );
  }
}
