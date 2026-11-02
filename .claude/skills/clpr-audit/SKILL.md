---
name: clpr-audit
description: Audit the site's content against the pinned upstream commits. For every section of both pages and every data row, read the referenced upstream passages at the pinned commit beside the site text and report each statement as matches, drifted, unsupported or illustration, with the upstream quote. Report only; never edits. Use when asked to audit, verify, fact-check or validate the CLPR site or one-pagers against the spec, after a sync, before a release, or whenever accuracy is in doubt.
---

# clpr-audit: is the site saying what upstream says?

The checks in `pnpm run check` prove that every reference resolves. They cannot prove that a
sentence still says what the passage it cites says. This skill does that, mechanically paired and
humanly judged, and it never edits anything: its output is a report the maintainer or the
`clpr-sync` skill acts on.

## Ground rules

- **Report only.** No file under `src/`, `docs/` or `src/data/` changes during an audit. The output
  is `.upstream/audit-<date>.md` (git-ignored) and a summary to the user.
- **The refs are the contract.** A section is judged against the passages its `refs` in
  `src/data/sections.json` point at; a data row against its own `refs`. If a statement needs a
  passage the refs do not include, that is a finding (unsupported), not a reason to go looking.
- **Pinned commits, not HEAD.** `.upstream/` holds the repositories at the commits in
  `src/data/sources.json`. If `pnpm run sync:status` reports drift, note it in the report header and
  still audit against the pins; drift is the `clpr-drift` skill's job.
- **Flagged sections are different.** A section with `illustration: true` may contain the site's own
  illustrations; an unbacked statement there is reported as `illustration`, not `unsupported`.

## Procedure

1. **Prepare.** `pnpm run sync:fetch` if `.upstream/` is missing. Then
   `pnpm exec kse audit-input`: one Markdown file per section and per data table under
   `.upstream/audit-input/`, each with the site text above and the upstream passages below.
   `--list` prints the file names without writing.
2. **Judge, one file at a time.** For each input file, go statement by statement through the site
   text and record a verdict:
   - `matches`: the statement is entailed by a passage below it (paraphrase is fine; numbers,
     names, field names, orderings and conditions must agree).
   - `drifted`: the statement contradicts a passage, or states something the passage used to say
     and no longer does. Quote the passage.
   - `unsupported`: no passage below backs it, and the section is not flagged. Say which passage
     would (a heading in the design document or the specification, a file path), if you know one.
   - `illustration`: unbacked, but the section is flagged or the text itself says it is the site's
     illustration.
   - `quote-mismatch`: text in quotation marks that is not verbatim in any passage.
   Sections are independent, so this fans out well: one agent per input file returning its rows as
   JSON, merged by the main session; a Workflow run when the host offers one. If agents stall (they
   did in this environment on 2026-10-01), judge in-session, file by file, and say so in the report.
3. **Check the other direction for data tables.** For `data-*.md` files, also ask whether the
   upstream passage lists something the rows do not (a pattern, a role, a scenario, a verifier, an
   ADR, a flagged issue); `node checks/check-data.mjs` catches the countable cases, the audit
   catches the rest.
4. **Verify what is not `matches`.** Re-read every drifted, unsupported and quote-mismatch finding
   against the full upstream file (not only the extracted passage) before keeping it; drop it if
   the full file backs the statement, and say in the row that you checked.
5. **Write the report** to `.upstream/audit-<YYYY-MM-DD>.md`:

   ```markdown
   # Content audit, <date>, against <pins>

   Drift since the pins: <none | summary from pnpm run sync:status>.
   Judged by: <in-session | N agents>.

   | Page / file | Section or row | Statement (short) | Verdict | Upstream passage (quote or heading) | Suggested action |
   |---|---|---|---|---|---|

   ## Totals
   matches N · drifted N · unsupported N · illustration N · quote-mismatch N
   ```

6. **Report to the user**, briefly: the totals, every drifted and unsupported row, and where the
   report is. Zero drifted and zero unsupported is the acceptance bar for a stage of work or a
   sync; anything else goes to `clpr-sync` (or a hand edit) and the audit runs again on the
   changed sections.

## What a finding looks like

| Page / file | Section or row | Statement | Verdict | Upstream passage | Suggested action |
|---|---|---|---|---|---|
| general | §9 money | "the whole amount goes to whoever submitted the bundle" | matches | design §3.3.3: "the entire amount goes to the account that submitted the bundle" | none |
| developers | §12 endpoints | "the leaf is regenerated after 86 400 seconds by default" | drifted | spec §1.2 now reads `leaf_certificate_validity_seconds` default 43 200 | update the number; cite §1.2 |
| data-ledgers | ledgers[avalanche] | status `mock` | matches | `src/verifiers/evm/avalanche/MockAvalancheVerifier.sol` exists | none |
