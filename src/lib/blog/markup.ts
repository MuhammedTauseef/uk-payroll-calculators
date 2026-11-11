// The blog body format: a deliberately tiny markup the admin editor
// documents and the public article page renders with FULL escaping.
// There is no raw-HTML path anywhere: post text is data, rendered as
// React text nodes, so markup characters in a post can never become
// tags. The only structure recognised is:
//   * a line starting with "## "          -> a section heading (h2)
//   * consecutive lines starting with "- " -> one bullet list
//   * a line that is exactly an image, "![alt](src)" or
//     '![alt](src "caption")'              -> one figure (the src must
//     be an internal path or an https URL, like a link target; the
//     caption, when given, renders under the image)
//   * consecutive lines starting with "|", in the shape of a table:
//     a header row, a separator row of dashes ("|---|---|"), then
//     one data row per line                  -> one real <table>
//   * any other non-empty lines            -> a paragraph; a blank line
//     ends the paragraph (soft line breaks join with a space)
// Inside paragraphs, list items and table cells, an inline link is
// recognised in the form [text](target) where the target has no
// spaces and is either:
//   * an internal path — starts with "/" (but NOT "//"), or
//   * an external URL — starts with "http://" or "https://".
// Anything else — javascript:/data: URLs, protocol-relative "//host"
// targets, other schemes, malformed brackets — renders as plain text,
// exactly as typed. External links render in a new tab with
// rel="noopener noreferrer" (see components/BlogArticle.tsx).
// A line that looks like an image or a table but does not match the
// shape above (bad URL, missing separator row, ragged rows) is NOT
// promoted: it renders as plain paragraph text, exactly as typed,
// so an older post can never change meaning by accident.

export type BlogTextSegment =
  | { kind: "text"; text: string }
  | { kind: "link"; text: string; href: string; external?: boolean };

export type BlogBodyBlock =
  | { kind: "heading"; segments: BlogTextSegment[] }
  | { kind: "paragraph"; segments: BlogTextSegment[] }
  | { kind: "list"; items: BlogTextSegment[][] }
  | { kind: "image"; alt: string; src: string; caption: string | null }
  | {
      kind: "table";
      headers: BlogTextSegment[][];
      rows: BlogTextSegment[][][];
    };

const LINK_PATTERN = /\[([^\]\n]+)\]\(([^)\s]+)\)/g;

const IMAGE_PATTERN = /^!\[([^\]\n]*)\]\(([^)\s]+)(?:\s+"([^"\n]*)")?\)$/;

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

/**
 * A whole line that is exactly an image: '![alt](src)' or
 * '![alt](src "caption")'. Returns null unless the line matches
 * exactly and the src is a linkable target (see classifyHref).
 */
function parseImageLine(
  line: string,
): Extract<BlogBodyBlock, { kind: "image" }> | null {
  const match = IMAGE_PATTERN.exec(line);
  if (match === null) return null;
  if (classifyHref(match[2]) === null) return null;
  return {
    kind: "image",
    alt: match[1],
    src: match[2],
    caption: match[3] === undefined || match[3] === "" ? null : match[3],
  };
}

/** Split one "| cell | cell |" line into its trimmed cells. */
function splitTableRow(line: string): string[] | null {
  if (!line.startsWith("|")) return null;
  const parts = line.split("|").map((cell) => cell.trim());
  if (parts.length > 0 && parts[0] === "") parts.shift();
  if (parts.length > 0 && parts[parts.length - 1] === "") parts.pop();
  return parts;
}

/** A separator cell is dashes with optional edge colons: ---, :---, ---:. */
function isSeparatorCell(cell: string): boolean {
  return /^:?-+:?$/.test(cell);
}

/**
 * Try to read a run of consecutive "|" lines as a table: a header
 * row, a separator row, then one or more data rows, all with the
 * same number of cells. Returns null for any other shape, so the
 * lines fall back to plain paragraphs.
 */
function parseTableRun(
  run: string[],
): Extract<BlogBodyBlock, { kind: "table" }> | null {
  if (run.length < 3) return null;
  const headers = splitTableRow(run[0]);
  const separator = splitTableRow(run[1]);
  if (headers === null || headers.length < 2) return null;
  if (separator === null || separator.length !== headers.length) return null;
  if (!separator.every(isSeparatorCell)) return null;
  const rows: string[][] = [];
  for (const line of run.slice(2)) {
    const cells = splitTableRow(line);
    if (cells === null || cells.length !== headers.length) return null;
    rows.push(cells);
  }
  if (rows.length < 1) return null;
  return {
    kind: "table",
    headers: headers.map((cell) => parseInlineLinks(cell)),
    rows: rows.map((row) => row.map((cell) => parseInlineLinks(cell))),
  };
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

  const lines = body.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "heading", segments: parseInlineLinks(line.slice(3).trim()) });
      continue;
    }
    const image = parseImageLine(line);
    if (image !== null) {
      flushParagraph();
      flushList();
      blocks.push(image);
      continue;
    }
    if (line.startsWith("|")) {
      // Gather the whole run of "|" lines and try it as one table.
      // An invalid shape falls through below, so each line renders
      // as plain paragraph text exactly as typed.
      const run: string[] = [];
      let end = index;
      while (end < lines.length && lines[end].trim().startsWith("|")) {
        run.push(lines[end].trim());
        end += 1;
      }
      const table = parseTableRun(run);
      if (table !== null) {
        flushParagraph();
        flushList();
        blocks.push(table);
        index = end - 1;
        continue;
      }
    }
    if (line.startsWith("- ")) {
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
