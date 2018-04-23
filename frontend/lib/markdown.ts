import * as MarkdownIt from "../deps/markdown-it";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
});

md.inline.ruler.before("escape", "tag", (state, silent) => {
  let tagMode = null;
  if (state.src.startsWith("@{", state.pos)) {
    tagMode = "mention";
  } else if (state.src.startsWith("#{", state.pos)) {
    tagMode = "topic";
  }

  if (!tagMode) {
    return false;
  }

  let content = "";
  let end = -1;
  let i = state.pos + 2;
  while (i < state.src.length) {
    if (state.src.startsWith("}", i)) {
      end = i;
      break;
    } else if (state.src[i] === "\\") {
      i += 1;
    }
    i += 1;
  }

  if (end >= 0) {
    content = state.src.slice(state.pos + 2, end);
  } else {
    return false;
  }

  if (content && !silent) {
    const token = state.push("tag");
    token.content = content.trim();
    token.tagMode = tagMode;

    state.pos += content.length + "#{}".length;
    return true;
  } else {
    return false;
  }
});

md.renderer.rules.tag = (tokens, idx) => {
  const content: string = tokens[idx] ? tokens[idx].content : null;
  const tagMode = tokens[idx] ? tokens[idx].tagMode : null;
  if (!content || !tagMode) {
    return `<a class="tag tag-error" data-error="Invalid tag">lloading...</a>`;
  } else if (tagMode === "mention" && content.length === 42) {
    return `<a class="tag tag-mention" data-mention="${content}">loading...</a>`;
  } else if (tagMode === "topic" && !content.match(/\s/)) {
    // for topic, space is not allowed.
    return `<a class="tag tag-topic" data-topic="${content}">loading...</a>`;
  } else {
    return `<a class="tag tag-error"  data-error="Invalid tag">loading...</a>`;
  }
};

export function renderMarkdown(markdown: string): string {
  return md.render(markdown);
}
