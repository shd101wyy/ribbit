import i18next from "i18next";

i18next.init({
  interpolation: {
    // React already does escaping
    escapeValue: false
  },
  lng: "en", // "en" | "zh"
  resources: {
    en: {
      translation: {
        "general/by-trend": "By trend",
        "general/by-time": "By time",
        "general/follow": "Follow",
        "general/following": "Following",
        "general/unfollow": "Unfollow",
        "general/invalid-topic": "Invalid topic",
        "general/and": "and",
        "general/upvoted": "upvoted",
        "general/donated": "donated",
        "general/Upvote": "Upvote",
        "general/Write-below": "Write below",
        "general/Preview": "Preview",
        "general/Reply-to": "Reply to",
        "general/Post-to-topics": "Post to topics",
        "general/Reply-to-the-following-users": "Reply to the following users",
        "general/Mention-the-following-users": "Mention the following users",
        "general/Configuration": "Configuration",
        "general/Repost-to-timeline": "Repost to timeline",
        "general/Post-to-ribbit": "Post to #{ribbit} topic",
        "general/Post-as-IPFS-hash": "Post as IPFS hash (Infura)",
        "general/username": "username",
        "general/Username": "Username",
        "general/topic": "topic",
        "general/Display-name": "Display name",
        "general/Avatar-URL": "Avatar URL",
        "general/Cover-URL": "Cover URL",
        "general/Bio-markdown-ready": "Bio (markdown ready)",
        "general/Profile-preview": "Profile preview",
        "general/No-more-replies": "No more replies ;)",
        "general/No-more-feeds": "No more feeds ;)",
        "general/USD": "USD",
        "components/error/feed-footer-part1": "Please make sure",
        "components/error/feed-footer-part2":
          "is running and unlocked in your browser. Switch to Ropsten Test Net, then refresh your browser.",
        "components/header/home": "Home",
        "components/header/topics": "Topics",
        "components/header/notifications": "Notifications",
        "components/header/settings": "Settings",
        "components/header/search-box-placeholder":
          "Enter @username here or #topic that you are interested. ",
        "components/followings-card/title": "my followings",
        "components/topics-card/title": "my favorite topics",
        "components/profile-settings-card/title": "Profile settings",
        "components/profile-settings-card/publish":
          "Publish profile to blockchain",
        "components/profile-settings-card/avatar-url-placeholder":
          "Avatar image url starting with http:// or https://",
        "components/profile-settings-card/cover-url-placeholder":
          "Cover image url starting with http:// or https://",
        "components/profile-settings-card/delete-app-cache":
          "Delete app local cache",
        "components/donate-panel/donate-placeholder":
          "(optional) donate 0.0000 ether to author",
        "routes/signup/title": "Welcome to use Ribbit!",
        "routes/signup/subtitle":
          "Please finish your account registration below",
        "routes/signup/topic-demo": "Or check the topic demo: ",
        "notification/init-error":
          "Failed to initialize Ribbit. Please make sure you have MetaMask enabled and unlocked.",
        "notification/publish-profile": `Profile is being published to blockchain.\nPlease wait until the transaction finishes, then refresh your browser.`,
        "notification/publish-profile-success": `Your profile information is now saved on blockchain. Please refresh your browser.`,
        "notification/publish-profile-failure": `Failed to save your profile to blockchain.`,
        "notification/publish-downvote": `Your downvote is being published to blockchain.\nPlease wait until the transaction finishes.`,
        "notification/publish-downvote-success": `Your downvote is now saved on blockchain.`,
        "notification/publish-upvote": `Thank you for supporting the author :)\nYour upvote is being published to blockchain.\nPlease wait until the transaction finishes.`,
        "notification/publish-upvote-success": `Your upvote is now saved on blockchain.`,
        "notification/publish-post": `Your post is being published to blockchain.\nPlease wait until the transaction finishes.`,
        "notification/publish-post-success": `Your post is now saved on blockchain.`,
        "notification/publish-reply-success": `Your reply is now saved on blockchain.`,
        "notification/publish-post-failure": `Failed to save your post to blockchain.`,
        "notification/username-taken": `Username {{username}} is already taken.`,
        "notification/user-address-doesnt-exist": `User with address {{userAddress}} doesn't exist.`,
        "notification/Syncing-block-from-blockchain": `Syncing {{index}}/{{total}} transaction at block {{blockNumber}} from blockchain...`,
        "notification/Syncing-block-from-database": `Syncing block {{blockNumber}} from database...`,
        "notification/app-local-cache-deletion-success":
          "App local cache are deleted successfully. Browser will be refreshed soon.",
        "notification/app-local-cache-deletion-failure":
          "Failed to delete app local cache",
        "notification/ipfs-hash-not-found": `Failed to cat IPFS hash: [{{name}}]({{link}}).`,
        "notification/wrong-networkId": `Connected to the wrong network: {{given}}。Please reconnect to: {{required}}`,
        "notification/invalid-username": `Invalid username: {{username}}`,
        "notification/generating-ipfs-hash":
          "Generating IPFS hash, please wait...",
        "notification/generating-ipfs-hash-failure":
          "Failed to generate IPFS hash."
      }
    },
    zh: {
      translation: {
        "general/by-trend": "按热度",
        "general/by-time": "按时间",
        "general/follow": "关注",
        "general/following": "正在关注",
        "general/unfollow": "取消关注",
        "general/invalid-topic": "无效的话题",
        "general/and": "并且",
        "general/upvoted": "赞同了",
        "general/donated": "捐赠了",
        "general/Upvote": "赞同",
        "general/Write-below": "编辑",
        "general/Preview": "预览",
        "general/Reply-to": "回复",
        "general/Post-to-topics": "发布到话题",
        "general/Reply-to-the-following-users": "回复给以下用户",
        "general/Mention-the-following-users": "提到一下用户",
        "general/Configuration": "发布设置",
        "general/Repost-to-timeline": "转发到个人主页",
        "general/Post-to-ribbit": "发布到 #{ribbit} 话题",
        "general/Post-as-IPFS-hash": "发布为 IPFS 哈希（Infura）",
        "general/username": "用户名",
        "general/Username": "用户名",
        "general/topic": "话题",
        "general/Display-name": "显示名称",
        "general/Avatar-URL": "头像图片链接",
        "general/Cover-URL": "墙图片链接",
        "general/Bio-markdown-ready": "简介（markdown 编写支持）",
        "general/Profile-preview": "个人信息预览",
        "general/No-more-replies": "没有更多的回复了 ;)",
        "general/No-more-feeds": "没有更多的文字了 ;)",
        "general/USD": "美元",
        "components/error/feed-footer-part1": "请确保",
        "components/error/feed-footer-part2":
          "在你的浏览器中工作并解锁。切换至 Ropsten 测试网络，然后刷新浏览器。",
        "components/header/home": "首页",
        "components/header/topics": "话题",
        "components/header/notifications": "消息",
        "components/header/settings": "设置",
        "components/header/search-box-placeholder":
          "请在这里输入 @用户名 或者你感兴趣的 #话题。",
        "components/followings-card/title": "我关注的人",
        "components/topics-card/title": "我关注的话题",
        "components/profile-settings-card/title": "个人信息设置",
        "components/profile-settings-card/publish": "发布个人信息到区块链",
        "components/profile-settings-card/avatar-url-placeholder":
          "头像图片链接请以 https:// 或者 https:// 开头",
        "components/profile-settings-card/cover-url-placeholder":
          "墙图片链接请以 http:// 或者 https:// 开头",
        "components/profile-settings-card/delete-app-cache": "清除程序本地缓存",
        "components/donate-panel/donate-placeholder":
          "（可选）捐赠 0.0000 以太币给作者",
        "routes/signup/title": "欢迎使用 Ribbit！",
        "routes/signup/subtitle": "请在下方完成账号注册",
        "routes/signup/topic-demo": "或者查看话题演示：",
        "notification/init-error":
          "启动 Ribbit 失败。请确保 MetaMask 已启动并解锁。",
        "notification/publish-profile": `用户信息正在被发布到区块链。\n请等候交易完成，然后刷新浏览器。`,
        "notification/publish-profile-success": `你的用户信息已被成功保存到区块链。请刷新浏览器，`,
        "notification/publish-profile-failure": `无法将你的用户信息保存到区块链。`,
        "notification/publish-downvote": `你的反对正在被发布到区块链。\n请等候交易完成。`,
        "notification/publish-downvote-success": `你的反对已被成功保存到区块链。`,
        "notification/publish-upvote": `感谢你支持作者。你的赞同正在被发布到区块链。\n请等候交易完成。`,
        "notification/publish-upvote-success": `你的赞同已被成功保存到区块链。`,
        "notification/publish-post": `你的文字正在被发布到区块链。\n请等候交易完成。`,
        "notification/publish-post-success": `你的文字已被成功保存到区块链。`,
        "notification/publish-reply-success": `你的回复已被成功保存到区块链。`,
        "notification/publish-post-failure": `无法发布文字到区块链`,
        "notification/username-taken": `用户名 {{username}} 已被注册。`,
        "notification/user-address-doesnt-exist": `用户地址 {{userAddress}} 不存在。`,
        "notification/Syncing-block-from-blockchain": `同步完成区块链 {{index}}/{{total}} 交易位于第 {{blockNumber}} 区块。`,
        "notification/Syncing-block-from-database": `同步完成数据库中第 {{blockNumber}} 区块。`,
        "notification/app-local-cache-deletion-success":
          "成功删除程序本地缓存。浏览器将会在不久后刷新。",
        "notification/app-local-cache-deletion-failure": "无法删除程序本地缓存",
        "notification/ipfs-hash-not-found": `无法读取 IPFS 哈希：[{{name}}]({{link}}).`,
        "notification/wrong-networkId": `连接到了错误的以太坊网络 {{given}}。请连接到 {{required}}`,
        "notification/invalid-username": `无效的用户名：{{username}}`,
        "notification/generating-ipfs-hash": "正在生成 IPFS 哈希，请稍等。。。",
        "notification/generating-ipfs-hash-failure": "生成 IPFS 哈希失败。"
      }
    }
  }
});

window["i18n"] = i18next;
export default i18next;
