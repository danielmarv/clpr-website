#!/usr/bin/env node
/**
 * Markup for the website's drawing vocabulary, for the explainer's figures and simulations.
 * Prints plain SVG (no scripts, no styles, no expressions) to paste into a figure; the art-*
 * classes in explainer/src/styles/site-theme.css give it the landing page's look. The geometry is
 * the landing page's own (src/components/fibreSvg.tsx), seeded, so the same command always prints
 * the same markup.
 *
 *   node .claude/skills/clpr-figure/art.mjs ledger 120 110 70 a [--seed 2] [--validators 6] [--at 0.72]
 *                                          (--at: validator ring as a fraction of r; 0.86 keeps them by the membrane)
 *   node .claude/skills/clpr-figure/art.mjs star 120 110 12 a          CLPR Service (r 12-18) or application (r 8-10)
 *   node .claude/skills/clpr-figure/art.mjs endpoint 190 110 a [r]      hexagon, default r 9
 *   node .claude/skills/clpr-figure/art.mjs verifier 140 150 [r]        diamond, default r 10
 *   node .claude/skills/clpr-figure/art.mjs coin 100 150                Connector
 *   node .claude/skills/clpr-figure/art.mjs ring 140 150 [r]            proof check
 *   node .claude/skills/clpr-figure/art.mjs bundle 300 110 [n]          a bundle of n messages (default 3), a dashed pill
 *   node .claude/skills/clpr-figure/art.mjs fibres 190 110 430 110 a [--strands 6] [--spread 0.08] [--bow 0] [--seed 1]
 *   node .claude/skills/clpr-figure/art.mjs lane <id> 190 430           gradient defs for a Ledger A to Ledger B channel;
 *                                                                        then: fibres ... lane --lane <id>
 * Tones: a, b, c, money, ok, bad.
 */
import { readFileSync } from 'node:fs';

const [kind, ...rest] = process.argv.slice(2);
const flags = {};
const args = [];
for (let index = 0; index < rest.length; index++) {
  if (rest[index].startsWith('--')) flags[rest[index].slice(2)] = rest[++index];
  else args.push(rest[index]);
}
const TONES = ['a', 'b', 'c', 'money', 'ok', 'bad'];
const num = (value, name) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) fail(`${name} must be a number, got "${value}"`);
  return parsed;
};
const tone = (value) => {
  if (!TONES.includes(value)) fail(`tone must be one of ${TONES.join(', ')}, got "${value}"`);
  return value;
};
function fail(message) {
  console.error(`art: ${message}\nRun without arguments for usage.`);
  process.exit(1);
}
const round = (value) => Math.round(value * 10) / 10;

// The landing page's seeded random (sceneGraphs.ts) and fibre (fibreSvg.tsx).
function seeded(seed) {
  let state = seed;
  return () => { state = (state * 16807) % 2147483647; return (state - 1) / 2147483646; };
}
function fibre(a, b, bow, offset = 0) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length, ny = dx / length;
  const side = length * (bow + offset);
  const c1 = { x: a.x + dx * 0.33 + nx * side, y: a.y + dy * 0.33 + ny * side };
  const c2 = { x: a.x + dx * 0.67 + nx * side * 0.9, y: a.y + dy * 0.67 + ny * side * 0.9 };
  return `M${round(a.x)} ${round(a.y)}C${round(c1.x)} ${round(c1.y)} ${round(c2.x)} ${round(c2.y)} ${round(b.x)} ${round(b.y)}`;
}
function starPath(x, y, r) {
  const ray = Math.max(0.6, r * 0.07);
  const p = (dx, dy) => `${round(x + dx)} ${round(y + dy)}`;
  return `M${p(-r, 0)}L${p(0, -ray)}L${p(r, 0)}L${p(0, ray)}ZM${p(0, -r)}L${p(ray, 0)}L${p(0, r)}L${p(-ray, 0)}Z`;
}
function hexagon(x, y, r) {
  return Array.from({ length: 6 }, (_, k) => {
    const angle = (k / 6) * Math.PI * 2 + Math.PI / 6;
    return `${k ? 'L' : 'M'}${round(x + Math.cos(angle) * r)} ${round(y + Math.sin(angle) * r)}`;
  }).join('') + 'Z';
}
function fibres(a, b, toneName, { strands = 6, spread = 0.08, bow = 0, seed = 1, lane } = {}) {
  const random = seeded(seed);
  const paths = Array.from({ length: strands }, (_, s) => {
    const position = strands > 1 ? (s / (strands - 1)) * 2 - 1 : 0;
    // Denser along the spine of the bundle, sparser at its edges.
    const fan = Math.sign(position) * Math.pow(Math.abs(position), 1.5) + (random() - 0.5) * 0.2;
    return `  <path d="${fibre(a, b, bow, spread * fan)}"/>`;
  });
  const open = lane ? `<g class="art-fibre lane" stroke="url(#${lane})">` : `<g class="art-fibre ${toneName}">`;
  return [open, ...paths, '</g>'].join('\n');
}

const out = (() => {
  switch (kind) {
    case 'star': return `<path class="art-star ${tone(args[3] ?? 'a')}" d="${starPath(num(args[0], 'x'), num(args[1], 'y'), num(args[2] ?? 12, 'r'))}"/>`;
    case 'endpoint': return `<path class="art-endpoint ${tone(args[2] ?? 'a')}" d="${hexagon(num(args[0], 'x'), num(args[1], 'y'), num(args[3] ?? 9, 'r'))}"/>`;
    case 'verifier': {
      const x = num(args[0], 'x'), y = num(args[1], 'y'), r = num(args[2] ?? 10, 'r');
      return `<path class="art-verifier" d="M${x} ${y - r}L${x + r} ${y}L${x} ${y + r}L${x - r} ${y}Z"/>`;
    }
    case 'coin': {
      const x = num(args[0], 'x'), y = num(args[1], 'y');
      return `<circle class="art-coin" cx="${x}" cy="${y}" r="10"/><circle class="art-coin-dot" cx="${x}" cy="${y}" r="3.5"/>`;
    }
    case 'bundle': {
      // The landing page's bundle (TermArt BundleOfThree): a dashed pill holding n message stars.
      const x = num(args[0], 'x'), y = num(args[1], 'y'), n = num(args[2] ?? 3, 'n');
      const width = 13 * n + 13;
      const stars = Array.from({ length: n }, (_, k) => `<path class="art-star a" d="${starPath(x - ((n - 1) * 13) / 2 + k * 13, y, 8)}"/>`);
      return [`<rect class="art-bundle" x="${round(x - width / 2)}" y="${y - 13}" width="${width}" height="26" rx="13"/>`, ...stars].join('\n');
    }
    case 'ring': return `<circle class="art-ring" cx="${num(args[0], 'x')}" cy="${num(args[1], 'y')}" r="${num(args[2] ?? 14, 'r')}"/>`;
    case 'ledger': {
      const x = num(args[0], 'x'), y = num(args[1], 'y'), r = num(args[2], 'r'), t = tone(args[3] ?? 'a');
      const random = seeded(num(flags.seed ?? 2, 'seed'));
      const count = num(flags.validators ?? 6, 'validators');
      const at = num(flags.at ?? 0.72, 'at');
      const ring = Array.from({ length: count }, (_, k) => {
        const angle = ((-90 + (k * 360) / count + (random() - 0.5) * 24) * Math.PI) / 180;
        return { x: x + Math.cos(angle) * r * at, y: y + Math.sin(angle) * r * at };
      });
      const links = ring.map((point, k) => `  <path d="${fibre(point, ring[(k + 1) % ring.length], 0.06)}"/>`);
      return [
        `<g class="art-ledger">`,
        `<circle class="art-orb ${t}" cx="${x}" cy="${y}" r="${r}"/>`,
        `<g class="art-fibre ${t}">`, ...links, `</g>`,
        ...ring.map((point) => `<path class="art-validator ${t}" d="${starPath(point.x, point.y, 4.5)}"/>`),
        `</g>`,
      ].join('\n');
    }
    case 'fibres': {
      const [x1, y1, x2, y2] = args.slice(0, 4).map((value, index) => num(value, ['x1', 'y1', 'x2', 'y2'][index]));
      const t = args[4] === 'lane' ? 'lane' : tone(args[4] ?? 'a');
      if (t === 'lane' && !flags.lane) fail('fibres ... lane needs --lane <id> (print it with: art.mjs lane <id> x1 x2)');
      return fibres({ x: x1, y: y1 }, { x: x2, y: y2 }, t, {
        strands: num(flags.strands ?? 6, 'strands'), spread: num(flags.spread ?? 0.08, 'spread'),
        bow: num(flags.bow ?? 0, 'bow'), seed: num(flags.seed ?? 1, 'seed'), lane: flags.lane,
      });
    }
    case 'lane': {
      const [id, x1, x2] = [args[0], num(args[1], 'x1'), num(args[2], 'x2')];
      if (!id || !/^[a-z][a-z0-9-]*$/.test(id)) fail('lane needs an id prefixed with the figure name, e.g. what-b-checks-lane');
      return `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="0" x2="${x2}" y2="0"><stop offset="0" stop-color="#9d8bff"/><stop offset="1" stop-color="#f27fbd"/></linearGradient></defs>`;
    }
    default: {
      const usage = readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter((line) => line.startsWith(' *')).map((line) => line.slice(3)).join('\n');
      console.log(usage);
      process.exit(kind ? 1 : 0);
    }
  }
})();
console.log(out);
