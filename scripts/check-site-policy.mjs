#!/usr/bin/env node
// Site policy check: the website speaks for an LF Decentralized Trust lab, so its copy stays neutral and
// carries what LFDT's website requirements ask for. It covers what the explainer's gates do not reach:
// src/content/site.ts, the components, the blog posts and the README. A line carrying `policy-allow`
// is exempt.
//   node scripts/check-site-policy.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const errors = [];

function* walk(dir, extensions) {
  for (const name of readdirSync(join(root, dir))) {
    const path = join(dir, name);
    if (statSync(join(root, path)).isDirectory()) yield* walk(path, extensions);
    else if (extensions.has(extname(name))) yield path;
  }
}

// Commercial programs and lead generation, marketing claims the design does not support, testimonials, and
// the hyphenated spelling LFDT's requirements forbid.
const BANNED = [
  [/hashgraph\.com\/clpr/i, 'a link to a vendor program page'],
  [/premier member/i, 'vendor membership promotion'],
  [/genfinity/i, 'a commercial news source in place of the primary release'],
  [/single point of failure to attack/i, 'a marketing claim the design does not support'],
  [/no bridge to trust/i, 'an overstatement of the trust model'],
  [/proofs, not promises/i, 'a slogan'],
  [/\bopen-source\b/i, '"open source" is never hyphenated (LFDT requirements)'],
  [/\btestimonial|voices from the ecosystem/i, 'quotes used as endorsement (LFDT requirements)'],
];
const SCANNED = [
  'src/content/site.ts',
  'README.md',
  ...walk('src/components', new Set(['.tsx', '.ts'])),
  ...walk('src/app', new Set(['.tsx', '.ts'])),
  ...walk('content/posts', new Set(['.md'])),
];
for (const file of SCANNED) {
  read(file).split('\n').forEach((line, index) => {
    if (line.includes('policy-allow')) return;
    for (const [pattern, why] of BANNED) if (pattern.test(line)) errors.push(`${file}:${index + 1}: ${why}`);
  });
}

// What LFDT's requirements ask every lab website to carry.
const site = read('src/content/site.ts');
const REQUIRED = [
  ['An LF Decentralized Trust Lab', 'the affiliation line'],
  ['The Linux Foundation has registered trademarks and uses trademarks. For a list of trademarks of The Linux Foundation, please see our {trademarks} page.', 'the legal text, word for word'],
  ['https://www.linuxfoundation.org/legal/trademark-usage', 'the Trademark Usage link'],
  ['codeOfConduct', 'a Code of Conduct link'],
  ['security:', 'a security reporting link'],
];
for (const [text, what] of REQUIRED) if (!site.includes(text)) errors.push(`src/content/site.ts: missing ${what}`);

// Every blog post ends with its sources, as docs/blogs.md says.
for (const file of walk('content/posts', new Set(['.md']))) {
  if (file.endsWith('_index.md')) continue;
  if (!/^## Sources$/m.test(read(file))) errors.push(`${file}: no "## Sources" section`);
}

// Every block of site.ts has an entry in site-refs.json, so the audit knows where its claims come from.
const exported = [...site.matchAll(/^export const (\w+)/gm)].map((match) => match[1]);
const blocks = Object.keys(JSON.parse(read('src/content/site-refs.json')).blocks);
for (const name of exported) if (!blocks.includes(name)) errors.push(`src/content/site-refs.json: no entry for the "${name}" block of site.ts`);
for (const name of blocks) if (!exported.includes(name)) errors.push(`src/content/site-refs.json: entry "${name}" has no block in site.ts`);

if (errors.length) {
  console.error(`Site policy check failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  process.exit(1);
}
console.log(`Site policy check passed: ${[...SCANNED].length} files, ${exported.length} content blocks paired with refs.`);
