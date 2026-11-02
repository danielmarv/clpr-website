#!/usr/bin/env node
/**
 * Diagram text check. Renders both built pages in the site theme and measures every visible text
 * label in the figures and simulations: a label must keep a few units of room inside the box it
 * sits in and inside the drawing, must not run into another box, and must not sit on another label. `kse preview-diagram`
 * draws a figure in the engine's own fonts; this check uses the fonts the pages ship (Sora is wider
 * than the engine's serif), so it catches what the preview cannot. Run after `pnpm run build`.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';

import { chromium } from 'knowledge-site-engine/scripts/lib/playwright.mjs';
import { dist } from 'knowledge-site-engine/scripts/lib/pack.mjs';

if (!existsSync(join(dist, 'index.html'))) {
  console.error(`Diagram text check: ${dist}/index.html missing — run the build first`);
  process.exit(1);
}
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  let file = join(dist, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html'); } catch {}
  try { res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' }); res.end(await readFile(file)); } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;
const preinstalled = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath: process.env.PW_CHROME || (existsSync(preinstalled) ? preinstalled : undefined) });

const problems = [];
let drawings = 0, labels = 0;
for (const path of ['/', '/developers/']) {
  // Reduced motion: the plates are drawn in place, not mid-reveal.
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const found = await page.evaluate(() => {
    // Room a label keeps inside its box, in drawing units. Text renders a few per cent wider on some
    // platforms than on others, so a label that only just fits here can spill out in CI.
    const ROOM = 3;
    const shown = (el, svg) => {
      for (let n = el; n && n !== svg.parentNode; n = n.parentNode) {
        const s = getComputedStyle(n);
        if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false;
      }
      return el.getClientRects().length > 0;
    };
    const painted = (r) => {
      const s = getComputedStyle(r);
      const fill = s.fill !== 'none' && +s.fillOpacity > 0 && !/rgba\(.*,\s*0\)$/.test(s.fill);
      const stroke = s.stroke !== 'none' && +s.strokeOpacity > 0 && parseFloat(s.strokeWidth) > 0;
      return fill || stroke;
    };
    const overlap = (p, q) => [Math.min(p.right, q.right) - Math.max(p.left, q.left), Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top)];
    const out = [];
    let drawings = 0, labels = 0;
    for (const svg of document.querySelectorAll('.fig svg, .sim svg')) {
      const host = svg.closest('.fig, .sim');
      const name = host.classList.contains('fig')
        ? `figure "${host.querySelector('figcaption b')?.textContent.trim()}"`
        : `simulation "${host.querySelector('.sim__head h3, .sim__head h4')?.textContent.trim()}"`;
      const edge = svg.getBoundingClientRect();
      if (!edge.width) continue;
      drawings++;
      const room = ROOM * (svg.viewBox.baseVal.width ? edge.width / svg.viewBox.baseVal.width : 1);
      const tight = (b, r) => b.left < r.left + room || b.right > r.right - room;
      const boxes = [...svg.querySelectorAll('rect')].filter((r) => shown(r, svg) && painted(r)).map((r) => r.getBoundingClientRect()).filter((b) => b.width > 8 && b.height > 8);
      const texts = [...svg.querySelectorAll('text')].filter((t) => t.textContent.trim() && shown(t, svg)).map((t) => ({ text: t.textContent.trim().replace(/\s+/g, ' ').slice(0, 48), b: t.getBoundingClientRect() }));
      labels += texts.length;
      for (const [i, { text, b }] of texts.entries()) {
        const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
        if (tight(b, edge)) out.push(`${name}: "${text}" is within ${ROOM} units of the drawing's edge, or past it`);
        const holders = boxes.filter((r) => cx > r.left && cx < r.right && cy > r.top && cy < r.bottom);
        const own = holders.sort((p, q) => p.width * p.height - q.width * q.height)[0];
        if (own && tight(b, own)) out.push(`${name}: "${text}" is within ${ROOM} units of its box's edge, or past it`);
        // A box that does not hold the label but overlaps it: the label crosses that box's edge.
        const crossed = boxes.find((r) => !holders.includes(r) && overlap(b, r).every((d, k) => d > (k ? 3 : 2)));
        if (crossed) out.push(`${name}: "${text}" runs into a box`);
        for (const other of texts.slice(i + 1)) {
          const [ox, oy] = overlap(b, other.b);
          if (ox > 2 && oy > 3) out.push(`${name}: "${text}" sits on "${other.text}"`);
        }
      }
    }
    return { out, drawings, labels };
  });
  drawings += found.drawings;
  labels += found.labels;
  problems.push(...found.out.map((p) => `${path} ${p}`));
  await page.close();
}
await browser.close();
server.close();

if (problems.length) {
  console.error(`Diagram text check failed: ${problems.length} label(s) in ${drawings} drawings:\n- ${problems.join('\n- ')}\n` +
    'A figure is found by its lead in src/components/diagrams/, a simulation by its title in src/components/sims/.');
  process.exit(1);
}
console.log(`Diagram text check passed: ${labels} labels in ${drawings} drawings stay inside their boxes.`);
