# Keeping the site in sync with upstream

The CLPR repositories move; the site must follow without any claim drifting. This page is the
human overview. The step-by-step procedure that an AI assistant follows is the
[`clpr-sync` skill](../.claude/skills/clpr-sync/SKILL.md); the two agree, and the skill is the
more detailed of the two. Two report-only skills sit beside it: [`clpr-drift`](../.claude/skills/clpr-drift/SKILL.md)
explains what moved upstream and what it touches, and [`clpr-audit`](../.claude/skills/clpr-audit/SKILL.md)
judges whether every statement on the site still matches the passage it cites. Only `clpr-sync` edits or re-pins.

## The loop

```
   upstream moves ──▶ 1. detect ──▶ 2. fetch + report ──▶ 3. review + edit ──▶ 4. re-pin ──▶ 5. check + look ──▶ 6. record + commit
```

### 1. Detect

Three ways to learn that a pinned repository has moved:

- **Weekly, automatically.** `.github/workflows/upstream-watch.yml` runs every Monday, compares
  the pins with each repository's head, and opens (or updates) an issue labelled `upstream-sync`
  containing the drift report. It never edits content.
- **On demand.** `pnpm run sync:fetch` prints the same report locally.
- **By hand.** Watching the LFDT-CLPR organization on GitHub.

### 2. Fetch and report

```bash
pnpm run sync:fetch        # = pnpm exec kse sync-upstream
```

Clones or fetches each repository in `sources.json` into `.upstream/<id>/` (git-ignored), then
writes `.upstream/report.md` and, for every repository that moved, `.upstream/diffs/<id>.patch`
restricted to that source's `watch` paths. The report lists the new commits and the changed
watched files. Options: `--report-only` (print to stdout, for CI), `--json`, `--no-fetch`
(reuse what is in `.upstream/`).

If the report says every pin matches `HEAD`, there is nothing to do.

### 3. Review and edit

This is the judgement step, and it is the reason the loop is not fully automated. For each
changed upstream file:

1. Open [content-map.md](content-map.md) (generated from the references in `src/data/`; never edited by hand) and find every site location that depends on it:
   sections of the two MDX files, `journey.json` steps, `Cast.astro` definitions, simulations.
2. Read the **new full text** upstream (in `.upstream/<id>/…`), not only the patch. Renumbered
   sections and moved paragraphs change what a sentence means without appearing in a small diff.
3. Re-read each dependent site location next to the new text and change only what the text
   changed: wording, numbers, field names, step order, table rows, open questions that got
   resolved, implementation divergences that got fixed or appeared.
4. Check the simulations that model the changed behaviour. The anchor check only proves their
   citations still exist; whether their logic still matches is a reading task.
5. If the change is a new concept, add it to both pages in their own registers (see
   [writing-guide.md](writing-guide.md)) and to the glossary.
6. If the upstream text is ambiguous or two upstream documents disagree, describe that rather
   than guessing, and note it for the changelog so someone can raise it upstream.

Changes that are not content-affecting (tests, CI, formatting, dependency bumps) need no edit;
mention them in the changelog entry.

### 4. Re-pin

```bash
pnpm run sync:pin                       # all sources
pnpm exec kse pin-upstream clpr-spec governance   # only the ones you reviewed
```

Moves `commit` and `committedAt` in `sources.json` to the fetched heads and sets `lastSynced` to
today. Pin only what you reviewed: a pin is a claim that the text matches that commit.

### 5. Check and look

```bash
pnpm test                               # build + provenance + links
pnpm exec kse check-anchors         # every upstream reference still resolves
pnpm exec kse shot / out.png 1280 true
pnpm exec kse overflow /developers/ 400
```

Open the screenshots of the sections you edited in light and dark and at phone width.
[testing.md](testing.md) has the details.

### 6. Record and commit

Add an entry at the top of `CHANGELOG.md` with the upstream commit ranges and the sections
touched, then one DCO-signed commit:

```bash
git commit -s -m "sync: clpr-spec@1a2b3c4, governance@9f8e7d6" -m "<the changelog bullets>"
```

Open a pull request rather than pushing to `main` directly when someone else can review; the
drift report and the changelog entry make a good PR description.

The website builds the pages from this directory on every deploy (`pnpm build` at the repository
root, see [deployment.md](deployment.md)), so nothing is copied by hand after a sync.

## Adding a repository

1. `git ls-remote https://github.com/LFDT-CLPR/<repo> HEAD` for the current commit.
2. Add an entry to `sources.json` (`id`, `repo`, `branch`, full `commit`, `committedAt`, `role`,
   `watch`).
3. `pnpm run sync:fetch` to clone it; read it.
4. Decide where the site should cite it; add `refs` to the sections and data rows that use it and regenerate [content-map.md](content-map.md) with `pnpm run content-map`; write or
   update the sections using `pinned('<id>', 'path')`; add it to the repository table in the
   general page's lab section and, if it is a component of the system, to the `Architecture.astro`
   map.
5. `pnpm test`, `pnpm exec kse check-anchors`, changelog, commit.

The provenance table on both pages picks the new repository up automatically.

## Scheduling it

The weekly workflow only detects. If you want the review itself to happen on a schedule, run the
`clpr-sync` skill from a scheduled Claude session with the repository attached and have it open a
pull request; keep a human on the merge button, because step 3 is where meaning lives.

## Other commits

See the README section "Building against other commits" and the engine's `docs/building-at-any-commit.md`. The audit procedure (`kse audit-input` plus the audit skill) is unchanged.
