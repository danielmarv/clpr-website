---
name: clpr-audit
description: Use when asked to audit, verify, fact-check or validate what this repository says about CLPR (the website's landing page, its drawings and animations, the plumbing explainer, the repository's documents) against the pinned upstream commits and the current status of things that change outside them; after a sync, before a release or a pull request, or whenever accuracy is in doubt. Report only; never edits.
---

# clpr-audit: is everything here saying what upstream says?

The gates prove that every reference resolves. They cannot prove that a sentence, a label or a
drawing still says what its source says. This skill does, for every surface of the repository,
and never edits: its output is a report the maintainer or the `clpr-sync` skill acts on.

## Surfaces: every audit covers all six

| Surface | Where | Judged against | Input |
|---|---|---|---|
| Explainer sections and data rows, with their figures and simulations | `explainer/src/content/*.mdx`, `explainer/src/data/*.json` | each section's or row's `refs` | `kse audit-input` |
| Explainer journey, titles, act text, pack text and page chrome | `journey.json`, `sections.json`, `pack.json`, `SiteHeader`, `SiteFooter`, `Repos`, pages | the steps' refs; design §1 and §2.3 | `repo-input.mjs` |
| Website copy | `src/content/site.ts`, one input per export | `src/content/site-refs.json` | `repo-input.mjs` |
| Website drawings and animations | hero, story phases, walkthrough steps, comparison tabs, onboarding steps, every section | the passages of the block that feeds them | `website-shots.mjs` |
| Text in components and the repository's documents | `src/components`, `src/app`, `README.md`, `AGENTS.md`, `CONTRIBUTING.md`, the explainer's README, CLAUDE.md and docs | design §1, org profile | `repo-input.mjs` |
| Live facts | implementation status, releases, licences, lab status | the checks under `live` in `site-refs.json` | `repo-input.mjs --live` |

## Ground rules

- **Report only.** No tracked file changes. The output is `explainer/.upstream/audit-<date>.md`
  (git-ignored) and a summary to the user.
- **The refs are the contract.** A block is judged against the passages its refs point at. If a
  statement needs a passage the refs do not include, that is a finding (unsupported). A `site.ts`
  export with no entry in `site-refs.json` is judged unsupported and `repo-input.mjs` exits 1.
- **Pinned commits for upstream repositories; live checks for the rest.** `.upstream/` holds the
  repositories at the commits in `explainer/src/data/sources.json`. If `pnpm run sync:status`
  reports drift, note it in the header and still audit against the pins. Implementation status,
  releases and licences change outside the pins: run each `live` check and date its result.
- **Flagged sections are different.** A section with `illustration: true` may carry the site's
  own illustrations; an unbacked statement there is `illustration`, not `unsupported`.
- **Known overstatements.** `explainer/docs/writing-guide.md` ("Things not to claim") lists the
  claims this protocol invites and upstream does not support: nothing in between, immutable
  verifiers, zero custody, latency bounds, endpoints as trustless, native Hiero status. Judge
  every surface against that list. The `retiredVocab` patterns in `pack.json` flag some of them
  mechanically; both input steps list the hits.

## Procedure

1. **Prepare.** In `explainer/`: `pnpm run sync:fetch` if `.upstream/` is missing, then
   `pnpm exec kse audit-input`. At the repository root:
   `node .claude/skills/clpr-audit/repo-input.mjs --live` (after `kse audit-input`, because it
   adds its files to `_GROUPS.json`). With the website built and served (`pnpm build && pnpm start`):
   `node .claude/skills/clpr-audit/website-shots.mjs`. The engine's `_BRIEF.md` says "the
   site-audit skill"; that means this one.
2. **Judge, one file at a time.** For each statement record a verdict:
   - `matches`: entailed by a passage (paraphrase is fine; numbers, names, field names,
     orderings and conditions must agree).
   - `drifted`: contradicts a passage, or a live check, or says what upstream used to say.
   - `unsupported`: nothing backs it and the section is not flagged.
   - `illustration`: unbacked in a flagged section; report it only if it misleads.
   - `quote-mismatch`: quoted text that is not verbatim upstream.
   - `overstatement`: an absolute ("nothing", "never", "only", "anyone", "every") wider than the
     passage. Name what upstream says CLPR does trust.

   For each `website-*.md`, open that block's screenshots and judge what the drawing shows as
   well as what it says: a label, an arrow or an empty middle is a claim. Groups are in
   `_GROUPS.json`; one agent per group with `_BRIEF.md` fans out well. If agents stall, judge
   in-session and say so in the report.
3. **Check the other direction for data tables.** Does upstream list something the rows do not?
   `node checks/check-data.mjs` catches the countable cases.
4. **Verify what is not `matches`.** Re-read each finding against the full upstream file, not only
   the extract, and drop it if the file backs the statement.
5. **Write the report** to `explainer/.upstream/audit-<YYYY-MM-DD>.md`, or `-2`, `-3` … if that
   file exists (it is git-ignored, so an overwrite cannot be recovered):

   ```markdown
   # Content audit, <date>, against <pins>

   Drift since the pins: <none | summary>. Live checks run: <date, one line per fact>.
   Judged by: <in-session | N agents>.

   | Surface | Files judged | Findings |
   |---|---|---|
   (one row per surface above; a surface with zero files judged is a failed audit)

   | Location | Statement (short) | Verdict | Upstream passage or live result | Suggested action |
   |---|---|---|---|---|
   ```

6. **Report to the user**: the coverage table, every finding that is not `matches`, and where the
   report is. Zero drifted, unsupported and overstatement findings is the bar for a release or a
   sync; anything else goes to `clpr-sync` or a hand edit, and the audit runs again on what changed.

## What the inputs do not reach

- Website text that is not in `site.ts`: the component scan reads single-line JSX text and quoted
  labels only. Copy belongs in `site.ts`; move any you find there.
- Phone layouts: the screenshots are at desktop width. Open the page at 400px for any drawing whose
  labels change with width.
- Left out on purpose: `explainer/docs/content-map.md` (generated), `explainer/CHANGELOG.md`
  (history) and `design-v1-backup.tgz` (an archive the site does not serve).

## What a finding looks like

| Location | Statement | Verdict | Upstream | Suggested action |
|---|---|---|---|---|
| website `hero.title` | "Cross-ledger messaging with nothing in between." | overstatement | design §2.3: availability depends on at least one honest endpoint per side | "no bridge to trust"; say endpoints can delay, not forge |
| website `repositories` hiero card | "pending approval by the Hiero TSC" | drifted | live: PR #27029 merged 2026-09-22; v0.78.1 ships it, off by default | update the card and the pill |
| website comparison, custody drawing | empty middle labelled "Nothing held" | drifted | design §3.1.0: the CLPR Service is custodian of Connector funds and endpoint bonds | "No pooled assets" |
| explainer `cast.json` verifier | "An immutable contract" | drifted | design §3.1.5: the verifier may sit behind an upgradeable proxy | address fixed for the Channel's lifetime |
| developers §12 endpoints | "the leaf is regenerated after 86 400 seconds by default" | matches | design §3.1.2: `leaf_certificate_validity_seconds`, default 86400 | none |
