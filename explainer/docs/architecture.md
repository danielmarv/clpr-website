# Architecture

How the site is built, from a request for `/` down to the bytes in `dist/`.

## Stack, and why it is this small

- **Astro 7** renders `.astro` and `.mdx` files to static HTML at build time. There is no client
  framework: the only JavaScript shipped is the `<script>` block of each simulation, bundled by
  Astro and loaded only on pages that use that simulation.
- **MDX** (`@astrojs/mdx`) lets the two content files mix prose with components, so a section can
  contain a paragraph, a `<Callout>`, a simulation and a table in the order a reader needs them.
- **No runtime dependencies.** Cryptography in the simulations uses WebCrypto (SHA-256) and a
  self-tested Keccak-256 written in the component. Diagrams are inline SVG. Fonts are system
  fonts. This keeps the pages fast, keeps the supply chain to Astro itself, and keeps every
  simulation readable as a single file.
- **Playwright** is a dev dependency used only by `kse shot` and `kse overflow`.

## The engine

The generic parts (layout, theme, the section, figure, callout, source-line and table-of-contents
components, the pinned-link helpers and every `kse` gate and sync script) live in the
`knowledge-site-engine` package, linked as a dependency. This repository is a "pack": `src/` holds
the content, data, figures and simulations, and `src/data/pack.json` holds the per-site settings
the engine reads (names, the documents whose headings are cited, the link helpers, the retired
vocabulary, the export filenames). Engine components are imported with the `@kse/` alias and the
pack with `@pack/`; the integration in `astro.config.mjs` sets both. Change engine behaviour in the
engine repository, not here.

## Request to page

```
src/pages/index.astro ─┐
                       ├─ Base.astro (layout) ─ Toc, Provenance, theme script, progress script
src/pages/developers.astro ┘        │
                                    └─ <General /> or <Developers /> = the MDX file, rendered to HTML
                                             │
                                             ├─ <Section id page>      looks up title + number in sections.json; renders <ActBand> before an act's first section
                                             ├─ <Figure lead …>        a captioned static drawing (src/components/diagrams/<page>/*)
                                             ├─ <Callout kind>         term / plain / gotcha / spec / impl / open
                                             ├─ <Refs refs>            "Source: …" line with pinned links (developer page only)
                                             ├─ <Check q>              collapsible self-check question
                                             ├─ <Cast>                 the actor cards (plain or spec wording)
                                             └─ <sims/*>               the simulations
```

`Base.astro` receives `sections` and `acts` (from `sections.json`) to build the table of
contents, and `path` to mark the active top-bar link. Each page opens with `<Hero>` (kicker,
title with one italic word, lede, the `<JourneyTrailer>` loop, meta line, one route chip per act). `Base.astro` renders the
provenance table from `sources.json` on every page and injects two small scripts: one that
applies a stored theme and an `html.js` class before first paint, and one that drives the
reading-progress bar, highlights the current TOC entry, ticks off sections already read, and
reveals plates (act bands, figures, simulations, callouts, tables) the first time they scroll
into view. The reveal does nothing under `prefers-reduced-motion`, and without JavaScript the
`.reveal` class is never added, so everything is visible.

## Data files are the source of truth

| File | Owns | Consumed by |
|---|---|---|
| `src/data/sections.json` | Section ids, titles, order and acts for each page; per section the upstream `refs` that back it and an optional `illustration` flag | `Section.astro` (heading, number, the developer page's reference line), `SecRef.astro` (section numbers in prose), `Base.astro`/`Toc.astro` (TOC), `check-provenance.mjs` (order, presence, act pointers), `check-anchors.mjs`, `content-map.mjs` |
| `src/data/catalog.json`, `ledgers.json`, `patterns.json`, `roles.json`, `open.json`, `failures.json`, `cast.json`, `adrs.json` | The facts that change when CLPR changes: components, verifiers per ledger, application patterns, roles and scenarios, flagged open issues, failure cases, the cast, decision records; one row each, every row with `refs` | `Architecture.astro`, `Failures.astro`, `Cast.astro`, `AdrTable.astro`; `check-data.mjs` (shape, inventories against `.upstream/`); `content-map.mjs` |
| `src/data/journey.json` | The 28 steps in both directions: label, title, plain and protocol narration, evidence class, which diagram nodes light up, spec references | `Journey.astro` (renders cards and lists server-side, drives the animation client-side), `check-anchors.mjs` (refs) |
| `src/data/sources.json` | The upstream repositories, their pinned commits and dates, their roles, the paths worth watching | `lib/sources.ts` (all pinned links), `Provenance.astro`, every script under `scripts/` |

Changing a section title, adding a step to the journey, re-pinning a commit, or describing a new
verifier is an edit to one of these files; the pages regenerate from them, and `docs/content-map.md`
is regenerated from their `refs` by `pnpm run content-map`.

## Pinned links

`src/lib/sources.ts` exports four helpers, all reading `sources.json`:

```ts
design('23-trust-model')   // clpr-service.md#23-trust-model at the pinned clpr-spec commit
spec('42-bundle-verification-algorithm')
sol('src/interfaces/IClprApplication.sol', 12)   // optional line number
pinned('clpr-endpoint', 'docs/architecture.md')   // any file in any registered source
```

Nothing in `src/` writes a GitHub URL by hand; `check-provenance.mjs` fails the build if a link
into an LFDT-CLPR repository points at a branch. See [provenance.md](provenance.md).

## Styling

The engine's `styles/global.css` defines the design tokens and the page furniture; components use
only the tokens. This pack then wears the CLPR website's look: `src/styles/site-theme.css`, imported
by `src/layouts/Site.astro`, redefines every token on `html[lang]:root` (the website's ink on paper and dark indigo from its
`globals.css`, Sora for display and prose, IBM Plex Mono for kickers, labels, controls and code, the
website's panel radius) and restyles the chrome; the fonts are self-hosted from `src/assets/fonts/`
(OFL), so nothing is fetched. The theme follows the website's rule: `<html data-theme>` holds the
visitor's choice (`light`, `dark` or `system`), set by the header's Light/Dark/System switch and stored
in `localStorage` under `theme`, the key the website uses, so a choice carries across. No attribute
means light, whatever the system says; a head script in `Site.astro` restores the stored choice before
first paint. The stylesheet turns that into `color-scheme` (light, dark, or `light dark` for system)
and every colour token is a `light-dark(light, dark)` pair, so one declaration serves every case. The
engine's own theme toggle, which treats no attribute as the system's setting, is not rendered. `Site.astro` fills the engine layout's `header` and `footer` slots with
`SiteHeader.astro` and `SiteFooter.astro`, static copies of the website's header and footer. Prose sits
at a 68ch measure; figures, simulations and tables run the full 840px column. The actor colours are
fixed and used identically in every diagram on both pages:

| Token | Actor |
|---|---|
| `--a` | Ledger A / Hiero side |
| `--b` | Ledger B / EVM side |
| `--c` | Endpoints, the sync line |
| `--ok` | Verified, proofs, verifiers |
| `--bad` | Rejected, forged, paused |
| `--money` | Connectors and payment |

SVG diagrams use the `d-*` (fill/stroke) and `t` (text) utility classes so they follow the theme
without per-diagram CSS. Code blocks from MDX fences are highlighted by Shiki with dual themes
and restyled to the site's tokens.

## Build output

`pnpm run build` writes `dist/index.html`, `dist/developers/index.html`, `dist/_astro/*` (one CSS
bundle per page plus one JS chunk per simulation that needs one; small scripts are inlined) and
`dist/favicon.svg`. The `base` option in `astro.config.mjs` is read from `BASE_PATH` so the same
build works at the root of a domain (Netlify) or under `/<repo>/` (GitHub Pages).

## Scripts

All scripts are plain Node ES modules with no dependencies beyond Node and git (and Playwright
for the two screenshot tools). They are documented individually in [testing.md](testing.md) and
[syncing.md](syncing.md).
