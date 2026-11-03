# Simulations

Every interactive piece on the site is one `.astro` file under `src/components/sims/`. This is
the catalogue, followed by the conventions for writing a new one.

## Catalogue

| Component | Pages | What it shows | Props | Real or simplified? |
|---|---|---|---|---|
| `Ledger.astro` | general §ledger | Five copies of one ledger agreeing on a new line; a dissenting node is overruled; the line is sealed (consensus, finality) | `id` | Illustrative animation |
| `TrustDesigns.astro` | general §bridges | Three ways to carry a message (single relayer, 3-of-5 committee, CLPR) under three attacks (stolen keys, tampering, going offline); outcomes per design §2.3 | `id` | Outcomes follow the spec's trust model; no cryptography |
| `Journey.astro` | general §journey (`mode="plain"`), developers §journey (`mode="both"`) | The 28-step round trip, both directions, with diagram nodes lighting up, an evidence badge per step (event / in tx / inferred), a step list and narration | `mode` = `plain` \| `protocol` \| `both`, `id` | Narration and evidence classes from `src/data/journey.json`; timings are narrative, not measured |
| `RunningHash.astro` | general §running-hash, developers §queue (`detail`) | Five messages chained by SHA-256; tamper, drop, swap or insert and watch the chain diverge from the proven anchor | `id`, `detail` | **Real SHA-256** via WebCrypto over the UTF-8 text (the protocol hashes protobuf bytes; the page says so) |
| `Money.astro` | general §money, developers §connectors (`detail`) | Who pays whom on delivery: gas, margin, connector balance, a balance meter; `CONNECTOR_UNDERFUNDED` and `CONNECTOR_NOT_FOUND` paths with slashing; `detail` adds the charge formula | `id`, `detail` | Formula from spec §4.6; the fine amount is illustrative (platform-specific in the spec) |
| `Failures.astro` | general §failures, developers §recovery | A picker of thirteen failure modes with what happens, who pays, channel state, recovery and the source | `id` | Text from design §5, §3.3.4, §2.3 and spec §4.2/§4.5/§4.6 |
| `ChannelLife.astro` | developers §channels (`detail`) | The six-state channel lifecycle; only the transitions the spec allows are enabled in each state | `id`, `detail` | Transitions from spec §2.1.1 |
| `Extend.astro` | general §extend, developers §extend | The eight steps for adding a new ledger type, components appearing on a two-ledger diagram | `id` | Steps from the organization profile README |
| `Architecture.astro` | general §lives, developers §implementations (`detail`) | A tappable map of the whole system: spec, native and contract services, verifiers, endpoints, sync protocol, connectors, applications, lab; each card names where the code lives | `id`, `detail` | Facts from the repositories' own READMEs and docs, pinned |
| `CommitReveal.astro` | developers §channels | Channel registration across two ledgers by commit-reveal, with an attacker who sees only the commitment; a connector tab with the same trick | `id` | **Real Keccak-256** implemented and self-tested in the component; the "public key" is random bytes standing in for a secp256k1 key |
| `SyncCycle.astro` | developers §sync | One sync cycle as a sequence diagram: four messages, editable queue state, the bundle the responder builds (a proper prefix of the backlog when capped) | `id` | Field semantics from spec §1.5; numbers are illustrative |
| `BundleVerify.astro` | developers §verify | Spec §4.2 applied to one concrete bundle, step by step, with fault injection (verifier revert, no progress, oversized, gap, tampered, out-of-order reply) | `id` | **Real SHA-256** for the running hash; channel state values are illustrative |
| `Ordering.astro` | developers §ordering | The worked example from design §3.2.8: acks vs responses, retained Data Messages, the mismatch that pauses the channel | `id` | Logic from spec §4.4/§4.5 |
| `TrustAnchor.astro` | developers §verifiers | Trust-anchor rotation under single-authority and window encodings; transition bundles, outages and catch-up; concrete QBFT and Hiero encodings | `id` | Rules from design §3.1.5, spec §3.2 and the verifier documents; epoch timeline is illustrative |
| `NetworkShapes.astro` | general §shapes | Pick a shape built from pairs (pair, star, mesh, private to public), then a sender and a receiver; the log says whether a channel joins them directly and that nothing routes | `id` | The site's illustration (design §2.1, §3.1.2) |
| `AtomicSwap.astro` | general §patterns | Three ledgers prepare, then commit or roll back, as ordinary messages with replies; run with everyone ready or with one ledger unable | `id` | The site's illustration of design §3.4.3 |
| `Stories.astro` | general §who, developers §operate | The four cross-role scenarios of design §4.7 as step-throughs, roles lit as they act; steps come from `roles.json` | `id` | Data-driven |

## Conventions (copy an existing sim)

Structure:

```astro
---
const { id = 'my-thing-sim', detail = false } = Astro.props as { id?: string; detail?: boolean };
---
<div class="sim mything" id={id}>
  <div class="sim__head"><div><span class="kind">Simulation</span><h3>Title</h3></div><span class="pill grey" data-role="status">…</span></div>
  <div class="sim__body">… inline SVG with a viewBox, or plain HTML …</div>
  <div class="sim__controls">… <button class="btn" data-role="…"> …</div>
  <div class="sim__log" data-role="log">…</div>
</div>
<script>
  for (const root of Array.from(document.querySelectorAll<HTMLElement>('.sim.mything'))) {
    // hooks by data-role, never by id, so two instances on one page both work
  }
</script>
```

Rules:

- **Theme tokens only.** SVG fills and strokes use `d-a d-b d-c d-ok d-bad d-money d-grey
  d-surface`; text uses `t`, `t small`, `t b`, `t center`, `t mono`, `t muted`. Buttons use
  `.btn` (`.primary`, `.danger`, `aria-pressed`), sliders `.range`, badges `.pill`, state cards
  `.result`, step cards `.step-card`, step lists `.step-list`.
- **Two instances must coexist.** Default `id` ends in `-sim`; the page passes another id when
  it uses the sim twice. Scripts loop over `.sim.<name>`.
- **Server-render the text.** Narration, cards and lists are rendered at build time from data
  (JSON or an array in the frontmatter) and only toggled client-side. The page is complete
  without JavaScript; scripts add motion and interaction.
- **Cite.** Each sim prints its sources (a `Source:` line or per-step refs) using the pinned
  helpers. `kse check-anchors` verifies the references exist upstream.
- **Say what is simplified.** If the sim hashes text instead of protobuf, uses a fixed fine, or
  invents an epoch length, it says so on screen.
- **Phone width and both themes.** `viewBox` SVGs scale; text at 11 px or larger; wrap very wide
  drawings in `<Figure>`. Check with `pnpm exec kse overflow <path> 400` and a screenshot in
  dark mode (`DARK=1 pnpm exec kse shot …`).
- **Accessibility.** Native `<button>`s, `aria-pressed` on toggles, `role="img"` with an
  `aria-label` on SVGs, keyboard handlers on clickable SVG groups (`tabindex="0"`, Enter/Space).
- **No external resources, no storage, no fetches.** Everything the sim needs is in the file.
- **Never scroll the window.** `scrollIntoView` moves every scrollable ancestor, including the
  page; use `scrollListTo(list, item)` from `@kse/lib/scroll` to keep a list row visible.
- **`hidden` inside SVG** only works because `global.css` has `svg [hidden] { display: none }`;
  toggle it with `toggleAttribute('hidden', …)`, not the `.hidden` property, which SVG elements
  do not have.
- **Shared chrome** in `global.css`: `.sim__track` (progress; `--p` or the `.seg` variant),
  `.sim__scroll` + `.sim__scroll-note` (a phone scroll frame for a wide drawing), `.sim__log .line`
  (a mono first line), `.sim__controls .kicker` and `.group`, `.pill.pulse`, `li.done` in a step
  list, `--card-min` on `.step-card`, `aria-busy` on the root during a timed run. Component-specific
  styling goes in the component's own `<style>` block, scoped to `.sim.<name>`.
- **Drawings wider than the column.** The column is 840px. The journey (920) and the architecture
  map (940) keep their `min-width` only below 1240px. From there `site-theme.css` lets the sim spill
  into the right margin and the drawing fits it, so neither scrolls on a desktop screen. A new wide
  simulation joins the same two rules.

## Motion in the website's style

A simulation or the hero may move a message the way the landing page does: a glowing star with
class `art-move` and an `offset-path` in its style travels the path; `--dur`, `--delay` and
`--rest` set its timing and where it rests under reduced motion (site-theme.css). Static figures
never move. Shapes come from the `clpr-figure` skill's vocabulary (docs/figures.md).

## Testing a sim

0. `pnpm run check:browser` drives every simulation on both pages and fails on errors, on a click
   that moves the window, or on SVG text under 10px at 400px.
1. `pnpm run build`.
2. `pnpm exec kse shot /developers/ out.png 1280 false '#my-thing-sim [data-role="next"]|#my-thing-sim [data-role="next"]'`
   drives it a few steps and reports console errors; open the PNG.
3. `DARK=1 pnpm exec kse shot …` for dark mode; `pnpm exec kse overflow /developers/ 400` for
   phones.
4. If the sim computes something (a hash, a fee), verify one value independently (Python's
   `hashlib`, a calculator) and keep the self-test in the component if there is one.
