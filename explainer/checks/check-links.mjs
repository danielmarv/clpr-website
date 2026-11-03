#!/usr/bin/env node
/**
 * The engine's link check (knowledge-site-engine scripts/check-links.mjs) for pages served inside the
 * CLPR website: every href="#…" must resolve to an id on the same page, and every relative href to a
 * built file, as there. A root-relative link that is not a file of the explainer is a page of the
 * website, and resolves when the website has that route (src/app/<path>/page.tsx beside explainer/).
 * kse runs this file in place of the engine's gate because it has the same name, so `kse check` runs it
 * twice: once among the gates and once among the pack's own checks.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const dist = join(process.cwd(), process.env.KSE_DIST ?? 'dist');
const website = join(process.cwd(), '..', 'src', 'app');
// Astro writes files at the root of dist/ whatever the base path is, while root-relative hrefs carry the
// base as a URL prefix (BASE_PATH in astro.config.mjs); read it off the favicon link of the home page.
const home = readFileSync(join(dist, 'index.html'), 'utf8');
const base = (home.match(/href="([^"]*\/)favicon\.svg"/)?.[1] ?? process.env.BASE_PATH ?? '/').replace(/\/?$/, '/');
const pages = ['index.html', 'developers/index.html'];
const errors = [];
let external = 0, internal = 0, onWebsite = 0;

/** Whether the website serves `path` ("/issues/" → src/app/issues/page.tsx, "/" → src/app/page.tsx). */
function websiteRoute(path) {
  const segments = path.split('/').filter(Boolean);
  return existsSync(join(website, ...segments, 'page.tsx'));
}

for (const page of pages) {
  const file = join(dist, page);
  const html = readFileSync(file, 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (href.startsWith('#')) { internal++; if (!ids.has(href.slice(1))) errors.push(`${page}: broken anchor ${href}`); continue; }
    if (/^(https?:)?\/\//.test(href) || href.startsWith('mailto:')) { external++; continue; }
    const [path] = href.split('#');
    const rel = path.startsWith(base) ? '/' + path.slice(base.length) : path;
    let target = rel.startsWith('/') ? join(dist, rel) : resolve(dirname(file), rel);
    if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
    if (existsSync(target)) internal++;
    else if (path.startsWith('/') && websiteRoute(path)) onWebsite++;
    else errors.push(`${page}: broken relative link ${href}`);
  }
}
if (errors.length) { console.error('Link check failed:\n- ' + errors.join('\n- ')); process.exit(1); }
console.log(`Link check passed: ${internal} internal links resolve, ${onWebsite} lead to pages of the website; ${external} external links not fetched.`);
