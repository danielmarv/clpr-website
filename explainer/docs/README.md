# Documentation

Everything about how this site is built, written, checked and kept current. Start with the
one that matches what you are trying to do.

| If you want to… | Read |
|---|---|
| Understand how the site is put together | [architecture.md](architecture.md) |
| Edit or add content on either page | [content-model.md](content-model.md), then [writing-guide.md](writing-guide.md) |
| Change or add a simulation | [simulations.md](simulations.md) |
| Change or add a figure | [figures.md](figures.md) |
| Know why every link carries a commit hash, and what the checks enforce | [provenance.md](provenance.md) |
| Bring the site up to date after the CLPR repositories change | [syncing.md](syncing.md) (human overview) and [`.claude/skills/clpr-sync/SKILL.md`](../.claude/skills/clpr-sync/SKILL.md) (the step-by-step procedure Claude follows) |
| Find which site section depends on which upstream file | [content-map.md](content-map.md) |
| How the website builds the pages, the standalone preview the gates use, CI, or share a page as one file | [deployment.md](deployment.md) |
| Run the build, the checks and the screenshot tools | [testing.md](testing.md) |
| Know why things are the way they are | [decisions.md](decisions.md) |

Two files outside this folder matter as much: [`CLAUDE.md`](../CLAUDE.md) at the root is the short
rulebook an AI assistant reads before touching the repository, and [`CHANGELOG.md`](../CHANGELOG.md)
records every sync with the upstream commit range it was reviewed against.

## The site in one paragraph

Two static pages, built with Astro and MDX, no UI framework, no runtime dependencies. The
general page (`/`) explains CLPR from nothing in everyday language; the developer page
(`/developers/`) goes to full depth with the specification's own structure. Both are organized
around the same centrepiece, an animated 28-step round trip of one message, and both carry
interactive simulations whose numbers are real (SHA-256 and Keccak-256 are computed in the
browser). Every claim about the protocol is written against pinned commits of the five
LFDT-CLPR repositories, every upstream link carries that commit, and scripts fail the build if
the pages and the pin manifest disagree. A sync procedure re-reads upstream diffs, updates the
affected sections and moves the pins forward.

## Repository layout

```
src/
  content/general.mdx        prose + components for the general page (19 sections)
  content/developers.mdx     prose + components for the developer page (20 sections)
  data/sections.json         the section registry (ids, titles, order) for both pages
  data/journey.json          the 28 steps, both directions, with evidence class and spec refs
  data/sources.json          the provenance manifest: upstream repos and pinned commits
  lib/sources.ts             pinned-link helpers: design(), spec(), sol(), pinned()
  layouts/Base.astro         page chrome: head, TOC, progress bar, theme toggle, footer
  components/                Section, Callout, Check, Refs, SecRef, Toc, Cast, Provenance, the data-driven lists
  components/sims/           the interactive simulations (one .astro file each)
  pages/index.astro          mounts general.mdx
  pages/developers.astro     mounts developers.mdx
  styles/global.css          design tokens (light + dark) and all shared styles
scripts/
  sync-upstream.mjs          fetch upstream repos into .upstream/, write the drift report
  pin-upstream.mjs           move sources.json to the fetched commits
  check-provenance.mjs       pages ↔ manifest consistency, no unpinned links, sections, ids
  check-links.mjs            internal anchors and relative links in dist/
  check-vocab.mjs            no invented names for protocol parts in src/ (writing-guide.md)
  check-data.mjs             data rows carry references; inventories match .upstream/ (provenance.md)
  content-map.mjs            generate docs/content-map.md from the references; --check in CI
  check-orphans.mjs          every component under src/components/ is imported somewhere
  audit-input.mjs            site text beside the upstream passages it cites, for the audit skill
  check-anchors.mjs          every upstream reference exists in .upstream/
  shot.mjs                   screenshot a built page (desktop/phone, light/dark, with clicks)
  overflow.mjs               list elements wider than the viewport at a given width
  export-single.mjs          each page as one self-contained HTML file, for sharing without a deployment
.claude/skills/clpr-drift/   what moved upstream and what it touches (report only)
.claude/skills/clpr-audit/   does every statement still match the passage it cites (report only)
.claude/skills/clpr-sync/    the sync procedure as a Claude skill (the only one that edits)
.github/workflows/           ci.yml, pages.yml, upstream-watch.yml
docs/                        this folder
```
