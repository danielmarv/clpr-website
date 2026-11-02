---
name: clpr-sync
description: Check the LFDT-CLPR repositories (spec, smart contracts, endpoint, governance, org profile) for commits newer than the ones the two CLPR one-pagers were written against, update both pages and the simulations to match, re-pin the commits, run the checks and record the sync. Use when asked to sync, update, refresh or re-pin the CLPR site or one-pagers against upstream, to check whether CLPR has changed, when the upstream-watch issue fires, or when adding a new upstream repository.
---

# clpr-sync: keep the explainer honest against upstream

The site makes hundreds of claims about CLPR, every one written against the exact commits in
`src/data/sources.json`. This skill is the procedure for moving those pins forward without letting
any claim drift. It is deliberately conservative: re-read the upstream text, change only what the
text changed, and never re-pin a repository whose changes you have not reviewed.

## Before you start: be in the repository

Everything below runs from `explainer/` inside the CLPR website repository, which holds the
explainer's source.

- If the current working directory is that repository, `cd explainer` (it has `src/data/sources.json`).
- If not, clone the website repository (or the user's fork of it) and `cd` into `explainer/`. Work
  on a fresh branch named `sync/<YYYY-MM-DD>` so `main` is never edited directly.
- `pnpm install` if `node_modules/` is missing. Node 22 or newer.

What a run produces, in order: a drift report (the `clpr-drift` skill); edits to
`src/content/*.mdx`, `src/data/*.json` and simulations where the upstream text changed; moved pins
in `sources.json`; passing checks (`pnpm run verify`); an audit of the changed sections (the
`clpr-audit` skill) with zero drifted and zero unsupported findings; a `CHANGELOG.md` entry; and,
when asked, one DCO-signed commit and a pull request. If nothing upstream moved, the run ends at
the report. Three skills, one that edits: `clpr-drift` reports what moved, `clpr-audit` reports
whether the site still matches the pins, and only this skill changes files or pins.

## 0. Ground rules

- **Upstream wins.** If the site and the repositories disagree, the site is wrong. Do not "improve"
  the protocol in prose; describe it.
- **Pinned links only.** Use `design()`, `spec()`, `sol()`, `pinned()` from `src/lib/sources.ts`.
  Never write a `blob/main` URL. `pnpm run check` fails on unpinned links.
- **Label the kind of claim.** `<Callout kind="spec">` quotes the text; `kind="impl"` describes the
  reference code and its divergences; `kind="open"` marks what the spec calls unresolved. A
  behaviour you inferred is not a spec claim — say "inferred" or leave it out.
- **Neutral, donation-ready voice.** No marketing, no personal branding, no unsourced numbers.
- **The specification's words are the names.** Endpoint, CLPR Service, outbound queue, message id,
  running hash, trust anchor, endpoint manifest, commit and reveal, ledger, bundle, connector,
  verifier. Explain a term in plain words where it first appears; never substitute a word of your
  own for it (no couriers, post offices, outboxes, fingerprints, signature cards, notebooks). A
  one-time everyday comparison must say it is a comparison and sit on a line marked `vocab-allow`.
  `pnpm run check` runs `kse check-vocab` and fails on anything else; do not add words to
  its allow list to make a sync pass.
- **DCO.** Every commit is `git commit -s`. Use one commit per sync with the message format in
  step 7, on a `sync/<date>` branch, and open a pull request rather than pushing to `main` unless
  the user says otherwise.
- **Never pin blind.** Re-pinning a repository is a claim that the site text matches that commit.
  Pin only what you reviewed in step 3.

## 1. Fetch and read the drift report

Run the `clpr-drift` skill first: it fetches, reads every patch and the new text, maps each change
to the site through the generated content map and the data inventory check, and writes
`.upstream/drift-<date>.md` with a content-affecting verdict per change. The rest of this step is
what that skill does under the hood, for when you need the raw material:

```bash
pnpm exec kse sync-upstream
```

This clones or fetches each repository into `.upstream/<id>/`, prints and writes
`.upstream/report.md`, and writes one patch per moved repository, restricted to that source's
`watch` paths, at `.upstream/diffs/<id>.patch`. If the report says nothing moved, stop: tell the
user the pins are current (and the date of `lastSynced`).

For each moved repository, read:

1. `.upstream/report.md` — which commits, which watched files.
2. `.upstream/diffs/<id>.patch` — the actual change to watched files.
3. The **new full text** of every changed file in `.upstream/<id>/…`, not just the patch. A patch
   can hide a renumbered section or a moved paragraph that changes what a site sentence means.
4. `git -C .upstream/<id> log --stat <pinned>..origin/<branch>` if the patch is empty but files
   outside the watch list changed: decide whether the watch list in `sources.json` is too narrow
   (for example a new `docs/` folder appeared) and widen it if so.

Classify each changed file:

| Change | Treat as |
|---|---|
| Spec text, ADRs, verifier docs, options doc, org profile README, charter, teams.yml | **Content-affecting.** Go through step 2. |
| Solidity interfaces (`src/interfaces/*.sol`), `ClprTypes.sol` enums, `docs/*.md` in the contracts repo, endpoint README / config example | **Content-affecting** for the developer page and the `impl` callouts. |
| Tests, CI workflows, build files, formatting-only diffs, dependency bumps | Not content-affecting. Note them in the changelog entry only. |

## 2. Find every site location the change touches

Open `docs/content-map.md`. It is generated from the `refs` in `src/data/sections.json`, the rows of
the other data files, `journey.json` and the pinned-link calls in components (`pnpm run content-map`;
never edit it by hand, `pnpm run check` fails while it is stale). For each changed upstream heading
or file it lists the site locations: sections of `src/content/general.mdx` and
`src/content/developers.mdx`, data rows under `src/data/`, journey steps, and the components that
link to it directly.

Then search the site for direct references, because the map is a guide, not a proof:

```bash
grep -rn "<anchor-or-term>" src/content src/data src/components
```

Anchors are the GitHub heading slugs (e.g. `'328-response-ordering-and-correlation'`). If a heading
was renamed or renumbered upstream, every reference to it must change; step 5 catches the ones you
miss.

## 3. Re-verify and update the affected text

For each affected location, re-read the site text **next to the new upstream text** and ask:

- Does the site still say what the spec says? Fix wording, numbers, field names, step order.
- Did the spec add, remove or rename something (a field, a status, a criterion, a step, an ADR)?
  Add or remove it on the site. Tables (throttles, progress criteria, slashing, recovery, ADRs)
  must match the upstream tables row for row.
- Did the change resolve something the site marks as an open question, or open a new one? Update
  the `kind="open"` callouts and the "What CLPR does not do" section on the general page.
- Did a reference implementation divergence listed in an `impl` callout get fixed upstream?
  Remove it. Did a new one appear in `docs/bundle-flow.md` / `docs/quirks.md`? Add it.
- Do the **simulations** still model the behaviour? A sim's `Source:` links passing the anchor
  check does not mean its logic is right. Read the sim's script against the changed section. The
  ones most likely to be affected: `BundleVerify.astro` (§4.2 steps and criteria), `Ordering.astro`
  (§4.5), `ChannelLife.astro` (§2.1.1 transitions), `SyncCycle.astro` (§1.5 fields),
  `CommitReveal.astro` (§5.1, §6.3), `TrustAnchor.astro` (§3.1.5, §3.2, verifier docs),
  `Money.astro` (§4.6 formula and statuses), `Failures.astro` (§5 table), `RunningHash.astro`
  (§4.1 formula), `Journey.astro` + `journey.json` (the whole round trip, both directions),
  `Architecture.astro` (what each repository contains and where).
- `src/data/journey.json`: check each step whose `refs` point at a changed section; the `plain`
  and `protocol` texts must both stay true. Do not renumber steps unless the protocol changed the
  sequence — the general page's prose refers to step numbers.
- The data files under `src/data/` (`catalog.json`, `ledgers.json`, `patterns.json`, `roles.json`,
  `open.json`, `failures.json`, `cast.json`, `adrs.json`): each row's `refs` say which upstream
  passage it rests on; re-read every row whose ref points into a changed section and fix its text.
  `node checks/check-data.mjs` compares the inventories with `.upstream/`; its failures are the
  list of new upstream things to add as rows (a verifier directory, an ADR, an application pattern,
  a role, a flagged `‼️` passage). After any change to a `refs` entry, run `pnpm run content-map`.

Keep the register of each page: the general page explains from nothing, in short plain sentences,
using the specification's terms and explaining each where it first appears; the developer page is
precise and cites sections. If a new concept appears upstream, use the specification's name for
it on both pages, explain it in plain words on the general page, and add a glossary term if
needed. Do not coin a friendlier name for it.

If something in the new upstream text is ambiguous or self-contradictory, do not guess. Describe
the ambiguity as such (the developer page already does this for several items) and mention it in
the changelog entry so a maintainer can raise it upstream.

## 4. Add or change sections only through the registry

Section titles and order live in `src/data/sections.json`; `<Section id page>` looks them up and
the TOC is generated from them. To add a section, add it to the JSON and add a matching
`<Section id="…" page="…">` block in the MDX at the same position. `pnpm run check` fails if the two
disagree, and if any element id is duplicated (sim ids end in `-sim` or `-dev` for that reason).

## 5. Re-pin, rebuild, check, look

```bash
pnpm exec kse pin-upstream            # or: pnpm exec kse pin-upstream clpr-spec governance
pnpm run verify                           # build, then every gate: provenance, links, vocabulary, data rows,
                                         # content map, anchors, browser, dark-theme sims, overflow at 400px
```

Only pin repositories whose changes you reviewed. `pin-upstream.mjs` also sets `lastSynced` to
today; the provenance table on both pages regenerates from the manifest at build time.

Then run the `clpr-audit` skill on the sections and data rows you changed (all of them after a
large sync): `pnpm exec kse audit-input` pairs each section's text with the passages its refs
cite at the new pins, and the skill judges every statement. The bar before the changelog entry is
zero drifted and zero unsupported findings; an `illustration` verdict is only acceptable inside a
section flagged `illustration: true` in `sections.json`.

Then look at what you changed, in both themes and at phone width:

```bash
pnpm exec kse shot / screenshots/general.png 1280 true
pnpm exec kse shot /developers/ screenshots/developers.png 1280 true
pnpm exec kse shot /developers/ screenshots/developers-phone.png 400 true
# a sim mid-way through, e.g. six Next clicks:
pnpm exec kse shot /developers/ screenshots/verify.png 1280 false '#bundle-verify [data-role="next"]|#bundle-verify [data-role="next"]|#bundle-verify [data-role="next"]'
```

Open the PNGs with the Read tool and check the sections you edited. The screenshot script reports
console and page errors; there must be none. Delete the screenshots afterwards (the folder is
git-ignored anyway).

## 6. Record the sync

Append an entry to `CHANGELOG.md` at the top, in this shape:

```markdown
## 2026-10-14 — sync

Upstream: clpr-spec 945082d → 1a2b3c4 (3 commits), governance 498d4f4 → 9f8e7d6 (1 commit).

- Spec §3.2.4 added a sixth bundle progress criterion → developers §8 table, `BundleVerify.astro` step 1a, `journey.json` step 14.
- ADR 2026-10-02 (title) → developers §18 ADR table; endpoints callout.
- governance/teams.yml: new maintainer → general §18, developers §19, `Architecture.astro` lab card.
- Not content-affecting: CI workflow changes in clpr-smart-contracts.
- Ambiguities to raise upstream: (list, or "none").
```

## 7. Commit and open a pull request

```bash
git checkout -b sync/$(date +%F)          # if not already on a sync branch
git add -A
git commit -s -m "sync: clpr-spec@1a2b3c4, governance@9f8e7d6" -m "<the changelog bullets>"
git push -u origin HEAD
gh pr create --fill --body-file .upstream/report.md    # or describe the branch to the user if gh is unavailable
```

Put the drift report and the changelog bullets in the PR description so the reviewer sees what
upstream changed and what the site changed in response. Never commit `.upstream/`, `dist/`,
`screenshots/` (all git-ignored). If the user explicitly wants `main` updated directly, commit
on `main` and push; otherwise leave the merge to a human.

## 8. Report back

Tell the user, briefly: which repositories moved and by how many commits; which site sections,
journey steps and simulations changed and why; which pins moved; that the checks passed; any
upstream ambiguities worth raising; and where the branch or PR is. If nothing moved, say so with
the `lastSynced` date.

## Adding a new upstream repository

1. Get its default branch and head: `git ls-remote https://github.com/LFDT-CLPR/<repo> HEAD`.
2. Add an entry to `src/data/sources.json` — `id` (kebab-case, used in `pinned('<id>', path)`),
   `repo`, `branch`, `commit` (full 40-hex), `committedAt` (ISO), `role` (one sentence: what on the
   site relies on it), `watch` (paths whose changes matter to the site).
3. `pnpm exec kse sync-upstream` to clone it. Read it.
4. Decide where the site should cite it: add a `catalog.json` row (the data check requires every
   source to be cited by a component), add `refs` to the sections and data rows that use it, then
   write or update the sections, using `pinned('<id>', 'path/in/repo')` for links, and run
   `pnpm run content-map`. Add it to the repository table in
   general §18 ("Where CLPR lives"), to the `Architecture.astro` map if it is a component of the system, and, if it is an implementation, to developers §17.
5. `pnpm test` and `pnpm exec kse check-anchors`. The provenance table picks the new repository
   up automatically. Add a changelog entry and commit as in steps 6–7.

## Removing or renaming a repository

Remove or edit the entry in `sources.json`, fix every `pinned('<old-id>', …)` reference (the
provenance, anchor and data checks will list them), run `pnpm run content-map`, and note it in the
changelog.
