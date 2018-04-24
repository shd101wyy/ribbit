# ribbit

> I hope we didn't unleash a beast.

A decentralized social media web application based on Ethereum platform.  
基于以太坊的去中心化社交程序。

github: http://shd101wyy.github.io/ribbit/

## Usage

1.  Install [MetaMask](https://metamask.io/) in your Chrome browser and launch it.
2.  Switch to `Ropsten Testnet`. Get coints from faucet by clicking `Buy` button (don't worry, it's all fake money).
3.  Visit http://shd101wyy.github.io/ribbit/ to start using ribbit.

## Development

```bash
npm install 
npm run frontend:dev   # start building and watching.
npm run server:start     # start a static http server.
```

## Deployment

```bash
npm run frontend:build
```

then copy `./dist/index.html` and `./dist/app.bundle.js` to your server.

## References

* [web3.js](https://web3js.readthedocs.io/en/1.0/)
