# Figures

A figure is a static drawing of one mechanism: who does what to whom. Each one is an Astro
component under `src/components/diagrams/<page>/` (or `diagrams/shared/` when both pages use it) wrapped in `<Figure>`, imported into the MDX
page and placed after the paragraph it illustrates. Simulations (docs/simulations.md) are for
things that move or that the reader can change; figures are for the rest.

## The component

```astro
---
/** What the figure shows and which spec or design section it draws from. */
import Figure from '../../Figure.astro';
import { design, spec, sol, pinned } from '../../../lib/sources';
---
<Figure
  lead="The thing to remember, in a few words."
  caption="One or two sentences that say what the drawing shows."
  source={[{ label: 'design §3.2.2', href: design('322-message-storage') }]}
  kind="spec"
  minWidth={640}
>
  <svg viewBox="0 0 720 300" role="img" aria-label="What is drawn, for screen readers.">…</svg>
</Figure>
```

`Figure.astro` renders a plate (a card with a horizontally scrollable frame, so a phone scrolls
the drawing and never the page), a caption that opens with the bold lead phrase, a mono source
line built from the pinned helpers (rendered on the developer page only; the general page cites its
sources in the provenance footer, and the `source` prop still feeds the anchor check and the content
map), and a kind tag. `kind` says what sort of claim the figure
makes: `spec` (the specification says so), `impl` (the reference implementation does so),
`open` (the specification marks it unresolved), `plain` (an analogy, a process, or a summary of
the page's own text). The same three labels the callouts use (docs/content-model.md).

## Drawing rules

- `viewBox` 640 to 760 wide; height as needed. Every element inside with some margin.
- Boxes are `<rect>` with one of `d-a d-b d-c d-ok d-bad d-money d-grey d-surface`; Ledger A on
  the left, Ledger B on the right; never a literal colour.
- Text: `t` (13px), `t b` (bold), `t small` (11.5px), `t mono` (11px, for
  identifiers), `t muted`, `t center`, `t end`; colour a label with `t a`, `t b-col`, `t c`,
  `t ok`, `t bad`, `t money`. Nothing under 11px.
- Arrows: `line` plus `a|b|c|ok|bad|money` and `dash`, with a `marker-end` whose id is prefixed
  by the component name so two figures on a page never clash.
- One takeaway line at the bottom of the drawing (`t take` or `t small center muted`).
- No scripts, no styles, no expressions inside the SVG: a figure is static markup, which is what
  lets `kse preview-diagram` render it without a site build.
- The caption and the takeaway state only what the page text or the cited section states.

## The website's vocabulary

The pages are part of the CLPR website, so a drawing that shows actors and what passes between
them uses the landing page's shapes: a ledger is a membrane with validator stars on its rim
(`art-orb`, violet for Ledger A, pink for Ledger B), the CLPR Service and applications are glowing
four-ray stars (`art-star`), an endpoint is a hexagon on its ledger's rim or, for a separate relay,
outside it (`art-endpoint`), a verifier is a diamond (`art-verifier`), a channel or any flow is a
fibre bundle (`art-fibre`), a bundle is a dashed pill of message stars (`art-bundle`), a connector
is a peach coin on each ledger (`art-coin`), and an accepted proof lights a pink ring (`art-ring`).
`node .claude/skills/clpr-figure/art.mjs` (from the repository root) prints the markup, in the
landing page's own geometry; the `clpr-figure` skill says which actor gets which shape and how to
check the result. Structural drawings (state machines, lists, file maps, tables) keep the boxes
above; the theme gives those boxes the website's glass and glow, with opaque fills so a line drawn
behind a box never shows through its label.

`kse preview-diagram` reads only the engine's stylesheet, so it draws `art-*` shapes unstyled: use
it for layout, and judge the look on the built page.

## Checking a figure

```bash
pnpm exec kse preview-diagram src/components/diagrams/general/WhatBChecks.astro screenshots/what-b-checks
```

writes light, dark and phone-width PNGs and prints any text under 11px and any element outside
the `viewBox`. Look at the PNGs. After placing the figure in the MDX, `pnpm run build`,
`pnpm run check` (every source link must be pinned) and, with `.upstream/` fetched,
`pnpm run check:anchors` (every anchor must exist upstream).

The preview draws in the engine's own fonts. The pages set diagram text in Sora, which runs wider,
so a label that fits in the preview can still spill out of its box on the site. After the build,
`node checks/browser/check-diagram-text.mjs` renders both pages in the site theme and fails when a
label comes within 3 units of its box's edge, its ledger orb's edge or the drawing's (text renders a little wider on some
platforms, so a label that only just fits locally can spill out in CI), runs into another box, or
sits on another label; it also runs in `pnpm run verify`. It cannot see a line drawn through a label, so still look at the
figure on the built page.
