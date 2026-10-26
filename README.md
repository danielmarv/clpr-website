# CLPR website prototype

Project website prototype for **CLPR** (“Clipper”), the bridgeless Cross Ledger Protocol, an
[LF Decentralized Trust](https://www.lfdecentralizedtrust.org/) Lab.

> Prototype only. This is not yet an official CLPR property. See [Before launch](#before-launch).

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

## Project structure

```
src/
  app/
    layout.tsx         Root layout, self-hosted fonts, metadata
    page.tsx           Home page (composes the sections below)
    not-found.tsx      404 page (shows the spiral from the WebGL background)
    globals.css        Design tokens (shadcn semantic tokens + CLPR brand tokens), utilities
    icon.svg           Favicon (CLPR spiral on the hero gradient)
    fonts/             Albert Sans (variable wght) and IBM Plex Mono, OFL-licensed
  components/
    ProtocolField.tsx  WebGL2 background: the aurora, the particles (3D spiral, ledger
                       state, dust) and the scroll logic, driven by data-scene sections
    networkLayer.ts    Draws the networks on top: glowing links, shaded nodes, traffic
    sceneGraphs.ts     The networks themselves: nodes, links and packets per scene
    sceneForms.ts      The particle side of each section illustration (data-form)
    sceneMotion.ts     Camera, palette and per-illustration motion shared by both layers
    worldLand.ts       Natural Earth land mask (1°, run-length encoded) for the globe
    Story.tsx          Pinned scroll story: statement, two ledgers, one Channel, proofs
    Guarantees.tsx     Protocol properties with small diagrams
    ChannelDemo.tsx    Interactive 7-step walkthrough of a message crossing a Channel
    Comparison.tsx     Bridge vs. CLPR, switchable by aspect
    Layers.tsx         Protocol layers as an interactive CSS 3D stack
    Glossary.tsx       Term explorer: search, categories, cross-linked definitions
    ClprMark.tsx       The CLPR spiral logo (also the source shape for the particles)
    Hero.tsx  Walkthrough.tsx  Extensibility.tsx  Repositories.tsx  Roadmap.tsx
    GetInvolved.tsx  SiteHeader.tsx  SiteFooter.tsx  SectionHeading.tsx  CopyCommand.tsx
    ui/                shadcn/ui-style primitives (button, input)
  content/
    site.ts            ALL copy and links. Edit content here, not in components.
  lib/utils.ts         cn(), format() for {placeholder} messages
  lib/glossary.ts      Term relations, shared by the glossary and its knowledge graph
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

- **Story of the page.** Hero (the spiral assembles) → pinned story (the spiral becomes two
  ledgers, a Channel opens, proofs cross) → guarantees → walkthrough → why bridgeless →
  architecture → chain-agnostic → code → roadmap → terminology → get involved → closing call to
  action (the spiral gathers again).
- **Background.** `ProtocolField` is one fixed WebGL2 canvas behind all content: an aurora
  shader, 9,000 (mobile) to 20,000 particles, and a network layer (`networkLayer.ts`) that
  draws real network topology on top: links as continuous anti-aliased lines with a glow,
  nodes as small shaded objects whose shape says what they are (validator orb, Endpoint
  hexagon, Verifier diamond, custodian square, commit ring), and packets that travel the links
  with light trails. Sections opt in with `data-scene="hero" | "story" | "outro"`. The pointer
  tilts the scene, pushes particles aside and lights up the links and nodes under it. The
  ledger positions are published as CSS variables (`--ledger-a-x` …) so the story can label
  them. No 3D library is used; all motion runs in the vertex shaders.
- **The story as a network.** In the hero a ring of validators orbits the spiral. In the story
  each ledger becomes a mesh of validators gossiping, with its Endpoint on the surface facing
  the other ledger. The Channel opens as a two-lane link between the Endpoints; bundles of
  three messages cross it, then (state proofs chapter) each bundle carries a proof ring,
  Ledger B's Verifier ripples as it checks it and the verified state spreads through B.
- **Section illustrations.** Below the story, each section gets its own network
  (`data-form`, defined in `sceneGraphs.ts`; the particles in `sceneForms.ts` add dust, block
  state, the floor grid and the land): a running-hash chain of blocks attested by a validator
  quorum (guarantees), the seven stops of one message and its response (how it works), a hub
  of custodians that crumbles while the direct proof link stays (why bridgeless), a
  triangulated mesh floor under the layer stack (architecture), validators in real cities on a
  dot-matrix Earth with Channels between four ledgers (chain-agnostic), a git history with
  contributors pushing commits (code), the network growing through the roadmap phases, live
  up to the current one and planned after it (roadmap), the glossary as a knowledge graph that
  lights up the selected term (`data-form-focus`, terminology) and a scale-free contributor
  network (get involved). Each drawing sits in its section heading's `data-form-slot` and
  scrolls with it; one network takes itself apart as the next one builds itself, and the
  particles flow between them. Cards use frosted glass (`panel`), so the drawings glow through
  them.
- **Color.** Near-black ink `#07060d`, hairline white borders, white text fading to lavender in
  headlines (`text-headline`). Violet `#9d8bff` marks messages in transit; magenta `#f27fbd` is
  reserved for state proofs and verification; the full spiral gradient (`text-brand`) is used
  for one phrase in the hero only.
- **Type.** Albert Sans as a free stand-in for Styrene A, medium weight with tight tracking for
  headlines. IBM Plex Mono only for real code, indices and hashes. If a Styrene A web license is
  available, swap the font in `src/app/layout.tsx`.
- **Shape.** Pill buttons (solid white primary, translucent secondary), frosted `panel`
  surfaces with hairline borders, cards that light up under the pointer (`data-spotlight`).
- **Footer.** The "Lab status" pill reads the current phase from `roadmap.phases`, so it updates
  with the roadmap. The large CLPR wordmark lights up in the spiral's colors under the pointer
  (`data-pointer-glow`); on touch screens the light sweeps across it on its own.
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
- [ ] Decide on the typeface: keep Albert Sans or license Styrene A.
- [ ] Replace the footer legal line (`footer.legal` in `site.ts`) with the official LFDT lab text.
- [ ] Confirm the roadmap phase marked “Now” (`roadmap.phases[].current`).
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
