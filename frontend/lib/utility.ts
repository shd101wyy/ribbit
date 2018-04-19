import * as Autolinker from "autolinker";
import * as validator from "validator";
import * as MarkdownIt from "../deps/markdown-it";
import * as LZString from "lz-string";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
});

export function compressString(s:string) {
  return LZString.compressToUTF16(s);
}

export function decompressString(s:string) {
  return LZString.decompressFromUTF16(s);
}

export function renderMarkdown(markdown: string):string {
  return md.render(markdown);
}

export interface Summary {
  title: string;
  summary: string;
  images: string[]; // If has `title`, then images[0] is cover.
  tags: string[]; // TODO: support tags
}

export async function generateSummaryFromHTML(html: string): Promise<Summary> {
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

  // get summary
  let plainSummary = "";
  const maxCharacters = 160;
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
    tags: []
  };
}

export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const passedTime = Math.abs(diff);

  if (passedTime <= 1000 * 60 * 60 * 24) {
    // within 24h
    if (passedTime <= 1000 * 60 * 60) {
      // within 1 hour
      return (
        (diff < 0 ? "future " : "") + Math.ceil(passedTime / (1000 * 60)) + "m"
      );
    } else {
      return (
        (diff < 0 ? "future " : "") +
        Math.floor(passedTime / (1000 * 60 * 60)) +
        "h"
      );
    }
  } else {
    const monthNamesShort = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    return (
      monthNamesShort[date.getMonth()] +
      " " +
      date.getDate() +
      " " +
      date.getFullYear()
    );
  }
}
