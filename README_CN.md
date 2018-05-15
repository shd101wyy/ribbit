# ribbit

> 这个项目已被**弃用**，因为以太坊主网使用的高成本和缓慢的交易速度。

An experimental, decentralized social media web application based on Ethereum platform.  
实验性质的，基于以太坊的去中心化社交程序。

* [English](./README.md)
* [中文](./README_CN.md)

示例网站：http://shd101wyy.github.io/ribbit/

![](https://user-images.githubusercontent.com/1908863/39964117-8880667c-5642-11e8-956e-ea8210aaaf07.PNG)


---

> 以下为旧文档


**在使用 Ribbit 之前，请先阅读一下内容** 

* 这个项目依然在开发当中。我们推荐你使用以太坊的 `Ropstren 测试网络` 而不是 `主网络`，以为在 `Ropsten 测试网络` 上面运行 `Ribbit` 是完全免费的，并且我们可能会在将来发布新的智能合约并且作废掉旧的智能合约。我们也可能会修改 `Ropsten 测试网络` 上面的智能合约，所以你发布的文字可能会消失。请自己承担使用该项目的风险。
* 你应该对你发布的文字负责。在你发布文字之前，请多思考一遍。因为你发布的文字将会**永久**的存留在区块链上。它会是无法更改的，且无法被删除的。所有你发布的文字将会是完全**公开**的，所以请不要发布敏感信息。
* 我们不会保存你的媒体文件，我们只会保存你的 `markdown` 文字到以太坊区块链上。

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

* [ribbit](#ribbit)
	* [使用](#使用)
	* [发布文字](#发布文字)
		* [发布到话题](#发布到话题)
		* [提到用户](#提到用户)
	* [什么会被保存到区块链上，什么不会](#什么会被保存到区块链上什么不会)
	* [开发者部分](#开发者部分)
		* [开发](#开发)
		* [部署](#部署)
	* [参考](#参考)
	* [License](#license)

<!-- /code_chunk_output -->

## 使用

1.  在 Chrome 浏览器中安装 [MetaMask](https://metamask.io/) 插件并启动它。根据提示完成 MetaMask 钱包账号注册。
2.  切换至 `Ropsten 测试网络` (点击左上角 `Main Ethereum Network` 然后选择 `Ropsten Test Network` 完成网络切换)。打开一下网站并且请求测试用的以太币。请不必担心，这些都是假的以太币。
	* http://faucet.ropsten.be:3001/ 然后点击 `request 1 ether from faucet`.
	* https://faucet.metamask.io/ 然后点击 `Send me 1 test ether!`
3.  访问 http://shd101wyy.github.io/ribbit/ 开始使用 ribbit。当你第一次访问 ribbit 网站是，它会要求你完成注册。请在`语言`中选择`简体中文`，然后填写完表格，接着点击 `发布个人信息到区块链` 按钮。等候几分钟直到交易结束，然后刷新你的浏览器开始使用。

> 当你点击 `发布个人信息到区块链` 按钮后，你会发现 `MetaMask` 会弹出个支付窗口，那是因为往区块链中写数据不是免费的。你需要支付给矿工费用来执行交易。你只需要改变其中的 `Gas Price（油价）`。设置的 `Gas Price (油价)` 越高，交易完成的速度越快。

## 发布文字

ribbit 中发布的文字是基于 Markdown 格式的。
这里有两种分类：

* 普通

例如：

```markdown
这是一段写于 [markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) 的普通文字。
```

* 文章

例如：

```markdown
![](文章/封面/图片.png)

# 文章标题

你的文章内容
```

### 发布到话题

你可以发布你的文字到一个话题通过编写 `#{话题}`。  
例如：  

```markdown
你好 #{世界} 将会发布这段文字到 `世界` 主题。
```

### 提到用户

你可以提到一个用户通过编写 `@{用户名}`。
例如

```markdown
你好 @{ribbit} 将会通知用户 `ribbit` 这段文字。
```

## 什么会被保存到区块链上，什么不会

将会被保存在区块链上的有：
* 你的个人信息，例如 用户名，个人简介，头像图片链接，墙图片链接。
* 你写于 markdown 格式下的文字。

不会被保存到区块链上的有：
* 你的 markdown 文字下引用的媒体文件，例如图片，视频，等。
* 你关注的人，关注的话题，程序设置将会被保存在浏览器本地。

## 开发者部分

### 开发

```bash
$ npm run frontend:prepare # 安装相应的依赖
                           # 如果你使用的是 Windows，请先运行下面的命令：
                           #   $ npm install --global --production windows-build-tools
$ npm run frontend:dev     # 开始 building 以及 watching 前端文件。
                           # 打开一个新的 terminal 终端，然后运行 =>
$ npm run server:start     # 启动 http://127.0.0.1:12345 地址下的服务器。
```

### 部署

```bash
$ npm run frontend:build
```

然后复制 `./dist` 下的文件到你的服务器。

## 参考

* [web3.js](https://web3js.readthedocs.io/en/1.0/)


## License 

University of Illinois/NCSA
Open Source License