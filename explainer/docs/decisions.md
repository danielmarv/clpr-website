# Decisions

Short records of the choices that shape the repository, in the spirit of the ADRs the CLPR
specification itself uses. Newest last.

## D1. Two pages, one centrepiece

Readers split cleanly into people who want to understand what CLPR is and people who will build
on it. One page cannot serve both without boring one and losing the other. Both pages share the
same arc and the same simulations, with the 28-step message journey as the centrepiece of each,
so a reader can move from one page to the other and recognize where they are.

## D2. Astro + MDX, no framework, no runtime dependencies

Content with embedded interactive components wants MDX. A static build keeps hosting trivial and
the pages fast. Writing the simulations in plain TypeScript inside each component, with inline
SVG and WebCrypto, means every simulation is one readable file with nothing to upgrade, and the
supply chain is Astro alone. The cost is some hand-written animation code; the benefit is
longevity.

## D3. Pinned commits, and a build that fails on drift

The specification is explicitly unfinished. Linking to `main` would let the text and its
evidence diverge without anyone noticing. Every claim is therefore written against commits
recorded in one manifest, every upstream link embeds the commit, both pages display the table,
and `check-provenance.mjs` fails the build on any branch link or any mismatch. The sync
procedure moves the pins only after a review.

## D4. Three kinds of claim, labelled

The spec, the reference implementation and the open questions are three different sources of
truth that often disagree. The pages label which one a sentence comes from (`spec`, `impl`,
`open` callouts; `event` / `intx` / `inferred` per journey step) so a reader can weigh it, and so
a sync can tell what a given upstream change invalidates.

## D5. Neutral, donation-ready voice

The site is written as if it will be contributed to the lab: Apache-2.0 code, CC BY 4.0 prose,
DCO sign-off, no personal branding, no marketing claims, no numbers without a source, and an
explicit statement that it is independent. If the lab wants it, nothing needs rewriting; if it
does not, nothing is lost.

## D6. Content as data where it repeats

The 28 journey steps, the section registry and the source manifest are JSON, because they are
consumed in more than one place (two pages, the TOC, the checks, the sync scripts) and because a
sync should edit narration without touching animation code.

## D7. Real cryptography in the browser where it is cheap

The running-hash and bundle-verification simulations compute real SHA-256; the registration
simulation computes real Keccak-256 with a self-test. Showing genuine values makes the "one
proof covers a batch" and "commitment hides the id" arguments concrete instead of asserted. The
simplifications that remain (UTF-8 text instead of protobuf bytes, random bytes for a public key)
are stated on screen.

## D8. The sync is a procedure, not a pipeline

The scripts fetch, diff, report, pin and check. They deliberately do not edit prose. Deciding
what a renumbered section or a new ADR means for a sentence on the page is a reading task; the
`clpr-sync` skill makes that task explicit and repeatable, and a human reviews the result.

## D9. Phone width and both themes are requirements, not polish

D16 made the pages dark only, in the website's theme; D21 brought both themes back, in the website's
palette.

Explainers get read on phones and shared into dark-mode apps. Every component uses theme tokens,
every wide drawing scrolls in its own frame, and `overflow.mjs` exists so a regression is a
one-line check rather than a complaint.

## D10. An editorial field guide, with system fonts

Superseded in part by D16: the website's self-hosted fonts and palette replaced the paper look.

The maintainer's earlier explainer ("The plumbing of money") set the target: warm paper, a serif
display face and a serif body, mono kickers and labels, acts grouping the sections, one captioned
figure per mechanism, instrument-panel simulations, and quiet motion that only reveals. This site
takes that look but keeps its own rules: system font stacks instead of web fonts (nothing is
fetched, D2), the seven actor tokens unchanged so colour keeps meaning an actor, both themes,
400px width, and captions that cite a pinned source. The chrome is ink only; `--a` is the single
house accent.

## D11. Figures are components, and claims are tagged on the figure

Static drawings live one per file under `src/components/diagrams/<page>/` inside `<Figure>`,
which carries the bold lead phrase, the caption, a source line built from the pinned helpers and
a `kind` tag (spec, implementation, open question, plain). That keeps the MDX readable, lets a
figure be previewed without a site build (`kse preview-diagram`), lets the anchor check
cover every source a figure cites, and gives a sync the same three labels on figures that it has
on callouts (D4).

## D12. The specification's words are the names; plain language explains them

An early draft of the general page renamed the protocol's parts to everyday words (courier, post
office, outbox, fingerprint, signature card, notebook) and introduced the specification's term
second, if at all. The maintainer rejected that on 2026-10-01: a reader who then opens the
specification, or the developer page, meets a vocabulary the general page never taught them, and
the site ends up defining terms CLPR does not have. The rule is now the other way round. Both
pages use the specification's own terms as the names; the general page explains each one in plain
words at first use; an everyday comparison may appear once, introduced as a comparison. Because a
sync rewrites content, and a different machine may run it, the rule is enforced mechanically:
`kse check-vocab` runs inside `pnpm run check` and fails on the retired words unless the
line is marked `vocab-allow`.

## D13. Upstream facts are data rows with references; prose states, the footer cites

Two things pushed the facts out of the prose. The maintainer wanted both pages to read as being
about CLPR rather than about a document ("the specification says" on every other line), with the
commits named once at the end. And a sync has to be mechanical: when upstream adds a verifier, an
ADR, a role or a pattern, something must fail until the site describes it. So the components,
ledgers, patterns, roles, open issues, failure cases, cast and ADRs are rows in `src/data/*.json`,
each with `refs` in the shape the anchor check already resolved for `journey.json`, and every
section in `sections.json` carries the refs that back it. `check-data.mjs` validates the rows and
compares the inventories with `.upstream/`. The developer page renders a section's refs under its
heading (`Refs.astro`, which renders nothing on the general page) and the general page cites its
sources in the provenance footer. `docs/content-map.md` is generated from the same refs and checked
in CI, so the sync skill's map cannot rot. Section numbers in prose go through `<SecRef>` for the
same reason: a number that lives in the registry cannot go stale.

## D14. Two pages, two jobs: an introduction and a learning path, neither quoting the documents

The general page had grown into a shorter copy of the developer page, and both read as a
commentary on the specification ("the specification says" on every other paragraph). On
2026-10-01 the maintainer set the two jobs apart: the general page is a 10,000-foot introduction
for readers with no technical background (why CLPR exists, how it differs from the usual bridge
designs, what people build with it, what shapes of network pairs allow, who runs what), and the
developer page builds up from what you can build to the full protocol. Neither attributes claims
in prose; the backing lives in the registry and the data rows, the developer page renders it under
each heading, the general page cites it once in the footer. The general page may add the site's
own illustrations, flagged in the registry and named in the footer, so a reader and the audit can
tell them from protocol text.

## D15. Three skills, one that edits

Accuracy against the pinned commits is the site's whole claim, so checking it got its own tools.
`clpr-drift` reports what moved upstream and what it touches, `clpr-audit` reports whether every
statement still matches the passage it cites (the pairing is mechanical, by `audit-input.mjs`;
the judgement is not), and only `clpr-sync` changes files or pins, running drift first and audit
last. The audit is not scheduled in CI: it is a model run, not a mechanical gate, so it runs with
a sync or on request, while the weekly watch stays mechanical.

## D16. The pages wear the CLPR website's theme

The explainer is served under the official CLPR website, so it looks like one site: the website's
dark indigo tokens, Sora and IBM Plex Mono, round panels, and static copies of its header and
footer. The look is applied as an override (`src/styles/site-theme.css` on top of the engine's
theme, header and footer through the engine layout's slots) rather than by editing figures or
simulations: the seven actor tokens keep their meaning, every drawing follows the new palette
through the tokens, and the engine stays generic for other packs. This supersedes the paper look
of D9 and D10 (and, until D21, their light theme); the 400px requirement and the no-fetch rule stand, with the
fonts self-hosted. When the website's look changes, this stylesheet and the two chrome components
change with it, and the copy under the website is rebuilt.

## D17. The explainer lives in the website's repository

**Decision.** The source moved from its own repository into `explainer/` of the CLPR website
repository, whose `pnpm build` builds it into `public/plumbing/` before `next build`. The website
repository is the single source of truth; the old repository is archived with a pointer here.

**Why.** LF Decentralized Trust asked for one umbrella, and a committed copy of a build drifts from
its source. One repository, one build, one deploy: the pages can never be stale relative to the site
that hosts them, and a change to either side is one pull request.

**Consequences.** The standalone Netlify and GitHub Pages deployments are gone; `pnpm exec astro
build` in `explainer/` still produces the standalone copy the gates check. The site engine comes
from npm (`knowledge-site-engine`), so the website needs no git access to build. Supersedes the
hand-off described in deployment.md before this move.

## D18. One audit for the whole repository

**Decision.** The `clpr-audit` skill covers everything the repository says about CLPR: both explainer
pages and their data, the website's landing page with its drawings and animations, and the
documents. The landing page's copy keeps its sources in `src/content/site-refs.json`, beside
`site.ts`, in the same ref shape the explainer's data uses; facts that change outside the pinned
repositories (implementation status, releases, licences) are listed there as live checks.

**Why.** The first whole-repository audit found the landing page claiming things the explainer had
long since corrected, such as "nothing in between" and immutable verifiers, and a Hiero status that
had changed upstream. An audit that reaches only one of two surfaces lets them disagree.

**Consequences.** A new or changed block in `site.ts` needs an entry in `site-refs.json`, or
`repo-input.mjs` reports it as unsupported. The overstatements the audit found are retired phrases
in `pack.json`, so `kse check-vocab` fails on them in the explainer.

## D19. The explainer draws in the website's vocabulary

**Decision.** The explainer's pages take the landing page's background, eyebrows, headings,
navigation pills and glass panels, and its drawings take the landing page's shapes for the actors:
ledger membranes with validator stars, glowing stars for services and applications, hexagon
endpoints, diamond verifiers, fibre channels, peach connector coins. The shapes are classes on plain
SVG (`art-*` in `src/styles/site-theme.css`) and `.claude/skills/clpr-figure/art.mjs` prints their
markup in the landing page's own geometry; nothing needs WebGL or a script.

**Why.** A reader who moves from the website into the explainer should see the same CLPR, not a
second site. Keeping figures as static markup keeps `export-single`, the anchor check and the
figure preview working, and the same drawing claims stay checkable.

**Consequences.** Structural drawings keep boxes, restyled; the box fills are opaque so a line
behind a box never crosses its label. `checks/browser/check-diagram-text.mjs` also holds labels
inside ledger orbs and checks the hero. `kse preview-diagram` draws the new shapes unstyled, so
the look is judged on the built page.

## D20. Corrections are kept by gates and by the guide, not by memory

**Decision.** Every claim the audits correct is recorded three ways: the wording goes into
`writing-guide.md` ("Things not to claim"), a repeatable phrasing goes into `retiredVocab` in
`pack.json` (so `kse check-vocab` fails on it in CI), and the `clpr-audit` and `clpr-sync` skills
name the rule they apply. The audit gained a `non-neutral` verdict, a framing check (CLPR is a
messaging protocol; meaning belongs to applications), a rule that Hiero is judged against HIP-1535
only, and a cross-surface consistency check.

**Why.** The explainer said the Hiero implementation was unmerged while the landing page said it
was merged, and both pages carried claims about other designs and about maturity that no pinned
source supports. A fix that lives only in a changed sentence comes back at the next sync.

**Consequences.** "Besu" is "EVM ledger" everywhere; the Hiero status is limited to what HIP-1535
states until a maintainer confirms the rest; the bridge comparison says "many bridges" and uses
only what the design and HIP-1535 say about them. If a later source supports a retired claim,
remove its pattern in the same change that adds the evidence.

## D21. Light by default, dark or the system's on request, as the website

**Decision.** The pages follow the website: light by default, with a Light/Dark/System switch in the
header. `<html data-theme>` holds the choice and `localStorage` key `theme` stores it (the key the
website and the engine use, so a choice carries across). No attribute is light, even when the system
is dark; dark applies for `dark`, and for `system` while the system is dark. `src/styles/site-theme.css`
sets `color-scheme` to light, dark or `light dark` for those three cases and writes every colour token
as a `light-dark(light, dark)` pair, so one declaration serves them all and the dark values are the
ones the pages had before. It also outranks the engine's rules that follow the system when there is
no attribute (its tokens, and Shiki's code colours). A head script in `Site.astro` restores a stored
`light`, `dark` or `system` before first paint (the engine's own only knows the first two) and sets
the browser's theme colour, which the switch keeps in step.

**Why.** The website gained a light theme and made it the default, with the system's setting as a
choice rather than the starting point. A visitor who chose a theme there would otherwise find the
other one here, and the same header would behave differently on the two halves of one site.

**Consequences.** On paper the actor colours are a step deeper (`--a` #5b45e0, `--b` #c0267a and so
on) so labels keep 4.5:1, white star and validator cores take their tone, and the dark actor bodies
(endpoints, verifiers, coins) turn white. Lane gradients are recoloured in CSS by their `-lane` id, so
`art.mjs` output follows the theme. The header shows the pill navigation from 70rem and drops the
"Cross Ledger Protocol" line, so the switch fits beside GitHub and the call to action. The engine's
gates emulate only the system's setting, so `DARK=1` now drives the light default under a dark system; verify
keeps that pass for the simulations under a dark system (it does not itself assert that the page stayed
light). Dark itself is checked by
`pnpm run check:dark`, which verify runs last: the simulation, diagram text and 400px overflow gates
again, with `checks/browser/theme-preload.cjs` (loaded through `NODE_OPTIONS`, so the engine stays
untouched) storing `THEME=dark` in every page they open and failing the run if a page did not take it.
For a dark screenshot, click `[data-theme-choice="dark"]` first or use the same preload. Look at both
themes when changing a figure.
