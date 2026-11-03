// Heading anchors for blog posts, as on the Hiero website (src/lib/headings.ts there). The contents list
// is built from the Markdown on the server and the headings are rendered from it by PostBody in a second
// pass; both take their ids from createSlugger in document order, so repeated headings get the same
// counters on both sides.

export interface ArticleHeading {
  id: string;
  text: string;
  /** 2 for a top-level section, 3 for one nested under it. */
  level: 2 | 3;
}

/** `#` inside a fenced block is a comment in someone's code, not a heading. */
const FENCE = /^\s*(?:```|~~~)/;
const ATX_HEADING = /^(#{1,3})\s+(.+?)\s*$/;
/** `===` makes the paragraph above it an h1, `---` an h2. */
const SETEXT_UNDERLINE = /^ {0,3}(?:=+|-+)\s*$/;
/** Lines that start a block of their own, so a paragraph cannot run into an underline through them. */
const LEADS_A_BLOCK = /^(?: {4,}|\s*(?:[-*+>|]\s|\d+[.)]\s))/;

/** Inline Markdown reduced to the words it renders as. */
export function headingText(markdown: string): string {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/\s*#+\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Slugs for one document; a repeated heading gets a counter rather than a colliding id. */
export function createSlugger(): (text: string) => string {
  const seen = new Map<string, number>();
  return (text: string) => {
    const base = slugify(text) || "section";
    const used = seen.get(base) ?? 0;
    seen.set(base, used + 1);
    return used === 0 ? base : `${base}-${used + 1}`;
  };
}

/** Every h1 to h3 in the post, in order; h1 and h2 both count as level 2. Both heading syntaxes count. */
export function extractHeadings(markdown: string): ArticleHeading[] {
  const slug = createSlugger();
  const headings: ArticleHeading[] = [];
  let inFence = false;
  /** The paragraph a setext underline would turn into a heading. */
  let paragraph: string[] = [];
  // Called for every heading, even an empty one, because PostBody calls the slugger for it too.
  const push = (text: string, level: 2 | 3) => headings.push({ id: slug(text), text, level });

  for (const line of markdown.split("\n")) {
    if (FENCE.test(line)) {
      inFence = !inFence;
      paragraph = [];
      continue;
    }
    if (inFence) continue;
    const atx = ATX_HEADING.exec(line);
    if (atx) {
      paragraph = [];
      push(headingText(atx[2]), atx[1].length >= 3 ? 3 : 2);
      continue;
    }
    // An underline makes a heading only of the paragraph directly above it; after a blank line it is a rule.
    if (SETEXT_UNDERLINE.test(line) && paragraph.length > 0) {
      push(headingText(paragraph.join(" ")), 2);
      paragraph = [];
      continue;
    }
    if (!line.trim() || LEADS_A_BLOCK.test(line)) {
      paragraph = [];
      continue;
    }
    paragraph.push(line.trim());
  }
  return headings;
}
