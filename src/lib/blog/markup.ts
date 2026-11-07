// The blog body format: a deliberately tiny markup the admin editor
// documents and the public article page renders with FULL escaping.
// There is no raw-HTML path anywhere: post text is data, rendered as
// React text nodes, so markup characters in a post can never become
// tags. The only structure recognised is:
//   * a line starting with "## "          -> a section heading (h2)
//   * consecutive lines starting with "- " -> one bullet list
//   * any other non-empty lines            -> a paragraph; a blank line
//     ends the paragraph (soft line breaks join with a space)
// Inside paragraphs and list items, an inline link is recognised in the
// form [text](target) where the target has no spaces and is either:
//   * an internal path — starts with "/" (but NOT "//"), or
//   * an external URL — starts with "http://" or "https://".
// Anything else — javascript:/data: URLs, protocol-relative "//host"
// targets, other schemes, malformed brackets — renders as plain text,
// exactly as typed. External links render in a new tab with
// rel="noopener noreferrer" (see components/BlogArticle.tsx).

export type BlogTextSegment =
  | { kind: "text"; text: string }
  | { kind: "link"; text: string; href: string; external?: boolean };

export type BlogBodyBlock =
  | { kind: "heading"; segments: BlogTextSegment[] }
  | { kind: "paragraph"; segments: BlogTextSegment[] }
  | { kind: "list"; items: BlogTextSegment[][] };

const LINK_PATTERN = /\[([^\]\n]+)\]\(([^\s)]+)\)/g;

/**
 * Classify a link target: "internal" for site paths, "external" for
 * absolute http(s) URLs, null for anything else (never a link).
 */
function classifyHref(target: string): "internal" | "external" | null {
  if (target.startsWith("/") && !target.startsWith("//")) return "internal";
  if (/^https?:\/\//i.test(target)) return "external";
  return null;
}

/** Split one line of post text into plain-text and link parts. */
export function parseInlineLinks(text: string): BlogTextSegment[] {
  const segments: BlogTextSegment[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(LINK_PATTERN)) {
    const kind = classifyHref(match[2]);
    if (kind === null) continue; // not a link: leave the raw text in place
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ kind: "text", text: text.slice(lastIndex, index) });
    }
    segments.push({
      kind: "link",
      text: match[1],
      href: match[2],
      ...(kind === "external" ? { external: true } : {}),
    });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ kind: "text", text: text.slice(lastIndex) });
  }
  return segments;
}

/** Parse a post body into renderable blocks (see the format rules above). */
export function parseBlogBody(body: string): BlogBodyBlock[] {
  const blocks: BlogBodyBlock[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      blocks.push({ kind: "paragraph", segments: parseInlineLinks(paragraphLines.join(" ")) });
      paragraphLines = [];
    }
  };
  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ kind: "list", items: listItems.map((item) => parseInlineLinks(item)) });
      listItems = [];
    }
  };

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "heading", segments: parseInlineLinks(line.slice(3).trim()) });
    } else if (line.startsWith("- ")) {
      flushParagraph();
      listItems.push(line.slice(2).trim());
    } else if (line === "") {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraphLines.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}
