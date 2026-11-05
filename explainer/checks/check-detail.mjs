#!/usr/bin/env node
// Detail check: the explainer states stable concepts, and leaves volatile detail to the specification.
// Field numbers, struct and interface layouts, fixed addresses, port numbers and tag numbers change with
// every upstream sync, so they are not written into the pages' prose. A line (or the line before it, or the
// line before a code fence) carrying `detail-allow: <reason>` is exempt; the reason keeps the exception
// reviewable. `--list` prints the exceptions instead of failing, for the weekly upstream report.
//   node checks/check-detail.mjs [--list]
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const packDir = join(fileURLToPath(import.meta.url), '..', '..');
const contentDir = join(packDir, 'src', 'content');
const listOnly = process.argv.includes('--list');

const LINE_PATTERNS = [
  [/=\s*\d+;/, 'a protobuf field number'],
  [/\b0x…?[0-9a-f]{3,}\b/i, 'a fixed address'],
  [/\b(?:port|default)\s+\d{4,5}\b|\(default \d{4,5}\)/i, 'a port number'],
  [/\btags?\s+\d{3}\b/i, 'a state tree tag number'],
];
const FENCE_LANGUAGES = new Set(['protobuf', 'proto', 'solidity', 'sol']);
const LAYOUT = /^\s*(struct|interface|message|enum)\s+\w+/m;

const findings = [];
const exceptions = [];

for (const name of readdirSync(contentDir).filter((file) => file.endsWith('.mdx'))) {
  const file = join(contentDir, name);
  const lines = readFileSync(file, 'utf8').split('\n');
  let fenceStart = -1;
  let fenceLanguage = '';
  let fenceBody = [];
  const allowed = (index) => [lines[index], lines[index - 1] ?? ''].some((text) => text.includes('detail-allow'));
  const report = (index, what) => {
    const entry = `${relative(packDir, file)}:${index + 1}: ${what}`;
    (allowed(index) ? exceptions : findings).push(entry);
  };

  lines.forEach((text, index) => {
    const fence = text.match(/^```(\w*)/);
    if (fence && fenceStart < 0) {
      fenceStart = index;
      fenceLanguage = fence[1].toLowerCase();
      fenceBody = [];
      return;
    }
    if (fence && fenceStart >= 0) {
      const body = fenceBody.join('\n');
      if (FENCE_LANGUAGES.has(fenceLanguage) || LAYOUT.test(body)) report(fenceStart, 'a code block that lays out fields or an interface');
      fenceStart = -1;
      return;
    }
    if (fenceStart >= 0) {
      fenceBody.push(text);
      return;
    }
    for (const [pattern, what] of LINE_PATTERNS) if (pattern.test(text)) report(index, `${what} in prose`);
  });
}

if (listOnly) {
  console.log(exceptions.length ? exceptions.map((entry) => `- ${entry}`).join('\n') : 'No detail-allow exceptions.');
  process.exit(0);
}
if (findings.length) {
  console.error(`Detail check failed: volatile detail belongs in the specification, not on the page (mark a deliberate exception with detail-allow: reason).\n${findings.map((entry) => `- ${entry}`).join('\n')}`);
  process.exit(1);
}
console.log(`Detail check passed: no volatile detail in prose; ${exceptions.length} marked exception(s).`);
