#!/usr/bin/env node
/**
 * Data check. Every data row under src/data/ carries upstream references in the shape
 * check-anchors.mjs resolves, every source id exists, and (when .upstream/ is present) the data
 * inventories match upstream: verifier directories ↔ ledgers.json, ADR files ↔ adrs.json, design
 * §3.4 and §4 headings ↔ patterns.json / roles.json, "‼️" passages ↔ open.json. An inventory
 * failure is the list of new upstream things the site has not described yet.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';

import { root, upstreamDir as up, readData as read } from 'knowledge-site-engine/scripts/lib/pack.mjs';
const sources = read('sources.json');
const ids = new Set(sources.sources.map((s) => s.id));
const errors = [];
const KEYS = { design: ['doc', 'anchor', 'label'], spec: ['doc', 'anchor', 'label'], repo: ['doc', 'id', 'path', 'label'] };

function checkRef(where, r) {
  if (!r || typeof r !== 'object') return errors.push(`${where}: ref is not an object`);
  const want = KEYS[r.doc];
  if (!want) return errors.push(`${where}: ref doc must be design, spec or repo`);
  const have = Object.keys(r);
  if (have.slice(0, want.length - 1).join(',') !== want.slice(0, -1).join(',')) errors.push(`${where}: ref keys must be in the order ${want.join(', ')} (got ${have.join(', ')}); check-anchors.mjs matches them textually`);
  if (!r.label) errors.push(`${where}: ref has no label`);
  if (r.doc === 'repo' && !ids.has(r.id)) errors.push(`${where}: unknown source id "${r.id}"`);
}
function checkRows(file, key, rows, min = 1) {
  if (!Array.isArray(rows) || rows.length < min) errors.push(`${file}: "${key}" needs at least ${min} row(s)`);
  for (const [i, row] of (rows ?? []).entries()) {
    const where = `${file} ${key}[${i}]`;
    if (!Array.isArray(row.refs) || row.refs.length === 0) errors.push(`${where}: no refs`);
    for (const r of row.refs ?? []) checkRef(where, r);
  }
}

const sections = read('sections.json');
for (const page of ['general', 'developers']) checkRows('sections.json', page, sections[page], 1);
const catalog = read('catalog.json');
checkRows('catalog.json', 'components', catalog.components, 10);
const SVG_KEYS = ['spec', 'svcA', 'svcB', 'verB', 'epB', 'epA', 'wire', 'conB', 'appB', 'lab'];
for (const c of catalog.components) if (!SVG_KEYS.includes(c.k)) errors.push(`catalog.json: component "${c.k}" has no place on the Architecture map (add it to the SVG in Architecture.astro and to SVG_KEYS here first)`);
const usedIds = new Set(catalog.components.flatMap((c) => c.refs.filter((r) => r.doc === 'repo').map((r) => r.id)));
for (const id of ids) if (!usedIds.has(id)) errors.push(`catalog.json: source "${id}" is cited by no component`);
const ledgers = read('ledgers.json');
checkRows('ledgers.json', 'ledgers', ledgers.ledgers, 2);
for (const l of ledgers.ledgers) if (!['documented', 'code', 'mock'].includes(l.status)) errors.push(`ledgers.json: "${l.id}" has unknown status "${l.status}"`);
const patterns = read('patterns.json');
checkRows('patterns.json', 'patterns', patterns.patterns, 1);
const roles = read('roles.json');
checkRows('roles.json', 'roles', roles.roles, 1);
checkRows('roles.json', 'scenarios', roles.scenarios, 1);
const open = read('open.json');
checkRows('open.json', 'open', open.open, 1);
checkRef('open.json optionsDoc', open.optionsDoc);
for (const o of open.open) if (!['‼️', 'prose'].includes(o.marker)) errors.push(`open.json: "${o.id}" needs marker "‼️" or "prose"`);
const failures = read('failures.json');
checkRows('failures.json', 'cases', failures.cases, 1);
for (const g of failures.groups) for (const k of g.keys) if (!failures.cases.some((c) => c.k === k)) errors.push(`failures.json: group "${g.kicker}" names unknown case "${k}"`);
const cast = read('cast.json');
checkRows('cast.json', 'cast', cast.cast, 1);
const adrs = read('adrs.json');
checkRows('adrs.json', 'adrs', adrs.adrs, 1);

if (existsSync(up)) {
  const dirs = (p) => (existsSync(p) ? readdirSync(p).filter((e) => statSync(join(p, e)).isDirectory()) : []);
  const specDirs = dirs(join(up, 'clpr-spec/verifiers'));
  const codeDirs = [
    ...dirs(join(up, 'clpr-smart-contracts/src/verifiers/evm')).filter((d) => d !== 'common').map((d) => `src/verifiers/evm/${d}`),
    ...(existsSync(join(up, 'clpr-smart-contracts/src/verifiers/hiero')) ? ['src/verifiers/hiero'] : []),
  ];
  for (const d of specDirs) if (!ledgers.ledgers.some((l) => l.specDir === `verifiers/${d}`)) errors.push(`ledgers.json: upstream documents a verifier at clpr-spec/verifiers/${d} that has no row`);
  for (const d of codeDirs) if (!ledgers.ledgers.some((l) => l.codeDir === d)) errors.push(`ledgers.json: upstream has verifier code at clpr-smart-contracts/${d} that has no row`);
  for (const l of ledgers.ledgers) {
    if (l.specDir && !existsSync(join(up, 'clpr-spec', l.specDir))) errors.push(`ledgers.json: "${l.id}" names ${l.specDir}, which no longer exists upstream`);
    if (l.codeDir && !existsSync(join(up, 'clpr-smart-contracts', l.codeDir))) errors.push(`ledgers.json: "${l.id}" names ${l.codeDir}, which no longer exists upstream`);
  }
  const adrFiles = readdirSync(join(up, 'clpr-spec/ADR')).filter((f) => /^\d{4}-\d{2}-\d{2}-.*\.md$/.test(f));
  for (const f of adrFiles) if (!adrs.adrs.some((a) => a.file === f)) errors.push(`adrs.json: upstream ADR ${f} has no row`);
  for (const a of adrs.adrs) if (!adrFiles.includes(a.file)) errors.push(`adrs.json: row ${a.file} no longer exists upstream`);
  const design = readFileSync(join(up, 'clpr-spec/clpr-service.md'), 'utf8');
  const count = (re) => (design.match(re) ?? []).length;
  const h34 = count(/^### 3\.4\.\d+ /gm);
  if (h34 !== patterns.patterns.length) errors.push(`patterns.json: design §3.4 has ${h34} patterns, data has ${patterns.patterns.length}`);
  const h4 = count(/^## 4\.[1-6] /gm);
  if (h4 !== roles.roles.length) errors.push(`roles.json: design §4.1-4.6 has ${h4} roles, data has ${roles.roles.length}`);
  const sec47 = design.split(/^## 4\.7 /m)[1]?.split(/^# /m)[0] ?? '';
  const h47 = (sec47.match(/^### /gm) ?? []).length;
  if (h47 !== roles.scenarios.length) errors.push(`roles.json: design §4.7 has ${h47} scenarios, data has ${roles.scenarios.length}`);
  const marks = count(/^> ‼️/gm);
  const flagged = open.open.filter((o) => o.marker === '‼️').length;
  if (marks !== flagged) errors.push(`open.json: the design document has ${marks} "‼️" passages, data has ${flagged} rows with marker "‼️"`);
} else {
  console.log('check-data: .upstream/ not present, inventory comparison skipped (run npm run sync:fetch).');
}

if (errors.length) { console.error('Data check failed:\n- ' + errors.join('\n- ')); process.exit(1); }
console.log(`Data check passed: ${catalog.components.length} components, ${ledgers.ledgers.length} ledgers, ${patterns.patterns.length} patterns, ${roles.roles.length} roles, ${roles.scenarios.length} scenarios, ${open.open.length} open issues, ${failures.cases.length} failure cases, ${cast.cast.length} cast entries, ${adrs.adrs.length} ADRs.`);
