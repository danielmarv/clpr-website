# Changelog

Newest first. Each sync entry lists the upstream commit range it was reviewed against.

## 2026-11-02 — footer and contents match the website's

Same upstream pins, content unchanged. The footer now draws everything the website's footer does:
the channel along its top edge, the partner logos (the website's `public/logos/` files, inlined as
data URLs) instead of their names, the CLPR wordmark that follows the pointer, the website's arrow
icons and its spacing. The explainer's status and licence lines moved into the legal line at the
bottom.

The contents list (the sidebar, and the "Start here" box on phones) sets its labels as the
website's eyebrows, Sora 500 in sentence case, instead of tracked uppercase Plex Mono at 600, a
weight the build does not ship and the browser was synthesising. The current section no longer
turns bold, so its line does not rewrap as the reader moves.

## 2026-11-01 — moved into the CLPR website repository

Same upstream pins, content unchanged. The source now lives in `explainer/` of the website
repository and is built into `/plumbing/` by the website's `pnpm build`; the standalone Netlify and
GitHub Pages deployments are retired (decisions.md, D17). Earlier the same day the pages took on
the website's theme (D16) and the site engine moved to npm as `knowledge-site-engine`.

## 2026-10-01 — acceptance audit (redesign stage 5)

Same upstream pins. First full run of `clpr-audit` over both pages and every data table
(report in `.upstream/audit-2026-10-01.md`, git-ignored): no drifted statement; twelve unsupported
statements and three non-verbatim quotes, all fixed here.

- The Hiero CLPR Service is described only as the pinned sources describe it: a native service inside
  the consensus node, reachable at the system address, with its state in the node's Merkle tree.
  The claims that it is written in Java, has account `0.0.366`, writes no EVM logs, has no bytecode
  and defeats gas estimation had no pinned source and are gone (developer page §4 and §20, the
  component catalogue, the architecture figure).
- The `PingPong` echo contract is introduced as this page's own example rather than attributed to
  external documentation. Three quotations now match their passages word for word, and the one
  inline "(design §3.1.5)" attribution left in the prose became a reference on its section.
- The CLPR Service admin row names the authority in the design document's words: the network
  operator or governing body on Hiero, whoever controls the CLPR Service contract on EVM.
- README images regenerated from the redesigned pages.

## 2026-10-01 — audit and drift skills (redesign stage 4)

Same upstream pins.

- Two report-only skills join `clpr-sync`: `clpr-drift` explains what moved upstream and which site
  sections, data rows and components it touches; `clpr-audit` judges every statement on both pages
  and every data row against the passages its refs cite at the pinned commits (matches, drifted,
  unsupported, illustration, quote-mismatch). `scripts/audit-input.mjs` pairs the text with the
  passages mechanically. `clpr-sync` now runs drift first and audit last, with zero drifted and zero
  unsupported findings as the bar before a changelog entry.
- The writing guide gains the two rules the redesign rests on: state, do not attribute; and
  illustrations say so. Decisions D14 and D15 record why.

## 2026-10-01 — the developer page as a learning path (redesign stage 3)

Same upstream pins.

- The developer page is reordered into 23 sections in 6 acts that build up: what you can build and
  the mental model; the API, the 28 steps and the queue; bundles, verification, ordering, identity,
  channels, endpoints and sync; verifiers, connectors, recovery and security; roles and scenarios,
  adding a ledger, the reference implementations; evolution, governance, glossary. New sections:
  "What CLPR is for, and what you can build", "The 28 steps, in protocol terms", "Roles, operations
  and four scenarios" (roles from data, plus the `Stories` step-through), "Adding a ledger: the
  verifier developer" (with the ledgers table).
- Every "Source:" line under a heading is generated from the registry; the hand-written ones are
  gone. Prose no longer attributes claims to the documents; the one note at the top explains the
  reference lines, and the "In the EVM reference code" and "Not settled yet" labels carry the two
  kinds of caveat.
- Figures the general page retired move to the developer page (`CommitRevealRegistration`,
  `ProvenManifest`, `PullNotPush`, `EndpointLoop`, `VettingChain`, `SpecDocumentMap`,
  `LabLifecycle`, `AdrLifecycle`); `PhantomMessage`, used by both pages, lives in
  `diagrams/shared/`. `VerifierServiceSplit` (a duplicate of `VerifierVsService`), `SpecRef` and
  `Wide` are removed.
- New check `scripts/check-orphans.mjs` (in `npm run check`): every component is imported somewhere.
- `docs/simulations.md` now locates simulations by section id, so renumbering cannot stale it.

## 2026-10-01 — the general page as a 10,000-foot introduction (redesign stage 2)

Same upstream pins. Plan: `docs/superpowers/plans/2026-10-01-redesign-stage-2-general-page.md`.

- The general page is rewritten as an introduction for readers with no technical background: 16
  sections in 5 acts (from 19), 5,376 words (from 8,477), about 25 minutes. No sentence attributes
  a claim to a document; the hero line and the footer carry the commits. Sections on channels,
  endpoints, verifiers, the specification process and the lab leave the page (their MDX is parked
  in `docs/superpowers/plans/2026-10-01-parked-general-sections.md` for stage 3).
- New sections: what makes CLPR different (six things it does without), four things people build
  with it, shapes of a network (star, mesh, private to public), and who runs what; a new act, "What
  you can build".
- Six new figures (`SixDifferences`, `FourPatterns`, `StarOfPairs`, `MeshOfPairs`,
  `PrivateToPublic`, `RolesWheel`) and three new simulations (`NetworkShapes`, `AtomicSwap`,
  `Stories`, the last driven by the four cross-role scenarios in `roles.json`).
- Lists and tables that change when CLPR changes render from data: `Patterns`, `Roles`,
  `LedgersTable`, `OpenIssues`, `Repos`.
- The provenance footer names the three sections that contain the site's own illustrations
  (the usual fixes, the patterns' simulation, the shapes), generated from the registry's
  `illustration` flags. The general page renders no inline source lines at all.
- Callout labels: "In the EVM reference code" and "Not settled yet" replace "Reference
  implementation" and "Open question".

## 2026-10-01 — the hero trailer shows two endpoints (redesign stage 1)

Same upstream pins. Plan: `docs/superpowers/plans/2026-10-01-redesign-stage-1-trailer.md`.

- The twelve-second loop in both heroes drew one endpoint between the ledgers, as if the two
  shared it. It now draws two: Ledger A's as a tab on its frame, labelled "in the node" (on a Hiero
  network every consensus node is an endpoint), and Ledger B's as a separate box labelled "a
  program" (the EVM endpoint is a separate relay), joined to its ledger by a dashed line. The
  message hops application → A's endpoint → B's endpoint → B's verifier → application, and the
  reply comes back the same way; the phase captions and the reduced-motion frame follow.
- The frame stays 560 wide so that 16px labels render at 10.5px on a 400px screen, the floor
  `check-sims.mjs` enforces.

## 2026-10-01 — data layer and checks (redesign stage 0)

Same upstream pins. Design record: `docs/superpowers/specs/2026-10-01-two-pages-redesign-design.md`;
plan: `docs/superpowers/plans/2026-10-01-redesign-stage-0-data-layer.md`.

- Every section in `src/data/sections.json` now carries the upstream references that back it, and
  the facts that change when CLPR changes moved into data rows with references: `catalog.json`
  (the components on the Architecture map), `ledgers.json` (verifiers: two documented, two code
  only, one mock), `patterns.json`, `roles.json` (six roles, four cross-role scenarios),
  `open.json` (the design document's flagged passages), `failures.json`, `cast.json`, `adrs.json`.
  The Architecture map, the failures picker, the cast cards and both ADR tables render from them.
- New check `scripts/check-data.mjs` (in `npm run check`): row shape and reference order, source ids,
  and, with `.upstream/` present, inventories against upstream (verifier directories, ADR files,
  §3.4 and §4 headings, `‼️` passages). A new verifier or ADR upstream now fails the build until
  the site describes it.
- `docs/content-map.md` is generated by `scripts/content-map.mjs` from those references; the check
  fails when it is stale. 142 upstream references mapped (513 resolve in the anchor check, up from 418).
- The developer page's "Source:" lines are rendered from the registry (`Refs.astro`), not written by
  hand; the general page renders no inline source lines (figures included) and cites its sources in
  the footer. Section numbers in prose go through `<SecRef id>`.
- `npm run verify` runs every gate in one command; `scripts/overflow.mjs` now exits 1 on overflow.
- `check-provenance.mjs` also verifies act `first` pointers, unique section titles and the presence
  of `refs`.

## 2026-10-01 — the specification's words are the names

Same upstream pins.

- The general page, the journey narration, the cast cards, the hero trailer and every general-page
  figure and simulation now call things what the specification calls them: endpoint, CLPR Service,
  outbound queue, message id, running hash, trust anchor, endpoint manifest, commit and reveal,
  ledger. The words the site had invented for them (courier, post office, outbox, ticket number,
  fingerprint, signature card, address book, sealed envelope, notebook) are gone, except in three
  one-time comparisons that say they are comparisons. Each term is still explained in plain words
  where it first appears.
- Renamed to match: `Notebook.astro` → `Ledger.astro`, `CourierCarriesProof` →
  `EndpointCarriesProof`, `CourierLoop` → `EndpointLoop`, `ProvenAddressBook` → `ProvenManifest`,
  `CommitRevealEnvelope` → `CommitRevealRegistration`; section ids `fingerprint` → `running-hash`
  and `couriers` → `endpoints`.
- New check: `scripts/check-vocab.mjs`, run by `npm run check`, fails when site content uses one of
  those words outside a line marked `vocab-allow`. The rule is recorded in `CLAUDE.md`, the writing
  guide, the decision log (D12) and the `clpr-sync` skill, so a future sync cannot reintroduce them.

## 2026-10-01 — visual refresh, figures, plainer language

Same upstream pins. Design record: `docs/superpowers/specs/2026-09-30-visual-refresh-design.md`.

- Fixed: `/developers/` opened scrolled to section 9. The bundle verification simulation called
  `scrollIntoView` on its step list while initialising, which also scrolled the window. Both
  step-list sims now scroll only their own list (`src/lib/scroll.ts`); `scripts/check-scroll.mjs`
  guards against a repeat.
- Fixed: the trust-designs simulation drew all three designs on top of each other (the `hidden`
  attribute does nothing inside SVG; `global.css` now styles `svg [hidden]`, and the sim toggles
  the attribute).
- Look: warm paper and ink in both themes, serif display and body from system font stacks, mono
  kickers and labels, a hero with route chips, acts grouping the sections (registered in
  `sections.json`), a "Section N of M" kicker, a table of contents that ticks off sections read,
  figure plates, instrument-panel simulations with offset shadows, key-point pull-quotes, a
  once-only reveal of plates on scroll (off under reduced motion). The light `--b` and `--ok`
  tokens and `--text-3` were adjusted for contrast on the warmer paper.
- Figures: 49 static figure components under `src/components/diagrams/<page>/`, each inside the
  new `Figure` plate with a bold lead, a caption, a pinned source line and a claim tag; 27 placed on
  the general page and 25 on the developer page (three components are shared). Every section of
  both pages now has at least one figure or simulation. The three older inline drawings were
  replaced. Conventions in `docs/figures.md`; preview without a build with
  `scripts/preview-diagram.mjs`.
- Simulations: all fourteen polished (moving tokens, progress tracks, mono log lines, drawn-on
  edges, pinned card heights so controls stop moving, phone scroll frames at native size,
  disabled Prev/Next at the ends, keyboard-operable journey list) and a list of bugs fixed
  (`ChannelLife` `detail` was dead, `Money` was empty before JavaScript ran, `Notebook` Reset was
  ignored during a run, `Ordering` purged rows a click late, `Architecture` had an invisible
  selection halo in dark mode, among others). The journey simulation now also renders on the
  developer page's first section in `both` mode, as the docs always said.
- Hero trailer: a twelve-second wordless loop of the journey (`JourneyTrailer.astro`) under the
  lede of both pages, plain labels on the general page and protocol labels on the developer page;
  pauses on tap, hover and off screen, static last frame under reduced motion, links to the full
  simulation.
- Language: a plain-language pass over the general page (55 sentence rewrites applied from the
  scouts' notes, 17 trimmed, 1 rejected; every claim, term of art, quotation and link kept) and
  one key point per section on both pages. Em dashes replaced outside quotations.
- Tooling: `scripts/check-sims.mjs` drives every simulation on both pages and checks phone text
  size; `npm run check:browser` runs it with the scroll check. The browser scripts fall back to
  Playwright's own Chromium when the preinstalled Linux path is absent and open pages with
  reduced motion.
- Repository renamed to `plumbing-of-clpr` (package name, default site URL, sync skill, git remote).
- Not verified: Firefox and Safari rendering, Windows and Android serif fallbacks, print.

## 2026-10-01 — documentation

Same upstream pins.

- `docs/`: index, architecture, content model, writing guide, simulation catalogue, provenance,
  syncing, deployment, testing, decisions; `content-map.md` moved there. Screenshots under
  `docs/images/`.
- README rewritten as a front page; CLAUDE.md points at the docs.
- `clpr-sync` skill: standalone-run preamble (clone if needed, `sync/<date>` branch), PR step,
  report-back step; npm aliases `check:anchors`, `sync:status`, `shot`.

## 2026-10-01 — whole-system coverage

Same upstream pins as the initial release.

- Journey simulation now runs in both directions (`journey.json` gains `reverse`, EVM → Hiero),
  showing where the EVM contract leaves `MessageQueued` / `ReplyDelivered` evidence that the
  native service does not.
- New `Architecture.astro` map of the whole system (spec, native and contract services,
  verifiers, endpoints, sync protocol, connectors, applications, lab) with pinned links; used on
  both pages.
- General page grows from 14 to 19 sections: couriers (manifests, sync, pre-verify, private
  networks), verifiers (Hiero vs QBFT in plain words, trust anchor, commitment levels), the six
  roles, the pieces, and how the specification is written and changed (ADR table).
- Developer page: Hiero verifier claims aligned with the pinned Solidity (`TSSVerifier` with
  EIP-2537, native path only per the spec's verifier docs); endpoint paragraph expanded from its
  `docs/`; architecture map in the implementations section.
- `check-anchors.mjs` scans `src/` only; inline `code` wraps on phones; table columns relaxed.

## 2026-09-30 — initial release

Upstream pins: clpr-spec 945082d (2026-08-31), clpr-smart-contracts 276c8d5 (2026-09-01),
clpr-endpoint 2ccd48d (2026-09-01), governance 498d4f4 (2026-09-17), .github 263fb39 (2026-09-22).

- General page (14 sections) with eight simulations: consensus notebook, trust designs, the
  28-step journey, running hash (real SHA-256), connector economics, failure picker, channel
  lifecycle, adding a ledger.
- Developer page (20 sections) adding commit-reveal registration (real Keccak-256), the sync
  cycle, bundle verification step-through with fault injection, response ordering, trust-anchor
  rotation, plus the shared sims in detail mode.
- Provenance manifest, pinned-link helpers, provenance/link/anchor checks, upstream drift report
  and re-pin scripts, the `clpr-sync` skill, weekly upstream-watch workflow, Netlify and GitHub
  Pages configuration.
- Known upstream ambiguities noted on the developer page: verifier "fixed at registration time
  (phase 1)" vs. supplied at `completeChannel`; whether a stale BundleRequest yields a filtered or
  a rejected bundle (site follows spec §4.2 step 3); `initial_trust_anchor_id` empty for Hiero
  while the spec says non-empty iff the anchor is; `verifiers/qbft/verifier_contract.md`
  describing `channelContext` differently from the spec and the Solidity.
