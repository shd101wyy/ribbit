# ribbit

> Recommend to try this project on **Ropsten Test Network**.

An experimental, decentralized social media web application based on Ethereum platform.  
实验性质的，基于以太坊的去中心化社交程序。

* [English](./README.md)
* [中文](./README_CN.md)

Demo: 

* ribbit: http://shd101wyy.github.io/ribbit/
* `#{ribbit}` topic (Ropsten): https://shd101wyy.github.io/ribbit/#/3/topic/ribbit

Smart Contract:

* Main Ethereum Network [0x34a435f70226fa44ddd81bb2a546077b7091cf66](https://etherscan.io/address/0x34a435f70226fa44ddd81bb2a546077b7091cf66)
* Ropsten Test Network [0xa7191b181ddb0654233554599be89d0fc09cce7d](https://ropsten.etherscan.io/address/0xa7191b181ddb0654233554599be89d0fc09cce7d)

![](https://user-images.githubusercontent.com/1908863/39964114-7a7d8d20-5642-11e8-8d75-8a823240c36a.PNG)

---

> Below is the obsolete documentation.

**Please read this first:** 

* This project is still under development. We would recommend you to try this project on Ethereum `Ropsten Test Network` instead of `Main Ethereum Network`, because using Ribbit on `Ropsten Test Network` is completely free of charge, and we might deploy new smart contract in the future and deprecate the old one. We might also make changes to the smart contract on `Ropsten Test Network`, so your posts might lose. Please use this project at your own risk.  
* You are responsible for whatever you post. Think twice before you make a post because your post will stay on the blockchain **forever**. It is unchangeable and undeletable. All your posts will stay **public** on blockchain, so please don't post sensitive data.
* We do not host media files for you. We only save your text written in `markdown` to Ethereum blockchain.


<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

* [ribbit](#ribbit)
	* [Usage](#usage)
	* [Make a post](#make-a-post)
		* [Post to topic](#post-to-topic)
		* [Mention a user](#mention-a-user)
		* [Embed videos](#embed-videos)
	* [What will be saved to blockchain and what will not](#what-will-be-saved-to-blockchain-and-what-will-not)
	* [Developer section](#developer-section)
		* [Development](#development)
		* [Deployment](#deployment)
	* [References](#references)
	* [License](#license)

<!-- /code_chunk_output -->

## Usage

1.  Install [MetaMask](https://metamask.io/) in your Chrome browser and launch it. Follow the MetaMask instructions and create an account.
2.  Switch to `Ropsten Test Network`. Visit the faucet website listed below and request test ethers. Don't worry, they are fake ether coins.
	* http://faucet.ropsten.be:3001/ and click `request 1 ether from faucet`.
	* https://faucet.metamask.io/ and click `Send me 1 test ether!`
3.  Visit http://shd101wyy.github.io/ribbit/ to start using ribbit. The first time you visit ribbit website, it will ask you to finish a signup. Simply finish the form and then click `Publish profile to blockchain` button to create your account. Wait for a few minutes until the transaction finishes, then refresh your browser.

![signup1](https://user-images.githubusercontent.com/1908863/40032214-ce4c5ac2-57b8-11e8-960c-490efb893258.PNG)


> You may notice the `MetaMask` window pops up when you click `Publish profile to blockchain` button, that is because writing data to blockchain isn't free. You would have to pay for the miner to execute the transaction. You only need to change the `Gas Price` field in the MetaMask window. The higher `Gas Price` you set, the faster the transaction will be executed.
>
> ![metamask](https://user-images.githubusercontent.com/1908863/40032235-e3bf72fe-57b8-11e8-894a-6bfea9e39c3b.PNG)



## Make a post

To make post, click the green `Ribbit` button.

Posts in ribbit are written in Markdown.
There are two types of posts now:

* Normal post

for example:

```markdown
This is a normal post written in [markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet).
```

* Article post

for example:

```markdown
![](article/cover/image.png)

# Article title

my content goes here
```

### Post to topic

You can make a post to a topic by writing `#{topic}`.  
For example:

```markdown
Hello #{world} will post this to `world` topic
```

### Mention a user

You can mention a person in your post by writing `@{username}`.  
For example:

```markdown
Hi @{ribbit} will notify the user `ribbit` this about post.
```

### Embed videos

For example: 

```markdown
@[mp4](https://www.w3schools.com/html/mov\_bbb.mp4)
@[ogg](https://www.w3schools.com/html/mov\_bbb.ogg)
@[youtube](ZE2HxTmxfrI)
@[vimeo](269637018)
@[vine](5AZm7bleEj5)
@[bilibili](aid=23642605)
```

## What will be saved to blockchain and what will not

Will be on blockchain:
* Your profile information like your username, bio, avatar url, and cover url.
* Your posts written in markdown.

Will not be on blockchain:
* Your media files written in your markdown post, such as images, videos, etc...
* Your followings, faviorite topics, setttings will be saved locally in your browser. 


## Developer section

### Development

```bash
$ yarn                  # install necessary node modules for development
                        # on Windows, you might need to run the following in advance:
                        #   $ npm install --global --production windows-build-tools
$ yarn dev              # start building and watching.
                        # then open a new terminal and run =>
$ yarn serve            # start a static http server at address http://127.0.0.1:12345.
```

### Deployment

```bash
$ yarn build
```

then copy `./dist` to your server.

## References

* [web3.js](https://web3js.readthedocs.io/en/1.0/)


## License 

University of Illinois/NCSA
Open Source License
