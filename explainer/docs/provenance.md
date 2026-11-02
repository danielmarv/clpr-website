# Provenance

Why every upstream link carries a commit hash, what `sources.json` holds, and what the checks
enforce.

## The problem being solved

The site makes several hundred claims about a protocol whose specification is explicitly still
changing ("will likely go through a couple more changes"). A claim that was true in August can
be false in October. Linking to `main` would let the text and its evidence drift apart silently.
So the site never links to a branch: every claim is written against a specific commit of a
specific repository, the commit is recorded in one manifest, every link embeds it, and the build
fails if the pages and the manifest disagree.

## The manifest: `src/data/sources.json`

```json
{
  "org": { "name": "LFDT-CLPR", "url": "https://github.com/LFDT-CLPR", "lab": "…", "labUrl": "…" },
  "lastSynced": "2026-09-30",
  "sources": [
    {
      "id": "clpr-spec",
      "repo": "https://github.com/LFDT-CLPR/clpr-spec",
      "branch": "main",
      "commit": "945082d69e65dd0fd9e9bdf8d59cb8121579f6fd",
      "committedAt": "2026-08-31T11:59:29-05:00",
      "role": "Protocol specification …",
      "watch": ["clpr-service.md", "clpr-service-spec.md", "ADR/", "verifiers/", "…"]
    }
  ]
}
```

| Field | Meaning |
|---|---|
| `id` | Short handle used in `pinned('<id>', path)` and in scripts |
| `repo`, `branch` | Where to fetch; the branch is only used to find the current head |
| `commit` | The full SHA the site's text was checked against. **Never edit by hand**; `kse pin-upstream` moves it |
| `committedAt` | The commit's date, shown in the provenance table |
| `role` | One sentence shown in the provenance table: what on the site relies on this repository |
| `watch` | Paths whose changes matter to the site; the drift report restricts its patches to these |
| `lastSynced` | The date the pins were last moved; shown on both pages |

The five sources at the initial release: `clpr-spec`, `clpr-smart-contracts`, `clpr-endpoint`,
`governance`, `org-profile` (the organization's `.github` repository).

## How links are built

`src/lib/sources.ts` turns the manifest into URLs:

| Helper | Produces |
|---|---|
| `design(anchor)` | `…/clpr-spec/blob/<commit>/clpr-service.md#<anchor>` |
| `spec(anchor)` | `…/clpr-spec/blob/<commit>/clpr-service-spec.md#<anchor>` |
| `sol(path, line?)` | `…/clpr-smart-contracts/blob/<commit>/<path>#L<line>` |
| `pinned(id, path?, anchor?)` | any file in any source at its commit; with no path, the repository tree at the commit |
| `short(id)` | the seven-character commit for display |

Anchors are GitHub heading slugs: lower-case, punctuation removed, each space becomes a hyphen
(so `3.3 Payment & Routing Layer` is `33-payment--routing-layer`, with two hyphens).

## What the checks enforce

`pnpm run check` runs after every build (locally via `pnpm test`, and in both workflows):

**`kse check-provenance`**
- every source has a 40-hex `commit` and a parseable `committedAt`; `lastSynced` is a date;
- both built pages contain every source's short commit in the provenance table;
- no link into an LFDT-CLPR repository uses `blob/main`, `tree/main`, `raw/main` or `master`;
- the sections in each built page match `sections.json` exactly, in order;
- no element id appears twice on a page (this catches a sim id colliding with a section id).

**`kse check-links`**
- every `href="#…"` resolves to an id on the same page;
- every relative or root-relative link resolves to a file in `dist/` (root-relative links carry the
  `BASE_PATH` prefix when the site is built under one, as for GitHub Pages; the checker strips it);
- external links are counted, not fetched.

**`kse check-anchors`** (run explicitly; needs `.upstream/` from a sync fetch)
- every `design('…')` / `spec('…')` call, every ref in `sections.json`, the data files and `journey.json`, exists as a
  heading in the pinned spec documents;
- every `pinned(id, path)` and `sol(path)` points at a file that exists upstream.

It scans `src/` only, so documentation can show examples without tripping it.

**`kse check-vocab`**
- no file under `src/` uses a word the site once invented for a protocol part (courier, post
  office, outbox, ticket number, fingerprint, signature card, address book, sealed envelope,
  notebook); the specification's terms are the names, explained in plain words at first use
  ([writing-guide.md](writing-guide.md));
- a line carrying, or directly following, a `vocab-allow` marker is exempt; that is reserved for a
  one-time comparison that says it is a comparison.

**`checks/check-data.mjs`**
- every section in `sections.json` and every row in the other `src/data/*.json` files has at least
  one `refs` entry, with keys in the order `doc, anchor, label` or `doc, id, path, label` (the
  anchor check matches them textually), and every `repo` ref names a source id in `sources.json`;
- every source id is cited by at least one component in `catalog.json`, and every component has a
  place on the Architecture map;
- with `.upstream/` present: every verifier directory upstream (`clpr-spec/verifiers/*`,
  `clpr-smart-contracts/src/verifiers/**` except `common`) is a row in `ledgers.json`; every
  `ADR/*.md` is a row in `adrs.json`; the sub-headings of design §3.4 and the headings of §4.1 to
  §4.7 match the rows of `patterns.json` and `roles.json`; the `‼️` passages of the design document
  match the flagged rows of `open.json`. A failure here is the list of new upstream things the site
  has not described yet.

**`kse check-orphans`**
- every component under `src/components/` is imported by a page, a content file or another component, so a figure or simulation nobody renders cannot linger in the anchor check and the content map.

**`kse content-map --check`**
- `docs/content-map.md` is byte-identical to what the generator produces from the refs above, the
  journey steps and the pinned-link calls in components. Regenerate with `pnpm run content-map`.

## Reading a failure

| Message | Likely cause | Fix |
|---|---|---|
| `provenance table does not show clpr-spec@…` | `dist/` is stale | `pnpm run build` first |
| `unpinned upstream link …/blob/main/…` | a hand-written URL in MDX or a sim | use `design()`/`spec()`/`sol()`/`pinned()` |
| `sections […] do not match sections.json` | a section was added to one place only, or reordered | make the JSON and the MDX agree |
| `duplicate element id "money"` | a sim rendered with the same id as a section or another sim | pass `id="money-dev"` |
| `design anchor #… not found` | the upstream heading was renamed or renumbered, or the slug is wrong | find the new heading in `.upstream/clpr-spec/…` and update every reference |
| `clpr-endpoint/docs/foo.md does not exist upstream` | the file moved | update the `pinned()` path |

## What provenance does not prove

Pinning proves that a link points at the text the author read. It does not prove the sentence
next to the link is a correct reading of it. That is what the sync procedure's review step, the
labelling rules in [content-model.md](content-model.md), and human reviewers are for.
