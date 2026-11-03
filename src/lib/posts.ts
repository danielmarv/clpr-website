// Blog posts, in the structure of the Hiero website's blog (hiero-ledger/hiero-website, src/lib/posts.ts):
// one Markdown file per post in content/posts/, with TOML front matter between +++ lines, and
// content/posts/_index.md for the blog page's own title. docs/blogs.md says how to write one.
import fs from "node:fs";
import path from "node:path";
import { parse as parseToml } from "toml";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const BLOG_INDEX_FILE = path.join(POSTS_DIR, "_index.md");
/** The image of a post whose front matter names no featured_image: the CLPR banner (scripts/blog-image.mjs). */
export const FALLBACK_IMAGE = "/images/blog/default.jpg";
const WORDS_PER_MINUTE = 200;

export interface PostAuthor {
  name?: string;
  title?: string;
  organization?: string;
  link?: string;
  image?: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  abstract?: string;
  featuredImage: string;
  /** Who made the featured image, when it is not the project's own; shown under it on the post's page. */
  imageCredit?: { name: string; link?: string };
  /** Reading time as the front matter states it, when a post states one. */
  duration?: string;
  /** Reading time derived from the body, for the posts that do not. */
  readingMinutes: number;
  authors: PostAuthor[];
  categories: string[];
  tags: string[];
}

export interface PostFull extends PostMeta {
  contentMarkdown: string;
}

export interface BlogIndexMeta {
  title: string;
  subtitle: string;
  listTitle: string;
}

/**
 * TOML front matter. The toml package reads TOML 0.4, which has no bare dates, so `date = 2026-09-24`
 * becomes midnight UTC first.
 */
function parseToml04(source: string): unknown {
  const dated = source.replace(/^(\s*\w+\s*=\s*)(\d{4}-\d{2}-\d{2})\s*$/gm, "$1$2T00:00:00Z");
  return parseToml(dated.endsWith("\n") ? dated : `${dated}\n`);
}

/** The front matter between the leading +++ lines, and the Markdown after them. */
function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const normalized = raw.replace(/\r\n/g, "\n").replace(/^﻿/, "");
  const match = /^\s*\+\+\+\s*\n([\s\S]*?)\n?\s*\+\+\+\s*(?:\n|$)/.exec(normalized);
  if (!match) return { data: {}, content: normalized };
  const data = parseToml04(match[1]);
  return {
    data: data && typeof data === "object" && !Array.isArray(data) ? (data as Record<string, unknown>) : {},
    content: normalized.slice(match[0].length),
  };
}

/** Hugo shortcodes ({{< … >}}, {{% … %}}) do not render here; they are dropped. */
function cleanContent(content: string): string {
  return content.replace(/\{\{<[^>]*>\}\}/g, "").replace(/\{\{%[^%]*%\}\}/g, "").trim();
}

/** Reading time from the body: links count as their text, code blocks not at all. */
export function readingMinutes(content: string): number {
  const prose = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/[#>*_`~|]+/g, " ");
  return Math.max(1, Math.round(prose.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE));
}

function parseDate(raw: unknown): string {
  if (!raw) return new Date(0).toISOString();
  return (raw instanceof Date ? raw : new Date(String(raw))).toISOString();
}

/** Lower case, hyphens for spaces, nothing that could leave the /blog/ path. */
function sanitizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function deriveSlug(data: Record<string, unknown>, filename: string): string {
  return sanitizeSlug(typeof data.slug === "string" && data.slug.trim() ? data.slug : filename.replace(/\.md$/, ""));
}

const text = (value: unknown) => (value ? String(value) : undefined);
const list = (value: unknown) => (Array.isArray(value) ? value.map(String) : []);

function buildMeta(data: Record<string, unknown>, filename: string, content: string): PostMeta {
  return {
    slug: deriveSlug(data, filename),
    title: String(data.title ?? ""),
    date: parseDate(data.date),
    abstract: text(data.abstract) ?? text(data.description),
    featuredImage: text(data.featured_image) ?? FALLBACK_IMAGE,
    imageCredit: data.image_credit ? { name: String(data.image_credit), link: text(data.image_credit_link) } : undefined,
    duration: text(data.duration),
    readingMinutes: readingMinutes(content),
    authors: Array.isArray(data.authors)
      ? data.authors.map((author: Record<string, unknown>) => ({
          name: text(author.name),
          title: text(author.title),
          organization: text(author.organization),
          link: text(author.link),
          image: text(author.image),
        }))
      : [],
    categories: list(data.categories),
    tags: list(data.tags),
  };
}

/** Every published post file: the .md files directly in content/posts/, without _index.md and drafts. */
function readPosts(): { data: Record<string, unknown>; content: string; file: string }[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".md") && file !== "_index.md")
    .flatMap((file) => {
      try {
        const parsed = parseFrontmatter(fs.readFileSync(path.join(POSTS_DIR, file), "utf8"));
        return parsed.data.draft === true ? [] : [{ ...parsed, file }];
      } catch {
        // A post whose front matter does not parse is left out rather than breaking the blog.
        return [];
      }
    });
}

/** Newest first; posts of the same day by slug, so the order does not depend on the file system. */
export function getAllPosts(): PostMeta[] {
  return readPosts()
    .map(({ data, file, content }) => buildMeta(data, file, content))
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function getPostBySlug(slug: string): PostFull | null {
  const post = readPosts().find(({ data, file }) => deriveSlug(data, file) === slug);
  return post ? { ...buildMeta(post.data, post.file, post.content), contentMarkdown: cleanContent(post.content) } : null;
}

export function getBlogIndexMeta(): BlogIndexMeta {
  const fallback: BlogIndexMeta = {
    title: "CLPR Blog",
    subtitle: "Stay up to date with our latest news and announcements.",
    listTitle: "Recent articles",
  };
  try {
    const { data } = parseFrontmatter(fs.readFileSync(BLOG_INDEX_FILE, "utf8"));
    return {
      title: text(data.title) ?? fallback.title,
      subtitle: text(data.subtitle) ?? fallback.subtitle,
      listTitle: text(data.list_title) ?? fallback.listTitle,
    };
  } catch {
    return fallback;
  }
}
