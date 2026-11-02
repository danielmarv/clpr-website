# The plumbing of CLPR — project notes for Claude

Two one-page explainers of CLPR (the bridgeless Cross Ledger Protocol, an LF Decentralized
Trust lab), built with Astro 7 + MDX, no UI framework, no runtime dependencies. The long-form
documentation is in `docs/` (start at `docs/README.md`); this file is the short rulebook. Generic components, layout and every gate script come from the `knowledge-site-engine` package (`@kse/` imports, `pnpm exec kse <command>`); per-site settings are in `src/data/pack.json`. This directory lives inside the CLPR website repository: the website's `pnpm build` runs `embed.mjs` to build it into `public/plumbing/`, and every command below runs from `explainer/`.

- `/` — for everyone. `src/content/general.mdx`, rendered by `src/pages/index.astro`.
- `/developers/` — for developers. `src/content/developers.mdx`, rendered by `src/pages/developers.astro`.

## Ground rules

1. **Spec-faithful, pinned.** Every protocol claim is written against the commits in
   `src/data/sources.json`. Link upstream files through `src/lib/sources.ts` (`design()`,
   `spec()`, `sol()`, `pinned()`) so links stay pinned. Never link to `main`.
2. **Every claim is backed by a reference, and the reference lives in data.** Each section in
   `src/data/sections.json` and each row in the other `src/data/*.json` files carries `refs`
   (design or spec heading anchors, or a pinned file path) in the shape `check-anchors.mjs`
   resolves. The developer page renders a section's refs under its heading; the general page
   cites its sources once, in the provenance footer. Prose does not attribute ("the specification
   says"); it states. `kind="impl"` callouts describe what the reference implementation does
   (which sometimes diverges — see `clpr-smart-contracts/docs/bundle-flow.md`); `kind="open"`
   marks what upstream calls unresolved. Do not present inferred behaviour as protocol behaviour.
3. **Neutral voice, donation-ready.** No personal branding, no marketing claims, no numbers
   without a source. Apache-2.0 code, CC BY 4.0 text, DCO sign-off on every commit
   (`git commit -s`).
4. **The website's theme, phone width.** The pages wear the CLPR website's dark theme: `src/styles/site-theme.css`
   redefines the engine's tokens (`styles/global.css`) and `Site.astro` supplies the website's header and footer;
   never hard-code a colour or font. Everything must render at 400px wide. Wide drawings go inside `<Figure>`,
   whose frame scrolls on phones.
5. **Sections are registered.** `src/data/sections.json` is the single list of sections per
   page; `<Section id page>` looks its title and number up there and the TOC is built from it.
   The same file lists the acts (groups of sections); `Section.astro` renders the act band before
   the first section of each act, so the MDX never mentions acts. Prose never carries a section
   number: `<SecRef id="…" />` prints it from the registry.
6. **The specification's words are the names.** Endpoint, CLPR Service, outbound queue, message
   id, running hash, trust anchor, endpoint manifest, commit and reveal, ledger, bundle,
   connector, verifier. Explain each in plain words at first use; never rename it (no couriers,
   post offices, outboxes, fingerprints, signature cards, notebooks). An everyday comparison may
   appear once, introduced as a comparison, on a line marked `vocab-allow`. `pnpm run check` runs
   `kse check-vocab`, which fails on anything else.
7. **Upstream facts live in data rows.** The components, ledgers and verifiers, application
   patterns, roles and scenarios, open issues, failure cases, cast and ADRs are rows in
   `src/data/*.json`, each with `refs`; `checks/check-data.mjs` validates them and, with
   `.upstream/` present, fails when upstream has a verifier directory, ADR or heading the data
   does not. `docs/content-map.md` is generated from those refs (`pnpm run content-map`); never
   edit it by hand.
8. **Figures are components.** A static drawing lives in `src/components/diagrams/<page>/` inside
   `<Figure lead caption source kind>` and is placed in the MDX after the paragraph it
   illustrates; conventions in `docs/figures.md`. Simulations never scroll the window (use
   `scrollListTo` from `@kse/lib/scroll` for a list) and never rely on the `hidden` attribute
   inside SVG without the global `svg [hidden]` rule.

## Simulation components (`src/components/sims/*.astro`)

Conventions every sim follows — copy `ChannelLife.astro` or `RunningHash.astro` as a template:

- Outer element `<div class="sim <name>" id={id}>` with `.sim__head` (kind label + `<h3>`),
  `.sim__body`, optional `.sim__controls`, optional `.sim__log` (`data-role="log"`).
- Accept `id` (and `detail` when the developer page needs more) as props with defaults, so the
  same sim can appear on both pages.
- The `<script>` is plain TypeScript, bundled by Astro. It must loop over
  `document.querySelectorAll('.sim.<name>')` so several instances work; hooks are
  `data-role="…"` attributes, never ids.
- Diagrams are inline SVG with `viewBox`, using the token classes `d-a d-b d-c d-ok d-bad
  d-money d-grey d-surface` for fills/strokes and `t t.small t.b t.center t.mono t.muted` for
  text, so they follow the theme.
- Buttons use `.btn` (`.primary`, `.danger`, `aria-pressed`), sliders `.range`, badges `.pill`.
- Cite the source for what the sim shows with the `<Refs refs={[…]} />` component (it renders on the
  developer page only; the refs still feed the anchor check and the content map).
- No external scripts, no fetches, no localStorage. Real cryptography is welcome when it is
  cheap (WebCrypto SHA-256 in `RunningHash.astro`).

## Commands

- `pnpm run build` — build to `dist/` (Astro).
- `pnpm run check` — provenance, internal links, vocabulary, data rows, the generated content map and
  orphan components (run after every content change).
- `pnpm run verify` — build, then every gate: check, anchors, browser, dark-theme sims, overflow at
  400px on both pages. The command to run before calling anything done.
- `pnpm exec kse check-scroll` — neither page scrolls by itself after load (a simulation once did).
- `pnpm run check:anchors` — every upstream reference resolves in `.upstream/` (after a sync fetch).
- `pnpm test` — build then check.
- `pnpm exec kse shot <path> <out.png> [width] [fullPage] [clickSelector|…]` — screenshot a
  built page; look at the PNG before calling layout done. `DARK=1` for the dark theme;
  `pnpm exec kse overflow <path> 400` for phone overflow;
  `pnpm exec kse preview-diagram <Figure.astro> <out-prefix>` for a figure without a build.
  The browser scripts use the preinstalled Linux Chromium when it exists and Playwright's own
  otherwise (`pnpm exec playwright install chromium` once on a new machine).
- `pnpm run content-map` — regenerate `docs/content-map.md` after changing a `refs` entry.
- `pnpm run export:single` — build, then write `export-single/`: each page as one self-contained HTML
  file (styles, scripts and favicon inlined) to share without deploying; the script opens each file
  from disk in Chromium and fails if it loads anything else.
- `pnpm run sync:fetch` / `pnpm run sync:status` — fetch upstream repos into `.upstream/` and report
  drift against `sources.json`; `pnpm run sync:pin` moves the pins. The full update procedure is
  the `clpr-sync` skill (`.claude/skills/clpr-sync/SKILL.md`); `docs/content-map.md` says which
  site sections depend on which upstream files.

## Where things are documented

| Topic | File |
|---|---|
| Build and page structure | `docs/architecture.md` |
| Sections, components, claim labelling | `docs/content-model.md` |
| Voice and vocabulary | `docs/writing-guide.md` |
| Simulation catalogue and conventions | `docs/simulations.md` |
| Figures: the `Figure` plate and drawing rules | `docs/figures.md` |
| Pinned links and the checks | `docs/provenance.md` |
| Sync loop (human overview) | `docs/syncing.md` |
| Deployment | `docs/deployment.md` |
| Tools and screenshots | `docs/testing.md` |
| Why things are this way | `docs/decisions.md` |
| What moved upstream, whether the site still matches, and how to sync | `.claude/skills/clpr-drift/`, `.claude/skills/clpr-audit/` (both report only), `.claude/skills/clpr-sync/` (the only one that edits) |
