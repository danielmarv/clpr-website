---
name: clpr-figure
description: Use when drawing, redrawing or reviewing a figure, simulation or animation in the plumbing explainer (explainer/ in the CLPR website repository), or when asked to make one look like the landing page's drawings; also when a figure's ledgers, endpoints, verifiers, connectors or channels look like plain boxes and arrows.
---

# clpr-figure: draw it the way the landing page does

The landing page draws CLPR with a small, fixed vocabulary. The explainer's figures and
simulations use the same one, so a reader moving from the site into the explainer sees the
same actors. Accuracy still comes first: the shape says what the actor is, and a drawing claims
things as much as its labels do.

## The vocabulary

| Actor | Shape | Class (explainer/src/styles/site-theme.css) | `art.mjs` |
|---|---|---|---|
| Ledger | a membrane with validator stars on its rim; A violet, B pink. A circle, or an ellipse when long labels need the width | `art-orb a\|b` on a `circle` or `ellipse`, `art-validator` | `ledger x y r a --at 1.0` |
| CLPR Service, application | a four-ray glowing star (Service larger, r 12-18; application r 8-10) | `art-star` | `star x y r tone` |
| Endpoint | a hexagon on its ledger's rim (Hiero: every consensus node), or outside it joined by a short line (a separate relay) | `art-endpoint` | `endpoint x y tone` |
| Verifier Contract | a diamond, dark with a pink edge | `art-verifier` | `verifier x y` |
| Channel, any flow | a fibre bundle; a violet-to-pink lane between Ledger A and Ledger B | `art-fibre` | `fibres ...`, `lane id x1 x2` |
| Connector | a peach coin, one on each ledger, never between them | `art-coin`, `art-coin-dot` | `coin x y` |
| Bundle | a dashed pill holding its message stars | `art-bundle` | `bundle x y n` |
| Proof check, acceptance | a pink ring | `art-ring` | `ring x y r` |
| Message in motion | a glowing star travelling along a path (simulations and the hero only) | `art-move` (offset-path), `art-halo` | - |

Structural drawings (state machines, lists, file maps, tables, step chains) keep their boxes
(`d-a`, `d-b`, `d-surface` ...); the theme already gives those the website's glass and glow.
Use the vocabulary where the drawing shows actors and what passes between them.

## Making a figure

1. Write the claim first: what the drawing shows, in one sentence the cited section supports.
2. Lay out actors with the table above. Run
   `node .claude/skills/clpr-figure/art.mjs <shape> ...` from the repository root and paste the
   markup into the figure's `<svg>`; it is plain static SVG, as `docs/figures.md` requires.
   Prefix any `id` (a lane gradient) with the figure's name.
3. Labels stay inside their ledger with room to spare, or sit outside it, never across the
   membrane. Nothing sits between two ledgers except the endpoints and the channel.
4. Simulations may move things: put `art-move` on the moving element with `offset-path`,
   `--dur`, `--delay` and `--rest` in its style; reduced motion parks it at `--rest`.

## Checking it

- `kse preview-diagram` loads only the engine's stylesheet, so it draws `art-*` shapes unstyled:
  use it for layout, not for the look.
- `pnpm run build`, then `node checks/browser/check-diagram-text.mjs` in `explainer/`: every
  label keeps its room inside its box, and inside its ledger orb (circle or ellipse), in figures,
  simulations and the hero.
- Look at it, at desktop and at 400px: `pnpm exec kse shot <path> <out.png> 1440 false` and
  `... 400 false`. For motion, pause the animations at several moments and look at each frame.
- `pnpm run verify` before calling it done.

## Common mistakes

| Mistake | Fix |
|---|---|
| A connector or a coin drawn between the ledgers | One on each ledger: each side's CLPR Service holds its funds |
| Nothing drawn between the ledgers, captioned "nothing in between" | Draw the endpoints and the channel; they relay, they cannot forge |
| A verifier drawn as a box the bundle passes through before the service | The CLPR Service calls the verifier; draw the bundle reaching the service |
| A label crossing a ledger's membrane | Move it inside with room, or outside |
| Translucent fills over lines | The theme's box fills are opaque; draw lines first, boxes after |
