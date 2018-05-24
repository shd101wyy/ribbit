const MarkdownIt = window["markdownit"];
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: (code, language) => {
    const html = window["Prism"].highlight(
      code,
      window["Prism"].languages[language]
    );
    return html;
  }
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

    state.pos = end + 1;
    return true;
  } else {
    return false;
  }
});

md.renderer.rules.tag = (tokens, idx) => {
  const content: string = tokens[idx] ? tokens[idx].content : null;
  const tagMode = tokens[idx] ? tokens[idx].tagMode : null;
  if (!content || !tagMode) {
    return `<a class="tag tag-error" data-error="Invalid tag">loading...</a>`;
  } else if (tagMode === "mention") {
    return `<a class="tag tag-mention" data-mention="${content}">loading...</a>`;
  } else if (tagMode === "topic" /* && !content.match(/\s/) */) {
    // for topic, space is not allowed.
    return `<a class="tag tag-topic" data-topic="${content}">loading...</a>`;
  } else {
    return `<a class="tag tag-error"  data-error="Invalid tag">loading...</a>`;
  }
};

md.inline.ruler.before("escape", "media", (state, silent) => {
  let find = state.src.startsWith("@[", state.pos);
  if (!find) {
    return false;
  }

  let mediaType = "";
  let end = -1;
  let i = state.pos + 2;
  while (i < state.src.length) {
    if (state.src.startsWith("]", i)) {
      end = i;
      break;
    } else if (state.src[i] === "\\") {
      i += 1;
    }
    i += 1;
  }

  if (end >= 0) {
    mediaType = state.src.slice(state.pos + 2, end).trim();
    if (!mediaType.match(/(youtube|vimeo|vine|mp4|ogg|webm|bilibili)/i)) {
      return false;
    }
  } else {
    return false;
  }

  i = end + 1;
  if (!state.src.startsWith("(", i)) {
    return false;
  }
  let start = i + 1;
  let mediaValue = "";
  end = -1;
  i = start;
  while (i < state.src.length) {
    if (state.src.startsWith(")", i)) {
      end = i;
      break;
    } else if (state.src[i] === "\\") {
      i += 1;
    }
    i += 1;
  }

  if (end >= 0) {
    mediaValue = state.src.slice(start, end).trim();
  } else {
    return false;
  }

  if (mediaType && mediaValue && !silent) {
    const token = state.push("media");
    token.mediaType = mediaType;
    token.mediaValue = mediaValue;

    state.pos = end + 1;
    return true;
  } else {
    return false;
  }
});

md.renderer.rules.media = (tokens, idx) => {
  const mediaType: string = tokens[idx].mediaType;
  const mediaValue: string = tokens[idx].mediaValue;
  return `<div class="ribbit-media" data-media-type="${mediaType}" data-media-value="${mediaValue}">loading...</div>`;
};

export function renderMarkdown(markdown: string): string {
  try {
    // because md.render sometimes will fail.
    return md.render(markdown);
  } catch (error) {
    return `Failed to render markdown:\n${JSON.stringify(error)}`;
  }
}
