# CLPR website

The website of **CLPR** (“Clipper”), the bridgeless Cross Ledger Protocol, an
[LF Decentralized Trust](https://www.lfdecentralizedtrust.org/) Lab.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · shadcn/ui-style components · pnpm

## Getting started

```bash
pnpm install
pnpm dev           # http://localhost:3000
```

| Command          | What it does                       |
| ---------------- | ---------------------------------- |
| `pnpm dev`       | Development server                 |
| `pnpm build`     | Production build                   |
| `pnpm start`     | Serve the production build         |
| `pnpm lint`      | ESLint                             |
| `pnpm typecheck` | TypeScript, no emit                |

## Deploy (Coolify + Railpack)

The site runs as a Node server (`next start`). It is built with
[Railpack](https://railpack.com); `railpack.json` pins Node 24, and pnpm comes from
`packageManager` in `package.json`. Without the pin Railpack would take the lowest Node that
matches `engines.node` (`>=20`).

In Coolify, create an application from this repository and set:

| Setting                  | Value                                  |
| ------------------------ | -------------------------------------- |
| Build pack               | Railpack                               |
| Base directory           | `/`                                    |
| Ports exposes            | `3000`                                 |
| Site type                | Dynamic                                |
| Install / build / start  | Leave empty; Railpack detects them     |

Railpack then runs `pnpm install --frozen-lockfile`, `pnpm run build` and `pnpm run start`.
`next start` listens on port 3000 unless `PORT` is set. No environment variables are needed;
`GITHUB_TOKEN` is optional. The home page's numbers and the Issue Explorer come from the GitHub API
when the site is built and at most once an hour after (`src/lib/github.ts`). Unauthenticated, the API
allows 60 requests an hour per server, which this uses a few of; a token (no scopes needed) only helps
when the build server shares its address with many others. When GitHub cannot be reached, the pages
leave the numbers out.
Coolify's Railpack support is in beta and needs the Docker Buildx plugin on the build server.

To see the plan Railpack will use: `railpack info .` in a clean checkout.

## Project structure

```
src/
  app/
    layout.tsx         Root layout, self-hosted fonts, metadata
    page.tsx           Home page (composes the sections below; reads stars and repositories from GitHub)
    issues/            Issue Explorer: open, unassigned issues of the main repositories, filtered in the browser
    governance/        Who maintains CLPR: roles, Maintainers and Committers, where the rules are kept
    blog/              Blog index and blog/[slug]/ posts (the posts are in site.ts)
    not-found.tsx      404 page (shows the spiral from the WebGL background)
    globals.css        Design tokens (shadcn semantic tokens + CLPR brand tokens), utilities
    icon.svg           Favicon (CLPR spiral on the hero gradient)
    fonts/             Sora (variable wght) and IBM Plex Mono, OFL-licensed
  components/
    ProtocolField.tsx  WebGL2 background: the aurora, the particles (3D spiral, ledger
                       state, dust) and the scroll logic, driven by data-scene sections
    networkLayer.ts    Draws the networks on top: fibre-bundle links, star nodes, traffic
    sceneGraphs.ts     The networks themselves: nodes, links and packets per scene
    sceneForms.ts      The particle side of each section illustration (data-form)
    sceneMotion.ts     Camera, palette and per-illustration motion shared by both layers
    worldLand.ts       Natural Earth land mask (1°, run-length encoded) for the globe
    HeroMesh.tsx       Hero illustration: ledgers joined directly by Channels (2D canvas)
    SpiralRibbon.tsx   Closing illustration: the CLPR spiral as a twisting ribbon of light (2D canvas)
    Story.tsx          Pinned scroll story: statement, two ledgers, one Channel, proofs
    StoryStage.tsx     The story's illustration: two ledgers, the Channel and the traffic (2D canvas)
    fibres.ts          Shared canvas helpers: fibre bundles, partial polylines, the star sprite
    ComponentArt.tsx   Architecture: the Service, Endpoints and Verifier Contracts as small diagrams
    fibreSvg.tsx       Shared SVG pieces for the diagrams: fibre bundles, stars, membranes, hexagons
    Comparison.tsx     Bridge vs. CLPR: two cards whose aspects line up row by row
    ComparisonArt.tsx  Its two diagrams: a bridge in the middle vs. a direct Channel
    UseCases.tsx       Use cases: the design's four application patterns, then what CLPR does not promise
    UseCaseArt.tsx     Their four diagrams: a remote call, escrow and mint, a commit across three ledgers,
                       a Hiero asset on a dashed (not yet specified) Channel
    ClprMark.tsx       The CLPR spiral logo (also the source shape for the particles)
    Hero.tsx  Extensibility.tsx  Repositories.tsx
    ThemeSwitch.tsx    The Light / Dark / System switch in the header
    Voices.tsx         Community voices: the two quotes from the announcement of 24 September 2026
    PageShell.tsx      The frame and opening of every page but the home page
    IssueList.tsx      The Issue Explorer's search, filters, difficulty tabs and list (client side)
    GetInvolved.tsx  SiteHeader.tsx  SiteFooter.tsx  SectionHeading.tsx  CopyCommand.tsx
    ui/                shadcn/ui-style primitives (button, input)
  content/
    site.ts            ALL copy and links. Edit content here, not in components.
    site-refs.json     Where each block of site.ts gets its facts; read only by the audit skill
  lib/utils.ts         cn(), format() for {placeholder} messages, formatDate()
  lib/github.ts        Repositories, stars and open issues from the GitHub API, refreshed at most hourly
  lib/theme.ts         The theme choice: storage key, the before-paint script, watching for changes
public/logos/          Official LFDT, Hashgraph, Hedera and Hiero logos in their own colours, each with a white
                       version for the dark theme (*-white.svg; Hiero keeps its crimson mark). The explainer
                       footer inlines them.
explainer/             The plumbing explainer: Astro source, docs and gates (see below)
public/plumbing/       Its built pages; generated by pnpm build, git-ignored
```

## Editing content

Every user-facing string and link lives in `src/content/site.ts`, grouped by section. Copy is
based on the [CLPR lab proposal](https://github.com/LF-Decentralized-Trust/lab-proposals/issues/5)
and the [LFDT-CLPR GitHub org](https://github.com/LFDT-CLPR); the brand range comes from
[hashgraph.com/clpr](https://hashgraph.com/clpr/). Protocol claims follow the CLPR specification:
`src/content/site-refs.json` names the passages each block rests on, and the `clpr-audit` skill under
`.claude/skills/` checks every block, drawing and animation step against them. When you add or
change a block, add or update its entry there.

## The plumbing explainer (`/plumbing/`)

`explainer/` holds "The plumbing of CLPR", a two-page explainer of the protocol (a page for
everyone at `/plumbing/`, a page for developers at `/plumbing/developers/`) written against pinned
commits of the LFDT-CLPR repositories. It is an Astro project with its own rules
(`explainer/CLAUDE.md`), documentation (`explainer/docs/`, start at the README there) and gates;
its text is CC BY 4.0 and its code Apache-2.0. `pnpm build` runs `node explainer/embed.mjs`, which
builds the pages into `public/plumbing/` (git-ignored) with `BASE_PATH=/plumbing/`, and then
`next build`; `pnpm build:explainer` runs the first step alone, which `pnpm dev` needs once before
the pages appear. Two settings in `next.config.ts` make the directory URLs work:
`trailingSlash: true`, because the pages link to each other with relative URLs (`developers/` and
`../`) and so must be served with the trailing slash, and one `rewrites()` entry per page mapping
`/plumbing/` and `/plumbing/developers/` to their `index.html`. The redirect-based alternative
without `trailingSlash` loops, because Next makes the trailing slash optional in every redirect
source.

The pages' canonical links take their host from `SITE_URL` in the deploy environment (Netlify's
`URL` also works); without it they carry a placeholder. When the CLPR repositories change, the
explainer is updated in place: `explainer/docs/syncing.md` and the `clpr-sync` skill under
`.claude/skills/` describe the loop (detect drift, fetch the new commits, review every statement
against them, re-pin, run the gates), and `.github/workflows/upstream-watch.yml` opens an issue
weekly when the pinned commits have moved. The explainer's gates run in
`.github/workflows/explainer.yml` on every change under `explainer/`, and locally with
`pnpm run verify` inside that directory (Chromium through Playwright: `pnpm exec playwright install
chromium` once). The pages wear this site's theme: the tokens, fonts, header and footer are
reproduced in `explainer/src/styles/site-theme.css`, `explainer/src/components/SiteHeader.astro`
and `SiteFooter.astro`, so a change to this site's look is repeated there.

## Design notes

Version 2 has a light and a dark theme; light is the default. Layout, spacing and type follow linear.app; the scroll story follows
Apple product pages; the interactive particle logo follows lusion.co. The brand colors still come
from the CLPR presentation on [hashgraph.com/clpr](https://hashgraph.com/clpr/).

- **Story of the page.** An overview; the explainer under `/plumbing/` carries the detail. Hero (a
  network of ledgers draws itself) → pinned story as How it works (two ledgers form, a Channel
  opens, proofs cross) → why bridgeless → use cases → architecture → code → community voices → get
  involved, which closes with the CLPR spiral as a ribbon of light. Each section links into the
  explainer where it stops.
- **Background.** `ProtocolField` is one fixed WebGL2 canvas behind all content: an aurora
  shader, 9,000 (mobile) to 20,000 particles, and a network layer (`networkLayer.ts`) that
  draws real network topology on top: links as bundles of fine fibres that meet at both ends
  and fan out in between, nodes as glyphs whose shape says what they are (validator star,
  Endpoint hexagon, Verifier diamond, custodian square, commit ring), and packets that travel
  the links with light trails. The fibres and the soft four-ray stars match the canvas and
  SVG illustrations. Sections opt in with `data-scene="hero" | "story" | "outro"`. The pointer
  tilts the scene, pushes particles aside and lights up the links and nodes under it. The
  ledger positions are published as CSS variables (`--ledger-a-x` …) so the story can label
  them. No 3D library is used; all motion runs in the vertex shaders.
- **Hero illustration.** `HeroMesh` draws a network of 25 ledgers (stars) joined directly by
  Channels (bundles of fine fibres) on a 2D canvas, in the warm end of the brand range: amber at
  the core, coral, then pink at the rim. No ledger sits in the middle; the light at the core is
  only where the five Channels between the inner ledgers cross. On load the ledgers appear and
  the Channels open from the core outwards. Then a message (violet) crosses a Channel now and
  then, the receiving ledger flares and rings in proof magenta, and the response travels back.
  The drawing tilts slightly towards the pointer and pauses off screen.
- **Closing illustration.** `SpiralRibbon` draws the CLPR mark as a twisting ribbon: 72 fibres
  around a flattened tube that follows the mark's centerline at its stroke width and turns 2.6
  times on the way, so the band pinches and fans. Fibres facing the viewer are warm, the ones
  behind violet, with beads of light along them. The ribbon draws itself from the tail into the
  coil when the closing section comes into view (only the newly revealed stretch is drawn each
  frame); then messages travel along it one after the other, in order.
- **Scenes with their own art.** An illustration marked `data-scene-art` inside the hero, the story
  or the closing section tells `ProtocolField` to hide its particle version of that scene
  (the spiral, or the two ledgers and their Channel). The 404 page
  has none, so it still shows the particle spiral.
- **Why bridgeless.** Two cards, the same two ledgers in each: joined through a bridge in the
  middle (muted grey) and directly by a CLPR Channel whose proof B's Verifier checks
  (`ComparisonArt`, both on the same clock). Below each drawing the five aspects (trust, custody,
  going offline, speed, what moves) line up across the cards on a shared CSS subgrid.
- **Pages.** The Issue Explorer, Governance and Blog pages share `PageShell` (header, footer, no WebGL
  background) and `PageIntro` (the hero's kicker pill and type). Governance lists the Maintainers and
  Committers from the governance repository's `teams.yml` with their GitHub avatars; the list is copied
  into `site.ts`, and the audit's live check compares it with `teams.yml`. CLPR's governance has no TSC,
  so the page shows the roles it does have. Blog posts are entries in `blog.posts` in `site.ts`, each
  with its sources.
- **Use cases.** The four patterns the design outlines (§3.4), each with a small looping diagram
  (`UseCaseArt`, on `ComponentArt`'s clock), introduced as applications that are not specified yet;
  Hiero's is drawn on a dashed Channel because the design gives it one sentence. Below them, the three
  limits (delivery depends on Endpoints, nothing is secret, authentic is not safe).
- **Architecture.** The three components a ledger needs (Service, Endpoints, Verifier
  Contracts), each with a small looping diagram (`ComponentArt`), then the note on Hiero's
  native service and a link to how a ledger is added in the explainer.
- **Open source.** The specification spans the row above its three implementations. Each
  implementation card lists the CLPR components it implements, what it runs on and, where the
  sources say so, its status. Governance and the project facts share the last row.
- **Header.** The nav lists the site's pages (Explainer, Issue Explorer, Governance, Blog) and marks
  the current one (`aria-current="page"`); the home page's sections are in the footer. Beside the theme
  switch, GitHub and Start contributing it needs 64rem, and below that a menu button takes over. The mobile menu fills the screen, locks scrolling and closes on Escape.
- **Themes.** `ThemeSwitch` in the header offers Light, Dark and System. Light is what a visitor
  sees until they choose; System follows the computer and changes with it. The choice is
  `data-theme` on `<html>`, kept in `localStorage` as `theme`, the key the explainer reads too, so
  one choice covers both. An inline script in `layout.tsx` applies it before the first paint, and
  the switch marks its option from the attribute, so nothing flashes before React hydrates
  (`src/lib/theme.ts`). The illustrations are the same in both; the WebGL aurora is light on a
  dark sky, so it only draws in the dark theme and pauses in the light one.
- **The story as a network.** `StoryStage` draws the story on a 2D canvas in the same fibre
  language as the hero. Each ledger is a circle holding its own network of validators (stars
  joined by fibre bundles) with its own heartbeat, and an Endpoint (hexagon) on the side facing
  the other ledger; Ledger B also holds its Verifier Contract (diamond). As the visitor
  scrolls, the ledgers appear, the Channel opens from Endpoint A to Endpoint B as a twisted
  ribbon, and messages queue on Ledger A, linked by a running-hash line, and cross in bundles
  of three; each message gets one response back. In the state proofs chapter every bundle
  carries a magenta proof ring, B's Verifier lights up and the verified state spreads through
  B's validators. Scroll decides what is shown; time only moves the traffic. The ledgers sit
  where `ProtocolField` publishes them (`--ledger-a-x` …), so the aurora glows behind them.
- **Section illustrations.** `ProtocolField` can give a section its own network
  (`data-form`, defined in `sceneGraphs.ts`; the particles in `sceneForms.ts` add dust, block
  state, the floor grid and the land): a triangulated mesh floor under the layer stack (architecture), validators in real cities on a
  dot-matrix Earth with Channels between four ledgers (chain-agnostic), a git history with
  contributors pushing commits (code) and a scale-free contributor
  network (get involved). Each drawing sits in its section heading's `data-form-slot` and
  scrolls with it; one network takes itself apart as the next one builds itself, and the
  particles flow between them. The home page uses none at present: once the story ends, the
  particles leave the screen.
- **Color.** Light: paper (`--bg` `#f6f5fb`) with ink text and hairlines. Dark: a quiet ink
  (`#0c0b1d`; the aurora runs from `#0a0918` at the bottom to `#13112c` at the top, softer
  outside the story) with white. Headlines are plain (`text-headline`). Violet marks messages in
  transit and magenta is reserved for state proofs and verification, a step deeper on the light
  page (`--tone-*`) so the drawings keep their contrast. The hero illustration carries the warm
  end of the range.
- **Type.** Sora (OFL) as a free stand-in for Styrene A, the licensed typeface on
  hashgraph.com/clpr: the same wide, round geometric letterforms. Like Styrene there, large
  headlines are set light (300) with tight tracking (−0.035 to −0.04em); text stays regular.
  IBM Plex Mono only for real code, indices and hashes. If a Styrene A web license is
  available, swap the font in `src/app/layout.tsx`.
- **Shape.** Pill buttons (solid ink or white primary, translucent secondary), flat `panel`
  surfaces with hairline borders, and `band` sections a step off the page.
- **Footer.** Its top edge is a Channel: two Endpoints joined by a twisted fibre bundle, with
  a message crossing one way and its response the other (CSS, still with reduced motion).
  Links are grouped by intent (Explore the page, Build with the repositories, how the Project
  is run), and a row shows who is behind CLPR with their marks: a lab of LF Decentralized
  Trust, contributed by Hashgraph and Hedera, built natively into Hiero. Below it the large CLPR
  wordmark lights up in the spiral's colors under the pointer (`data-pointer-glow`); on touch
  screens the light sweeps across it on its own.
- **Motion and accessibility.** With `prefers-reduced-motion` the background holds still and
  only changes when the visitor scrolls, and CSS animations stop. The canvas pauses while the tab is hidden. Without WebGL2 the page falls back
  to a CSS gradient (`html.no-webgl`). All story text is in the DOM in reading order.
- **Tokens.** All colors are defined once in `globals.css`, with their dark values under
  `@variant dark`; components use semantic classes (`text-muted-foreground`, `text-faint`,
  `text-signal-ink`, `panel` …), `fg` for what is ink on light and white on dark
  (`text-fg/60`, `border-fg/10`), and `dark:` for the few things that differ otherwise.
- **Previous design.** The light v1 design is archived in `design-v1-backup.tgz`.

## Before launch

- [ ] Confirm the CLPR spiral (`src/components/ClprMark.tsx`, `src/app/icon.svg`) against the
      official CLPR logo files from the LFDT / Hashgraph brand assets.
- [ ] Decide on the typeface: keep Sora or license Styrene A.
- [x] Footer: the affiliation line and the Linux Foundation legal text that LFDT requires of its labs
      (`footer.affiliation` and `footer.legal` in `site.ts`, mirrored in the explainer's footer).
- [ ] Re-check the native Hiero status when a network switches CLPR on. HIP-1535 is Approved and describes
      the service as opt-in; the clpr-audit skill checks the HIP status live.
- [ ] Reconcile the specification licence with LFDT: the Labs charter says specifications are developed
      under the Community Specification License 1.0, but `clpr-spec`'s LICENSE file is Apache-2.0.
- [ ] Add community channels (Discord, mailing list, calls) once LFDT sets them up.
- [ ] Get logo usage confirmed with LFDT, Hashgraph, Hedera and Hiero brand guidelines.
- [ ] Set `metadataBase` and add an Open Graph image once the domain is known.
- [ ] Set `SITE_URL` to the real domain in the deploy environment; the explainer's canonical
      links carry the placeholder `https://clpr.example` until then.
- [ ] Check the WebGL background on low-end phones and older integrated GPUs; lower the
      particle counts in `ProtocolField.tsx` or the mesh size in `sceneGraphs.ts` if needed.

## Contributing

Commits must be signed off (DCO, `git commit -s`) and GPG-signed. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Code: Apache-2.0 (see [LICENSE](LICENSE)). Fonts: SIL Open Font License (see `src/app/fonts/`). Land outlines on the globe:
Natural Earth (public domain). Logos are trademarks of their respective owners and are used here
to identify the projects.
