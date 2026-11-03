#!/usr/bin/env node
/**
 * Renders the CLPR blog banners, in the manner of hiero.org's: the CLPR mark and wordmark on the brand's
 * gradient (src/app/icon.svg), the post's title in IBM Plex Mono, and "CLPR BLOG" at the foot. 1600 × 900,
 * with the text inside the middle 4:3, so every crop the blog uses keeps it.
 *
 *   node scripts/blog-image.mjs                 the default banner and one for every post
 *   node scripts/blog-image.mjs <slug> …        the banners of these posts
 *   node scripts/blog-image.mjs --default       only the default banner (public/images/blog/default.jpg)
 *
 * A post's banner is written to public/images/blog/<slug>/cover.jpg; its front matter then names it with
 * featured_image = "/images/blog/<slug>/cover.jpg". Uses the explainer's Playwright and its Chromium
 * (`pnpm --dir explainer exec playwright install chromium` once on a new machine).
 */
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const root = process.cwd();
const require = createRequire(join(root, 'explainer', 'package.json'));
const { chromium } = require('playwright');

const SPIRAL = readFileSync(join(root, 'src/components/ClprMark.tsx'), 'utf8').match(/CLPR_SPIRAL_PATH =\s*"([^"]+)"/)[1];
// Inlined: a page set from a string cannot load file:// fonts.
const font = (file) => `data:font/woff2;base64,${readFileSync(join(root, 'src/app/fonts', file)).toString('base64')}`;
const escape = (text) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** title and slug from a post's TOML front matter; the slug defaults to the file name. */
function readPost(file) {
  const front = readFileSync(join(root, 'content/posts', file), 'utf8').match(/^\s*\+\+\+\s*\n([\s\S]*?)\n\s*\+\+\+/)?.[1] ?? '';
  const value = (key) => front.match(new RegExp(`^\\s*${key}\\s*=\\s*(["'])(.*?)\\1\\s*$`, 'm'))?.[2];
  return { title: value('title') ?? '', slug: value('slug') ?? file.replace(/\.md$/, '') };
}

function html({ title, kicker }) {
  const size = title && title.length > 60 ? 60 : 68;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Sora; src: url(${font('sora-latin-wght-normal.woff2')}) format('woff2'); font-weight: 100 800; }
@font-face { font-family: Plex; src: url(${font('ibm-plex-mono-latin-500-normal.woff2')}) format('woff2'); font-weight: 500; }
html, body { margin: 0; }
.banner { position: relative; display: flex; flex-direction: column; align-items: center; width: 1600px; height: 900px; overflow: hidden; color: #fff;
  background: radial-gradient(150% 150% at 48% 116%, #c82a80 0%, #211271 41%, #111116 91%); }
.lockup { display: flex; align-items: center; gap: 26px; margin-top: 118px; }
.lockup svg { height: 78px; width: auto; }
.lockup span { font: 600 100px/1 Sora; letter-spacing: -0.01em; }
.middle { display: flex; flex: 1; flex-direction: column; justify-content: center; padding: 0 240px; text-align: center; }
.title { font: 500 ${size}px/1.3 Plex; text-wrap: balance; }
.kicker { font: 500 72px/1.2 Sora; letter-spacing: -0.02em; }
.foot { margin-bottom: 92px; font: 500 28px/1 Sora; letter-spacing: 0.14em; opacity: 0.85; }
</style></head><body><div class="banner">
<div class="lockup"><svg viewBox="405 356 117.4 77.7" fill="#fff"><path d="${SPIRAL}"/></svg><span>CLPR</span></div>
<div class="middle">${title ? `<div class="title">${escape(title)}</div>` : `<div class="kicker">${escape(kicker)}</div>`}</div>
<div class="foot">CLPR BLOG</div>
</div></body></html>`;
}

const args = process.argv.slice(2);
const posts = readdirSync(join(root, 'content/posts')).filter((file) => file.endsWith('.md') && file !== '_index.md').map(readPost);
const jobs = [];
if (!args.length || args.includes('--default')) jobs.push({ out: 'public/images/blog/default.jpg', kicker: 'Project news' });
for (const post of posts) {
  if (args.length && !args.includes(post.slug)) continue;
  jobs.push({ out: `public/images/blog/${post.slug}/cover.jpg`, title: post.title });
}
const unknown = args.filter((arg) => arg !== '--default' && !posts.some((post) => post.slug === arg));
if (unknown.length) {
  console.error(`blog-image: no post with the slug ${unknown.join(', ')}`);
  process.exit(1);
}

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
for (const job of jobs) {
  await page.setContent(html(job), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  mkdirSync(join(root, job.out, '..'), { recursive: true });
  // JPEG: the gradient is a third of the size of a PNG at no visible cost to the type.
  await page.locator('.banner').screenshot({ path: join(root, job.out), type: 'jpeg', quality: 90 });
  console.log(`blog-image: ${job.out}`);
}
await browser.close();
