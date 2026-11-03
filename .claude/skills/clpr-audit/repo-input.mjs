#!/usr/bin/env node
/**
 * Audit inputs for everything the engine's `kse audit-input` does not reach: one Markdown file
 * per block of the website's src/content/site.ts (its text beside the upstream passages that
 * src/content/site-refs.json names), the website's hard-coded component text, the explainer's
 * journey steps, section and act text, pack text and page chrome, and the lines of the
 * repository's documents that describe CLPR. Written next to the explainer's inputs and added to
 * its judge groups, so one audit covers the whole repository.
 *
 *   node .claude/skills/clpr-audit/repo-input.mjs          # write the inputs
 *   node .claude/skills/clpr-audit/repo-input.mjs --live   # also run each live check
 *
 * Run from the repository root after the explainer's audit-input (it rewrites _GROUPS.json).
 * Exits 1 if a site.ts block has no entry in site-refs.json or a ref does not resolve.
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const explainer = join(root, 'explainer');
const upstream = join(explainer, '.upstream');
const outDir = join(upstream, 'audit-input');
const runLive = process.argv.includes('--live');

if (!existsSync(join(root, 'src/content/site.ts'))) fail('run from the repository root (src/content/site.ts not found)');
if (!existsSync(upstream)) fail('explainer/.upstream/ is missing; run the explainer sync fetch first');

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const sources = readJson(join(explainer, 'src/data/sources.json'));
const pack = readJson(join(explainer, 'src/data/pack.json'));
const siteRefs = readJson(join(root, 'src/content/site-refs.json'));
const site = await import(pathToFileURL(join(root, 'src/content/site.ts')).href);
const pins = sources.sources.map((source) => `${source.id}@${source.commit.slice(0, 7)}`).join(', ');
const problems = [];

function fail(message) {
  console.error(`repo-input: ${message}`);
  process.exit(1);
}

// Heading anchors as the explainer's anchor check computes them.
function slug(heading) {
  return heading.trim().toLowerCase().replace(/[`*_~]/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/ /g, '-');
}
function headingBlocks(file) {
  const lines = readFileSync(file, 'utf8').split('\n');
  const blocks = new Map();
  for (let index = 0; index < lines.length; index++) {
    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(lines[index]);
    if (!match) continue;
    let anchor = slug(match[2]);
    for (let suffix = 1; blocks.has(anchor); suffix++) anchor = `${slug(match[2])}-${suffix}`;
    let end = index + 1;
    while (end < lines.length && !(/^(#{1,6})\s/.exec(lines[end]) && /^(#{1,6})\s/.exec(lines[end])[1].length <= match[1].length)) end++;
    blocks.set(anchor, lines.slice(index, end).join('\n').trim());
  }
  return blocks;
}
const docs = Object.fromEntries(Object.entries(pack.docs).map(([key, doc]) => [key, headingBlocks(join(upstream, doc.source, doc.path))]));

function passage(ref, block) {
  if (ref.doc !== 'repo') {
    const text = docs[ref.doc]?.get(ref.anchor);
    if (!text) problems.push(`${block}: ${ref.doc} heading #${ref.anchor} not found`);
    return `### ${ref.label}: ${pack.docs[ref.doc]?.label ?? ref.doc} #${ref.anchor}\n\n${text ?? '(not found)'}`;
  }
  const file = join(upstream, ref.id, ref.path);
  if (!existsSync(file) || statSync(file).isDirectory()) {
    problems.push(`${block}: ${ref.id}/${ref.path} not found upstream`);
    return `### ${ref.label}: ${ref.id}/${ref.path}\n\n(not found)`;
  }
  const lines = readFileSync(file, 'utf8').split('\n');
  const shown = lines.slice(0, 300).join('\n') + (lines.length > 300 ? `\n… (${lines.length - 300} more lines; open the file)` : '');
  return `### ${ref.label}: ${ref.id}/${ref.path}\n\n${shown}`;
}

// Every string a visitor can read, with its path inside the block; links, ids and class names are skipped.
const SKIP_KEYS = new Set(['href', 'src', 'className', 'id', 'width', 'height', 'visual', 'implements', 'glossaryId']);
function strings(value, path, out) {
  if (typeof value === 'string') {
    if (!/^(https?:\/\/|\/|#)/.test(value)) out.push(`- \`${path}\`: ${value}`);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => strings(item, `${path}[${index}]`, out));
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) if (!SKIP_KEYS.has(key)) strings(item, path ? `${path}.${key}` : key, out);
  }
  return out;
}

const UNIVERSAL = /\b(every|any|all|only|never|always|nobody|no one|none|nothing|cannot|zero|exactly|whole|immutable|directly|instant|bounded|guarantee[sd]?|typical|most|production|deployable)\b/i;
const RETIRED = (pack.retiredVocab ?? []).map(([pattern, term]) => [new RegExp(pattern, 'i'), term]);
function claimNotes(lines) {
  const universal = lines.filter((line) => UNIVERSAL.test(line));
  const retired = lines.flatMap((line) => RETIRED.filter(([pattern]) => pattern.test(line)).map(([, term]) => `${line}  →  use: ${term}`));
  return [
    '## Retired phrases (each one is a finding)', '', ...(retired.length ? retired : ['none']), '',
    '## Universal claims to verify first', '', ...(universal.length ? universal : ['none']), '',
  ];
}

function liveSection(ids) {
  if (!ids?.length) return [];
  const out = ['## Live facts (outside the pinned repositories)', ''];
  for (const id of ids) {
    const fact = siteRefs.live[id];
    if (!fact) { problems.push(`live fact ${id} is not defined`); continue; }
    out.push(`### ${id}: ${fact.claim}`, '', `Recorded ${fact.recorded.date}: ${fact.recorded.result}`, '');
    for (const command of fact.checks) {
      out.push('```sh', command, '```');
      if (runLive) {
        let result;
        try { result = execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000 }).trim(); }
        catch (error) { result = `(check failed: ${String(error.stderr || error.message).trim().split('\n')[0]})`; }
        out.push(`Result on ${new Date().toISOString().slice(0, 10)}:`, '', '```', result || '(empty)', '```');
      }
    }
    out.push('');
  }
  return out;
}

const files = [];
for (const [name, value] of Object.entries(site)) {
  const entry = siteRefs.blocks[name];
  if (!entry) problems.push(`site.ts export "${name}" has no entry in src/content/site-refs.json (judged as unsupported until it has one)`);
  if (entry?.claims === false) continue;
  const lines = strings(value, '', []);
  const body = [
    `# Audit input: website, ${name}`, '',
    `Pinned commits: ${pins}. Source: src/content/site.ts, export \`${name}\`; refs from src/content/site-refs.json. Drawings and animations that use this block are judged from the screenshots (website-shots.mjs).`, '',
    '## Site text', '', ...lines, '',
    ...claimNotes(lines),
    ...liveSection(entry?.live),
    '## Upstream passages (at the pinned commits)', '',
    ...(entry?.refs?.length ? entry.refs.map((ref) => passage(ref, name)) : ['(none: every statement in this block is unsupported until site-refs.json names its sources)']), '',
  ];
  files.push({ name: `website-${name}.md`, text: body.join('\n') });
}
for (const name of Object.keys(siteRefs.blocks)) if (!(name in site)) problems.push(`site-refs.json block "${name}" is not exported by site.ts`);

// Text written straight into components and pages rather than taken from site.ts.
const componentLines = [];
for (const dir of ['src/components', 'src/components/ui', 'src/app']) {
  for (const file of readdirSync(join(root, dir)).filter((entry) => entry.endsWith('.tsx'))) {
    const path = join(dir, file);
    readFileSync(join(root, path), 'utf8').split('\n').forEach((line, index) => {
      const texts = [...line.matchAll(/>([^<>{}]*[A-Za-z]{3,}[^<>{}]*)</g), ...line.matchAll(/(?:aria-label|alt|title)="([^"]+)"/g)]
        .map((match) => match[1].trim()).filter((text) => /[a-z]{3,}/i.test(text) && !/[=&|;(){}]/.test(text));
      for (const text of texts) componentLines.push(`- ${path}:${index + 1}: ${text}`);
    });
  }
}
files.push({
  name: 'website-components.md',
  text: [`# Audit input: website, text in components`, '', `Pinned commits: ${pins}. Text not taken from site.ts. Judge each line against the design summary below.`, '', '## Site text', '', ...(componentLines.length ? componentLines : ['none']), '', ...claimNotes(componentLines),
    '## Upstream passages (at the pinned commits)', '', passage({ doc: 'design', anchor: '23-trust-model', label: 'design §2.3' }, 'components'), ''].join('\n'),
});

// The repository's own documents: only the sentences that describe CLPR itself.
const PROTOCOL = /\b(CLPR|ledger|bridge|endpoint|verifier|proof|channel|connector|HIP|Hiero|licen[cs]e|LFDT)\b/i;
const docLines = [];
// Every document except the generated content map and the changelog (history, not claims).
const explainerDocs = readdirSync(join(explainer, 'docs')).filter((name) => name.endsWith('.md') && name !== 'content-map.md').map((name) => `explainer/docs/${name}`);
for (const path of ['README.md', 'CONTRIBUTING.md', 'AGENTS.md', 'explainer/README.md', 'explainer/CONTRIBUTING.md', 'explainer/CLAUDE.md', ...explainerDocs]) {
  if (!existsSync(join(root, path))) continue;
  readFileSync(join(root, path), 'utf8').split('\n').forEach((line, index) => {
    if (PROTOCOL.test(line) && !/^\s*(```|<!--|\|[\s:|-]+\|?\s*$)/.test(line) && line.trim().length > 30) docLines.push(`- ${path}:${index + 1}: ${line.trim()}`);
  });
}
for (const path of ['package.json', 'explainer/package.json']) {
  const description = readJson(join(root, path)).description;
  if (description) docLines.push(`- ${path}: description: ${description}`);
}
files.push({
  name: 'website-docs.md',
  text: [`# Audit input: repository documents`, '', `Pinned commits: ${pins}. Lines that mention CLPR or its parts. Most are about tooling and need no source; judge only the ones that describe the protocol, its status or its licences.`, '', '## Site text', '', ...docLines, '', ...claimNotes(docLines),
    ...liveSection(['hiero-native', 'spec-license']),
    '## Upstream passages (at the pinned commits)', '', passage({ doc: 'design', anchor: '1-executive-summary', label: 'design §1' }, 'docs'), passage({ doc: 'repo', id: 'org-profile', path: 'profile/README.md', label: 'org profile' }, 'docs'), ''].join('\n'),
});

// The explainer's own text that the engine's audit-input skips: the journey, act and section
// text, pack text and the page chrome.
const readExplainer = (name) => readJson(join(explainer, 'src/data', name));
const dedupe = (refs) => [...new Map(refs.map((ref) => [JSON.stringify(ref), ref])).values()];
const journey = readExplainer('journey.json');
const journeyLines = [];
for (const phase of journey.phases ?? []) journeyLines.push(`- phase ${phase.id}: ${phase.title}. ${phase.plain ?? ''}`);
for (const step of journey.steps ?? []) journeyLines.push(`- step ${step.n} (${step.label}): ${step.title}. Plain: ${step.plain} Protocol: ${step.protocol}`);
for (const step of Array.isArray(journey.reverse) ? journey.reverse : []) journeyLines.push(`- reverse ${step.n ?? ''}: ${step.title ?? ''}. ${step.plain ?? ''} ${step.protocol ?? ''}`.trim());
const journeyRefs = dedupe([...(journey.steps ?? []), ...(Array.isArray(journey.reverse) ? journey.reverse : [])].flatMap((step) => step.refs ?? []));
files.push({
  name: 'explainer-journey.md',
  text: [`# Audit input: explainer journey (journey.json)`, '', `Pinned commits: ${pins}. The step-by-step journey both pages draw. Each step's own refs are merged below.`, '', '## Site text', '', ...journeyLines, '', ...claimNotes(journeyLines),
    '## Upstream passages (at the pinned commits)', '', ...journeyRefs.map((ref) => passage(ref, 'journey')), ''].join('\n'),
});

const sectionsData = readExplainer('sections.json');
const sectionLines = [];
for (const page of ['general', 'developers']) {
  for (const act of sectionsData.acts?.[page] ?? []) sectionLines.push(`- ${page} act ${act.numeral} ${act.name}: ${act.title}. Goal: ${act.goal}`);
  for (const section of sectionsData[page] ?? []) sectionLines.push(`- ${page} §${section.id}: ${section.title}${section.lead ? `. ${section.lead}` : ''}`);
}
const packData = readExplainer('pack.json');
const packLines = [...(packData.footer ?? []), packData.provenance?.intro ?? ''].filter(Boolean).map((text) => `- pack: ${text.replace(/<[^>]+>/g, '')}`);
const chromeLines = [];
for (const path of ['src/components/SiteHeader.astro', 'src/components/SiteFooter.astro', 'src/components/Repos.astro', 'src/layouts/Site.astro', 'src/pages/index.astro', 'src/pages/developers.astro']) {
  const full = join(explainer, path);
  if (!existsSync(full)) continue;
  readFileSync(full, 'utf8').split('\n').forEach((line, index) => {
    for (const match of [...line.matchAll(/>([^<>{}]*[A-Za-z]{3,}[^<>{}]*)</g), ...line.matchAll(/(?:label|title|aria-label|alt|description)(?:: ?|=)['"]([^'"]{12,})['"]/g)]) {
      const text = match[1].trim();
      if (/[a-z]{3,}/i.test(text) && !/[=&|;(){}]/.test(text)) chromeLines.push(`- explainer/${path}:${index + 1}: ${text}`);
    }
  });
}
const otherLines = [...sectionLines, ...packLines, ...chromeLines];
files.push({
  name: 'explainer-titles-and-chrome.md',
  text: [`# Audit input: explainer titles, act text, pack text and page chrome`, '', `Pinned commits: ${pins}. Titles and goals are judged against the refs of the sections they introduce (see the section files); the chrome against the summary below.`, '', '## Site text', '', ...otherLines, '', ...claimNotes(otherLines),
    '## Upstream passages (at the pinned commits)', '', passage({ doc: 'design', anchor: '1-executive-summary', label: 'design §1' }, 'titles'), passage({ doc: 'design', anchor: '23-trust-model', label: 'design §2.3' }, 'titles'), ''].join('\n'),
});

mkdirSync(outDir, { recursive: true });
for (const file of files) writeFileSync(join(outDir, file.name), file.text);

// Add the website files to the explainer's judge groups, replacing any from an earlier run.
const groupsFile = join(outDir, '_GROUPS.json');
const groups = existsSync(groupsFile) ? readJson(groupsFile).map((group) => group.filter((name) => !name.startsWith('website-'))).filter((group) => group.length) : [];
const limit = Number(process.env.KSE_AUDIT_GROUP_BYTES ?? 220000);
const added = [];
for (const file of [...files].sort((a, b) => b.text.length - a.text.length)) {
  const group = added.find((candidate) => candidate.bytes + file.text.length <= limit);
  if (group) { group.bytes += file.text.length; group.files.push(file.name); } else added.push({ bytes: file.text.length, files: [file.name] });
}
writeFileSync(groupsFile, JSON.stringify([...groups, ...added.map((group) => group.files)], null, 2) + '\n');
if (problems.length) console.error(`repo-input: problems (each is a finding; exit 1):\n- ${problems.join('\n- ')}`);
console.log(`repo-input: ${files.length} files written to ${relative(root, outDir)}/ (${added.length} judge group(s) added to _GROUPS.json)${runLive ? '; live checks run' : '; pass --live to run the live checks'}`);
if (problems.length) process.exit(1);
