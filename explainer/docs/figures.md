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

## Checking a figure

```bash
pnpm exec kse preview-diagram src/components/diagrams/general/WhatBChecks.astro screenshots/what-b-checks
```

writes light, dark and phone-width PNGs and prints any text under 11px and any element outside
the `viewBox`. Look at the PNGs. After placing the figure in the MDX, `pnpm run build`,
`pnpm run check` (every source link must be pinned) and, with `.upstream/` fetched,
`pnpm run check:anchors` (every anchor must exist upstream).
