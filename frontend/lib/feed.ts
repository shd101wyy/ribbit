import { formatDate } from "./utility";
import {
  TransactionInfo,
  getTransactionCreationTimestamp
} from "./transaction";
import { UserInfo, User } from "./user";

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
  feedType: string; // post | repost | repostAndReply
}

export function formatFeedCreationTime(feedInfo: FeedInfo) {
  return formatDate(getTransactionCreationTimestamp(feedInfo.transactionInfo));
}

export interface Summary {
  title: string;
  summary: string;
  images: string[]; // If has `title`, then images[0] is cover.
  tags: string[]; // TODO: support tags
  html: string; // original html
}

export async function getTopicsAndMentionsFromHTML(
  html: string,
  user: User
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
      const userInfo = await user.getUserInfo(mention);
      mentions.push({
        name: userInfo.name,
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
  user: User
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

      div.children[0].remove();
      div.children[1].remove();
    } else {
      title = div.children[0].textContent;
      div.children[0].remove();
    }
  } else if (div.children.length === 1 && div.children[0].tagName === "H1") {
    summary = div.children[0].textContent;
    div.children[0].remove();
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
        });
      }
    }
  }

  // render tags
  const tagElems = div.getElementsByClassName("tag");
  for (let i = 0; i < tagElems.length; i++) {
    const tagElem = tagElems[i] as HTMLAnchorElement;
    if (tagElem.classList.contains("tag-mention")) {
      const mention = tagElem.getAttribute("data-mention");
      const userInfo = await user.getUserInfo(mention);
      tagElem.innerHTML = `<span class="mention">${userInfo.name}</span>`;
      tagElem.href = `${window.location.pathname}#/${
        user.networkId
      }/profile/${mention}`;
      tagElem.setAttribute("target", "_blank");
    } else if (tagElem.classList.contains("tag-topic")) {
      const topic = tagElem.getAttribute("data-topic");
      tagElem.innerHTML = `<span class="topic">${topic}</span>`;
      tagElem.href = `${window.location.pathname}#/${
        user.networkId
      }/topic/${topic}`;
      tagElem.setAttribute("target", "_blank");
    } else {
      const error = tagElem.getAttribute("data-error");
      tagElem.innerHTML = `<span class="error">${error}</span>`;
    }
  }

  // get summary
  let plainSummary = "";
  const maxCharacters = 240;
  const imgElements = [].slice.call(div.getElementsByTagName("img"));
  for (let i = 0, length = imgElements.length; i < length; i++) {
    imgElements[i].remove();
  }
  for (let i = 0; i < div.children.length; i++) {
    const elem = div.children[i];
    if (elem.tagName !== "P") continue;
    if (elem.children.length && elem.children[0].tagName === "IMG") continue;
    const text = elem.textContent;
    plainSummary += text;
    summary += elem.innerHTML;
    if (plainSummary.length >= maxCharacters) {
      break;
    }
  }

  // TODO: get tags

  div.remove();
  return {
    title: title,
    summary: summary,
    images: images,
    tags: [],
    html
  };
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
