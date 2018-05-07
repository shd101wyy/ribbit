# ribbit

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

* [ribbit](#ribbit)
  _ [Usage](#usage)
  _ [Make a post](#make-a-post)
  _ [Post to topic](#post-to-topic)
  _ [Mention a user](#mention-a-user)
  _ [Developer section](#developer-section)
  _ [Development](#development)
  _ [Deployment](#deployment)
  _ [References](#references)

<!-- /code_chunk_output -->

> I hope we didn't unleash a beast.

A decentralized social media web application based on Ethereum platform.  
基于以太坊的去中心化社交程序。

github: http://shd101wyy.github.io/ribbit/

## Usage

1.  Install [MetaMask](https://metamask.io/) in your Chrome browser and launch it.
2.  Switch to `Ropsten Testnet`. Get coints from faucet by clicking `Buy` button (don't worry, it's all fake money).
3.  Visit http://shd101wyy.github.io/ribbit/ to start using ribbit.

## Make a post

Post in ribbit are writtein in Markdown.
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

## Roadmap (TODO)

* Support `@import` in editor.

```markdown
@import "https://..."
@import "ipfs://..."
@import "ribbit://profile/..."
@import "ribbit://tx/..."
```

* Rich content editor.
* Multiple languages support.
* Support syncing user settings that are saved locally not on blockchain.

## Developer section

### Development

```bash
$ npm run frontend:prepare # install necessary node modules for development
                         # on Windows, you might need to run the following in advance:
                         #   $ npm install --global --production windows-build-tools
$ npm run frontend:dev     # start building and watching.
                         # then open a new terminal and run =>
$ npm run server:start     # start a static http server at address http://127.0.0.1:12345.
```

### Deployment

```bash
$ npm run frontend:build
```

then copy `./dist` to your server.

## References

* [web3.js](https://web3js.readthedocs.io/en/1.0/)
