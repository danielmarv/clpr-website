---
name: clpr-drift
description: Explain what changed in the LFDT-CLPR repositories since the commits the site is pinned to, in plain words, with the site sections, data rows and components each change touches and whether it is content-affecting. Report only; never edits or re-pins. Use when asked what changed upstream, whether the CLPR site is out of date, to triage the upstream-watch issue, or before deciding whether to run a sync.
---

# clpr-drift: what moved upstream, and what it touches here

The weekly `upstream-watch` workflow says *that* something moved. This skill says *what*, in the
words a maintainer reads before deciding to spend a sync on it. It never edits the site and never
moves a pin; `clpr-sync` does both, and starts by running this.

## Procedure

1. **Fetch and compare.** `pnpm run sync:status` clones or fetches each repository into
   `.upstream/<id>/`, prints the drift report, writes `.upstream/report.md`, and writes one patch
   per moved repository, restricted to the source's `watch` paths, at `.upstream/diffs/<id>.patch`.
   If nothing moved, tell the user the pins are current (with `lastSynced` from
   `src/data/sources.json`) and stop.
2. **Read every patch, then the new text.** A patch shows the edit; the new file shows what the
   edit means (a renumbered heading, a moved paragraph, a changed default). Read the changed
   headings in full in `.upstream/<id>/…`.
3. **Map each change to the site.** `docs/content-map.md` is generated from every reference the
   site holds: find the changed heading or file on its left side and take the locations on the
   right (`general §id`, `dev §id`, `file.json key[row]`, `journey step N`, component names). Then
   run `node checks/check-data.mjs` against the fetched tree: its inventory failures are new
   upstream things with no row yet (a verifier directory, an ADR, a pattern, a role, a flagged
   passage), which the map cannot know about.
4. **Classify.** Content-affecting: text, tables, defaults, field names, step order, statuses,
   ADRs, verifier documents, interface changes, the organization profile, `teams.yml`. Not
   content-affecting: tests, CI, build files, formatting, dependency bumps. Watch for the quiet
   ones: a renumbered heading changes anchors; a resolved `‼️` passage changes `open.json`.
5. **Write the report** to `.upstream/drift-<YYYY-MM-DD>.md`:

   ```markdown
   # Upstream drift, <date>

   Pins: <id@short …>. Heads: <id@short …>. Commits since the pins: <n per repository>.

   | Repository | Change (plain words, 1 to 3 sentences) | Upstream file / heading | Site locations | Content-affecting | Suggested action |
   |---|---|---|---|---|---|

   New upstream things with no row yet (from check-data): <list or none>.
   Not content-affecting: <one line>.
   ```

6. **Report to the user**: how many commits per repository, the content-affecting changes in one
   sentence each with the site locations, and a recommendation: run `clpr-sync` now, or leave the
   pins. Never say the site is wrong because of a change you have not read.

## Ground rules

- For each touched section, say whether it holds volatile detail (field numbers, layouts, addresses,
  ports, formulas) or a `detail-allow` exception (`node explainer/checks/check-detail.mjs --list`), and
  recommend deleting that detail instead of updating it.

- Never edit `src/`, `docs/` or `src/data/sources.json`; never run `pnpm run sync:pin`.
- Describe the change, not the code: a maintainer wants "the default leaf validity dropped from a
  day to twelve hours", not a diff hunk.
- Say what you did not read. A patch restricted to the watch paths can miss a new folder; if
  `git -C .upstream/<id> log --stat <pinned>..origin/<branch>` shows files outside the watch list,
  say so and suggest widening `watch` in `sources.json` during the sync.
