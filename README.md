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
`next start` listens on port 3000 unless `PORT` is set. No environment variables are needed.
Coolify's Railpack support is in beta and needs the Docker Buildx plugin on the build server.

To see the plan Railpack will use: `railpack info .` in a clean checkout.

## Project structure

```
src/
  app/
    layout.tsx         Root layout, self-hosted fonts, metadata
    page.tsx           Home page (composes the sections below)
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
    Guarantees.tsx     Protocol properties as a bento grid of small diagrams
    PropertyArt.tsx    Those diagrams: looping SVG in the fibre language, motion in CSS
    ComponentArt.tsx   Chain-agnostic: the Service, Endpoints and Verifier Contracts as small diagrams
    LayerArt.tsx       What lives on each plate of the architecture stack
    TermArt.tsx        An icon and a small diagram for every glossary term
    TermMap.tsx        The glossary as a map beside the Terminology heading
    LedgerOnboarding.tsx Chain-agnostic: the eight steps to connect a ledger, beside a drawing that builds up
    MessageJourney.tsx Interactive 7-step walkthrough of a message crossing a Channel
    fibreSvg.tsx       Shared SVG pieces for the diagrams: fibre bundles, stars, membranes, hexagons
    Comparison.tsx     Bridge vs. CLPR, switchable by aspect
    ComparisonArt.tsx  Its two diagrams per aspect: a bridge in the middle vs. a direct Channel
    Layers.tsx         Protocol layers as an interactive CSS 3D stack
    Glossary.tsx       Term explorer: search, categories, cross-linked definitions
    ClprMark.tsx       The CLPR spiral logo (also the source shape for the particles)
    Hero.tsx  Walkthrough.tsx  Extensibility.tsx  Repositories.tsx
    GetInvolved.tsx  SiteHeader.tsx  SiteFooter.tsx  SectionHeading.tsx  CopyCommand.tsx
    ui/                shadcn/ui-style primitives (button, input)
  content/
    site.ts            ALL copy and links. Edit content here, not in components.
  lib/utils.ts         cn(), format() for {placeholder} messages
  lib/glossary.ts      Term relations, shared by the glossary and its term map
public/logos/          Official LFDT, Hashgraph, Hedera and Hiero logos
```

## Editing content

Every user-facing string and link lives in `src/content/site.ts`, grouped by section. Copy is
based on the [CLPR lab proposal](https://github.com/LF-Decentralized-Trust/lab-proposals/issues/5),
the [LFDT-CLPR GitHub org](https://github.com/LFDT-CLPR) and
[hashgraph.com/clpr](https://hashgraph.com/clpr/).

## Design notes

Version 2 is dark first. Layout, spacing and type follow linear.app; the scroll story follows
Apple product pages; the interactive particle logo follows lusion.co. The brand colors still come
from the CLPR presentation on [hashgraph.com/clpr](https://hashgraph.com/clpr/).

- **Story of the page.** Hero (a network of ledgers draws itself) → pinned story (two ledgers
  form, a Channel opens, proofs cross) → guarantees → walkthrough → why bridgeless →
  architecture → chain-agnostic → code → terminology → get involved → closing call to
  action (the CLPR spiral as a ribbon of light).
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
- **Protocol properties.** A bento grid: the ordered chain gets a wide tile, the race against
  a bridge a full-width timeline. Each property has its own small looping diagram
  (`PropertyArt`, plain SVG rendered on the server) in the fibre language and the site's color
  meanings: a running-hash chain that is computed link by link and then shows a changed
  message in every hash after it; one message and exactly one response; a Channel running
  straight through an empty zero; a proof delivered by whoever is around while the Endpoint is
  offline; different payloads on one Channel; a bridge message waiting at every hop while the
  CLPR message arrives first. Motion is CSS (`prop-*` in `globals.css`) along `offset-path`, and
  only runs without `prefers-reduced-motion`; otherwise every part rests at a telling point. The
  wide diagrams have a shorter variant on phones.
- **How it works.** `MessageJourney` draws both ledgers as membranes with the seven stops on one
  route (Application → CLPR Service with its queue → Endpoint, the Channel, then Endpoint →
  Verifier Contract → Service → Application). Three queued messages ride the route as the steps
  change (CSS `offset-path`, transitions on `offset-distance`): they gather into a bundle with a
  dashed proof ring, cross, the ring turns solid at the Verifier, they are delivered in order and
  three responses travel back. A seven-point timeline with play, pause and arrow keys drives
  it; on phones the same route runs top to bottom.
- **Why bridgeless.** Two panels, the same two ledgers in each: joined through a bridge in the
  middle (muted grey) and directly by a CLPR Channel. Each aspect has its own pair of diagrams
  (`ComparisonArt`) on the same clock: validators in the middle vs. a proof checked by B's
  Verifier; assets pooling in the bridge (a red target ring) vs. nothing held; a dead operator
  vs. anyone delivering the proof; a stop for the bridge's own confirmations vs. straight to B;
  tokens only vs. any payload.
- **Architecture.** The CSS 3D layer stack stays in view while the visitor reads the four
  layers beside it; the layer being read lights up its plate and the plates above it step
  back, so its drawing (`LayerArt`) shows through. A plate can be clicked to jump to its
  layer. The terms of each layer link to their definitions in the glossary (`showTerm` in
  `lib/glossary.ts`). The mesh floor fits under the stack, clear of the text.
- **Chain-agnostic.** Under the three component diagrams, "Connecting a new ledger to Hiero" is
  a stepper (`LedgerOnboarding`, sharing `useStepper` with the walkthrough) beside a drawing that
  builds up: Hiero is native from the start; the new ledger gains its Service and Endpoints,
  the two Verifier Contracts are built (each in the color of the ledger whose proofs it
  checks) and move into the opposite network, the Channel opens, the Endpoints peer, a
  Connector is bonded and applications start sending messages.
- **Open source.** The specification spans the row above its three implementations, joined
  by "Implemented by" fibres. Each implementation card lists the CLPR components it implements
  (with the site's symbols: star, hexagon, diamond), what it runs on and, where the sources say
  so, its status. Governance and the two licenses share the last row.
- **Terminology.** The glossary speaks the site's visual language: every term has an icon (the
  star, hexagon, diamond, proof ring and coin of the illustrations) in the list, in the related
  terms and on the Open source cards, and a small looping diagram above its definition
  (`TermArt`). Beside the heading, `TermMap` draws all terms as a map: each with its icon and
  name, joined by fibres where one definition mentions another. The selected term and its
  relations light up in step with the explorer; hovering shows a term's neighbours and a click
  selects it. Terms that appear in an illustrated section link to it ("See it in …",
  `glossary.seeIn`), the reverse of the term links in Architecture.
- **Header.** The nav sits exactly in the middle of the bar and a marker slides to the section
  being read (`aria-current`). From `xl` the brand reads "CLPR | Cross Ledger Protocol". The
  mobile menu fills the screen, locks scrolling and closes on Escape.
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
- **Section illustrations.** From Architecture on, each section gets its own network
  (`data-form`, defined in `sceneGraphs.ts`; the particles in `sceneForms.ts` add dust, block
  state, the floor grid and the land): a triangulated mesh floor under the layer stack (architecture), validators in real cities on a
  dot-matrix Earth with Channels between four ledgers (chain-agnostic), a git history with
  contributors pushing commits (code) and a scale-free contributor
  network (get involved). Each drawing sits in its section heading's `data-form-slot` and
  scrolls with it; one network takes itself apart as the next one builds itself, and the
  particles flow between them. Cards use frosted glass (`panel`), so the drawings glow through
  them.
- **Color.** A deep indigo ink (`--bg` `#120f2c`; the aurora runs from `#0f0c26` at the bottom
  to `#1a1540` at the top), hairline white borders, white text fading to lavender in
  headlines (`text-headline`). Violet `#9d8bff` marks messages in transit; magenta `#f27fbd` is
  reserved for state proofs and verification. The hero illustration carries the warm end of the
  range; headlines stay in `text-headline`.
- **Type.** Sora (OFL) as a free stand-in for Styrene A, the licensed typeface on
  hashgraph.com/clpr: the same wide, round geometric letterforms. Like Styrene there, large
  headlines are set light (300) with tight tracking (−0.035 to −0.04em); text stays regular.
  IBM Plex Mono only for real code, indices and hashes. If a Styrene A web license is
  available, swap the font in `src/app/layout.tsx`.
- **Shape.** Pill buttons (solid white primary, translucent secondary), frosted `panel`
  surfaces with hairline borders, cards that light up under the pointer (`data-spotlight`).
- **Footer.** Its top edge is a Channel: two Endpoints joined by a twisted fibre bundle, with
  a message crossing one way and its response the other (CSS, still with reduced motion).
  Links are grouped by intent (Explore the page, Build with the repositories, how the Project
  is run), and a row shows who is behind CLPR with their marks: stewarded by LF Decentralized
  Trust, contributed by Hashgraph and Hedera, built natively into Hiero. Below it the large CLPR
  wordmark lights up in the spiral's colors under the pointer (`data-pointer-glow`); on touch
  screens the light sweeps across it on its own.
- **Motion and accessibility.** With `prefers-reduced-motion` the background holds still and
  only changes when the visitor scrolls, the walkthrough waits for the visitor, and CSS
  animations stop. The canvas pauses while the tab is hidden. Without WebGL2 the page falls back
  to a CSS gradient (`html.no-webgl`). All story text is in the DOM in reading order.
- **Tokens.** All colors are defined once in `globals.css`. Components use semantic classes
  (`text-muted-foreground`, `text-faint`, `text-signal-ink`, `panel` …).
- **Previous design.** The light v1 design is archived in `design-v1-backup.tgz`.

## Before launch

- [ ] Confirm the CLPR spiral (`src/components/ClprMark.tsx`, `src/app/icon.svg`) against the
      official CLPR logo files from the LFDT / Hashgraph brand assets.
- [ ] Decide on the typeface: keep Sora or license Styrene A.
- [ ] Replace the footer legal line (`footer.legal` in `site.ts`) with the official LFDT lab text.
- [ ] Re-check statuses that will change: HIP-1535 and hiero-consensus-node PR #27029.
- [ ] Add community channels (Discord, mailing list, calls) once LFDT sets them up.
- [ ] Get logo usage confirmed with LFDT, Hashgraph, Hedera and Hiero brand guidelines.
- [ ] Set `metadataBase` and add an Open Graph image once the domain is known.
- [ ] Check the WebGL background on low-end phones and older integrated GPUs; lower the
      particle counts in `ProtocolField.tsx` or the mesh size in `sceneGraphs.ts` if needed.

## Contributing

Commits must be signed off (DCO, `git commit -s`) and GPG-signed. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Code: Apache-2.0 (see [LICENSE](LICENSE)). Fonts: SIL Open Font License (see `src/app/fonts/`). Land outlines on the globe:
Natural Earth (public domain). Logos are trademarks of their respective owners and are used here
to identify the projects.
