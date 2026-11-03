#!/usr/bin/env node
/**
 * Screenshots of every drawing and animation step on the website's landing page, for the audit:
 * the hero, each phase of the scroll story, then the comparison, architecture, code and get-involved
 * sections, at desktop width. Uses the explainer's Playwright.
 *
 *   pnpm build && pnpm start                                   # in one terminal (port 3000)
 *   node .claude/skills/clpr-audit/website-shots.mjs [baseUrl]  # default http://localhost:3000/
 *
 * Writes PNGs to explainer/.upstream/audit-input/website-shots/ and prints how many.
 */
import { mkdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const root = process.cwd();
const require = createRequire(join(root, 'explainer', 'package.json'));
const { chromium } = require('playwright');
const base = process.argv[2] ?? 'http://localhost:3000/';
const out = join(root, 'explainer', '.upstream', 'audit-input', 'website-shots');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
let count = 0;
const shot = async (name, target = page) => { await target.screenshot({ path: join(out, `${name}.png`) }); count++; };
const settle = (ms = 1600) => page.waitForTimeout(ms);
const sectionOf = (id) => page.locator(`#${id}`).locator('xpath=ancestor-or-self::section[1]');

await page.goto(base, { waitUntil: 'networkidle' });
await settle(3500);
await shot('01-hero');

// The story is scroll-driven: one shot per phase.
const story = await page.evaluate(() => { const element = document.querySelector('[data-scene="story"]'); return { top: element.getBoundingClientRect().top + scrollY, travel: element.offsetHeight - innerHeight }; });
for (const [index, progress] of [0.12, 0.4, 0.64, 0.86].entries()) {
  await page.evaluate((y) => scrollTo(0, y), story.top + story.travel * progress);
  await settle(2500);
  await shot(`02-story-${index}`);
}

for (const [id, name] of [['protocol', '03-comparison'], ['architecture', '04-architecture'], ['code', '05-code'], ['get-involved', '06-get-involved']]) {
  const section = sectionOf(id);
  await section.scrollIntoViewIfNeeded();
  await settle();
  await shot(name, section);
}

await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
await settle(2500);
await shot('07-footer');
await browser.close();
console.log(`website-shots: ${count} screenshots in explainer/.upstream/audit-input/website-shots/`);
