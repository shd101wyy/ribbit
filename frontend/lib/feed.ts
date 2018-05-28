import { formatDate, decompressString } from "./utility";
import {
  TransactionInfo,
  getTransactionCreationTimestamp
} from "./transaction";
import { UserInfo, Ribbit } from "./ribbit";
import { renderMarkdown } from "./markdown";

export interface StateInfo {
  earnings: number;
  upvotes: number;
  downvotes: number;
  reports: number;
  replies: number;
}

export interface FeedInfo {
  summary: Summary;
  transactionInfo: TransactionInfo;
  /**
   * author info of this feed
   */
  userInfo: UserInfo;
  stateInfo: StateInfo;

  /**
   * who reposts this feed.
   */
  repostUserInfo?: UserInfo;
  repostUserDonation?: number;
  feedType: string; // post | repost | repostAndReply

  /**
   * IPFS related fields
   */
  ipfsHash?: string;
}

export function formatFeedCreationTime(feedInfo: FeedInfo) {
  return formatDate(getTransactionCreationTimestamp(feedInfo.transactionInfo));
}

export interface Summary {
  title: string;
  summary: string;
  images: string[]; // If has `title`, then images[0] is cover.
  /**
   * HTML code for video.
   */
  video: string;
  tags: string[]; // TODO: support tags
  html: string; // original html
  hasMoreContent?: boolean; // has more content => display `continue reading`
}

export async function getTopicsAndMentionsFromHTML(
  html: string,
  ribbit: Ribbit
): Promise<{
  topics: string[];
  mentions: { name: string; address: string }[];
}> {
  const div = document.createElement("div");
  const topics = [];
  const mentions = [];
  div.innerHTML = html;

  const tagElems = div.getElementsByClassName("tag");
  for (let i = 0; i < tagElems.length; i++) {
    const tagElem = tagElems[i] as HTMLAnchorElement;
    if (tagElem.classList.contains("tag-mention")) {
      const mention = tagElem.getAttribute("data-mention");
      const userInfo = await ribbit.getUserInfoFromUsername(mention);
      mentions.push({
        name: userInfo.username,
        address: userInfo.address
      });
    } else if (tagElem.classList.contains("tag-topic")) {
      const topic = tagElem.getAttribute("data-topic");
      topics.push(topic);
    }
  }
  div.remove();

  return {
    topics,
    mentions
  };
}

export async function generateSummaryFromHTML(
  html: string,
  ribbit: Ribbit
): Promise<Summary> {
  let title = "",
    summary = "",
    images = [],
    cover = "";

  const div = document.createElement("div");
  div.style.display = "none";
  div.innerHTML = html;

  // Check if it's article
  if (
    div.children.length >= 2 &&
    (div.children[0].tagName === "H1" || div.children[1].tagName === "H1")
  ) {
    if (
      div.children[0].tagName === "P" &&
      div.children[0].children.length &&
      div.children[0].children[0].tagName === "IMG"
    ) {
      const imgElement = div.children[0].children[0] as HTMLImageElement,
        // alt = imgElement.getAttribute('alt'),
        src = imgElement.src;
      cover = src;
      title = div.children[1].textContent;
    } else if (div.children[1].tagName === "H1") {
      title = div.children[1].textContent;
    } else if (div.children[0].tagName === "H1") {
      title = div.children[0].textContent;
    }
  } else if (div.children.length === 1 && div.children[0].tagName === "H1") {
    summary = div.children[0].textContent;
  }

  // Get images
  if (cover) {
    images.push(cover); // It's article, so we only save one image
  } else if (title) {
    // article but no cover
  } else {
    const imgElements = div.getElementsByTagName("img");
    let i = 0,
      count = 0;
    const minWidth = 128;
    while (count < 9 && i < imgElements.length) {
      // TODO: ignore attribute to ignore image from being shown in Card
      const imgElement = imgElements[i] as HTMLImageElement;
      if (imgElement.complete) {
        if (imgElement.width >= minWidth) {
          images.push(imgElement.src);
          count += 1;
        }
        i += 1;
      } else {
        await new Promise((resolve, reject) => {
          imgElement.onload = function() {
            if (imgElement.width >= minWidth) {
              images.push(imgElement.src);
              count += 1;
            }
            i += 1;
            return resolve();
          };
          imgElement.onerror = function() {
            i += 1;
            return resolve();
          };
          setTimeout(() => {
            // set timeout for analyzing images.
            return resolve();
          }, 2000);
        });
      }
    }
  }

  async function renderTags(div) {
    // render tags
    const tagElems = div.getElementsByClassName("tag");
    for (let i = 0; i < tagElems.length; i++) {
      const tagElem = tagElems[i] as HTMLAnchorElement;
      if (tagElem.classList.contains("tag-mention")) {
        const mention = tagElem.getAttribute("data-mention");
        const userInfo = await ribbit.getUserInfoFromUsername(mention);
        tagElem.innerHTML = `<span class="mention">${userInfo.username}</span>`;
        tagElem.href = `${window.location.pathname}#/${
          ribbit.networkId
        }/profile/${mention}`;
        tagElem.setAttribute("target", "_blank");
      } else if (tagElem.classList.contains("tag-topic")) {
        const topic = tagElem.getAttribute("data-topic");
        tagElem.innerHTML = `<span class="topic">${topic}</span>`;
        tagElem.href = `${window.location.pathname}#/${
          ribbit.networkId
        }/topic/${topic}`;
        tagElem.setAttribute("target", "_blank");
      } else {
        const error = tagElem.getAttribute("data-error");
        tagElem.innerHTML = `<span class="error">${error}</span>`;
      }
    }
  }

  await renderTags(div);

  async function renderMedias(div) {
    const medias = div.getElementsByClassName("ribbit-media");
    let video = "";
    for (let i = 0; i < medias.length; i++) {
      const media = medias[i];
      const mediaType = media.getAttribute("data-media-type");
      const mediaValue = media.getAttribute("data-media-value");
      if (mediaType === "youtube") {
        media.innerHTML = `<iframe src="https://www.youtube.com/embed/${mediaValue}" frameborder="0" allow="encrypted-media" allowfullscreen></iframe>`;
      } else if (mediaType === "vimeo") {
        media.innerHTML = `<iframe src="https://player.vimeo.com/video/${mediaValue}" frameborder="0" allowfullscreen></iframe>`;
      } else if (mediaType === "vine") {
        media.innerHTML = `<iframe src="https://vine.co/v/${mediaValue}/embed/simple" frameborder="0" allowfullscreen></iframe>`;
      } else if (mediaType === "mp4") {
        media.innerHTML = `<video controls><source src="${mediaValue}" type="video/mp4"></source>Your browser doesn't support HTML5 video.</video>`;
      } else if (mediaType === "ogg") {
        media.innerHTML = `<video controls><source src="${mediaValue}" type="video/ogg"></source>Your browser doesn't support HTML5 video.</video>`;
      } else if (mediaType === "webm") {
        media.innerHTML = `<video controls><source src="${mediaValue}" type="video/webm"></source>Your browser doesn't support HTML5 video.</video>`;
      } else if (mediaType === "bilibili") {
        media.innerHTML = `<iframe src="https://player.bilibili.com/player.html?${mediaValue}" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>`;
      } else {
        media.innerHTML = `<span class="error">Invalid media @[${mediaType}](${mediaValue})</span>`;
      }
      if (i === 0) {
        video = media.outerHTML;
      }
    }
    return video;
  }

  const video = await renderMedias(div);

  // get summary
  let plainSummary = "";
  const maxCharacters = 240;
  const imgElements = [].slice.call(div.getElementsByTagName("img"));
  let hasMoreContent = false;
  for (let i = 0; i < div.children.length; i++) {
    const elem = div.children[i];
    if (elem.tagName !== "P") {
      hasMoreContent = true;
      continue;
    }
    if (elem.children.length && elem.children[0].tagName === "IMG") continue;
    const text = elem.textContent;
    plainSummary += text;
    summary += elem.innerHTML;
    if (plainSummary.length >= maxCharacters) {
      if (i < div.children.length - 1) {
        hasMoreContent = true;
      }
      break;
    }
  }
  summary = summary.replace(/\<img.+?\>/g, ""); // remove image tag.

  const output: Summary = {
    title,
    summary,
    images,
    video,
    tags: [],
    html: div.innerHTML,
    hasMoreContent
  };
  div.remove();
  return output;
}

export function generateFakeStateInfo(): StateInfo {
  return {
    earnings: 0,
    upvotes: 0,
    downvotes: 0,
    reports: 0,
    replies: 0
  };
}

export async function generateFeedInfoFromTransactionInfo(
  ribbit: Ribbit,
  transactionInfo: TransactionInfo
): Promise<FeedInfo> {
  if (!transactionInfo) {
    return null;
  }
  const feedType = transactionInfo.decodedInputData.name;

  let message, summary, userInfo, repostUserInfo, ipfsHash;
  let repostUserDonation = parseInt(transactionInfo.value) || 0;
  if (feedType === "post") {
    const o = await ribbit.retrieveMessage(
      transactionInfo.decodedInputData.params["message"].value
    );
    message = o.message;
    ipfsHash = o.ipfsHash;

    summary = await generateSummaryFromHTML(renderMarkdown(message), ribbit);

    userInfo = await ribbit.getUserInfoFromAddress(transactionInfo.from);
  } else if (feedType === "upvote") {
    const repostUserAddress = transactionInfo.from;
    // Get parent transactionInfo
    transactionInfo = await ribbit.getTransactionInfo({
      transactionHash:
        transactionInfo.decodedInputData.params["parentTransactionHash"].value
    });

    // who reposts the feed
    repostUserInfo = await ribbit.getUserInfoFromAddress(repostUserAddress);

    // author of the original feed
    userInfo = await ribbit.getUserInfoFromAddress(transactionInfo.from);

    const o = await ribbit.retrieveMessage(
      transactionInfo.decodedInputData.params["message"].value
    );
    message = o.message;
    ipfsHash = o.ipfsHash;

    summary = await generateSummaryFromHTML(renderMarkdown(message), ribbit);
  } else if (feedType === "reply") {
    const o = await ribbit.retrieveMessage(
      transactionInfo.decodedInputData.params["message"].value
    );
    message = o.message;
    ipfsHash = o.ipfsHash;

    summary = await generateSummaryFromHTML(renderMarkdown(message), ribbit);

    userInfo = await ribbit.getUserInfoFromAddress(transactionInfo.from);
  } else {
    throw "Invalid feed type: " + feedType;
  }

  const stateInfo = await ribbit.getFeedStateInfo(transactionInfo.hash);

  const feedInfo: FeedInfo = {
    summary,
    transactionInfo,
    userInfo,
    stateInfo,
    feedType,
    repostUserInfo,
    repostUserDonation,
    ipfsHash
  };

  return feedInfo;
}
