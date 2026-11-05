# Writing guide

The site is written to be contributed to the lab one day. That sets the voice.

## Voice

- **Neutral and spec-faithful.** Describe the protocol; do not sell it. No superlatives, no
  comparisons to named competitors, no numbers without a source. Where the specification is
  candid about limits or open questions, the site is at least as candid.
- **Alongside the website, and says so.** The footer and the "About this explainer" callout say
  the explainer is part of the CLPR website and that the specification remains the
  reference. Nothing on the pages claims to speak for the lab or the Linux Foundation.
- **The specification's words are the names.** Both pages call things what the specification
  calls them: endpoint, CLPR Service, outbound queue, message id, running hash, trust anchor,
  endpoint manifest, commit and reveal, ledger, channel, bundle, connector, verifier. The general
  page explains each term in plain words the first time it appears and then uses the term; it
  never substitutes a word of its own (no couriers, post offices, outboxes, ticket numbers,
  fingerprints, signature cards, address books, sealed envelopes or notebooks). An everyday
  comparison is welcome once, introduced as a comparison ("Compare a bank that keeps your
  signature card on file…"), on a line preceded by a `{/* vocab-allow */}` marker.
  `kse check-vocab`, part of `pnpm run check`, fails the build on anything else.
- **State, do not attribute.** The content is about CLPR, not about a document. No sentence says
  "the specification says", "the design document notes" or "the spec defines"; it states the fact,
  and the fact is backed by a ref in `src/data/sections.json` (rendered under the heading on the
  developer page) or a data row's `refs`. Quotation marks are for verbatim wording that matters.
  Two labelled caveats survive on the developer page: *In the EVM reference code* for where the
  Solidity differs from the text, and *Not settled yet* for what the authors leave open.
- **Illustrations say so.** The general page may add the site's own illustrations (the bridge
  comparison, the patterns' simulation mechanics, the network shapes). Their sections carry
  `illustration: true` in the registry, the provenance footer names them, and the audit treats
  their unbacked statements as illustrations rather than unsupported claims. Nowhere else may a
  statement lack a backing passage.
- **Short sentences, concrete nouns.** One idea per paragraph. Prefer "an endpoint cannot forge
  a signature" to abstractions about trust assumptions.
- **No filler.** No "it is worth noting", no "honest caveat", no rhetorical questions as
  transitions, no stacked em dashes. Say the thing.

## Terms and their plain explanations

One term, both pages. The middle column is the explanation the general page gives at first use;
the right column is what the developer page adds.

| Term | Plain explanation (general page) | Precise form (developer page) |
|---|---|---|
| ledger | a shared record that many computers keep identical copies of | ledger (CAIP-2 chain id + CLPR Service address) |
| validators; sealing a line | the computers that agree on each new line; agreement that cannot be undone | consensus, finality |
| state proof | the validators' signature on a summary of the ledger, plus the path to one line | state proof |
| endpoint | the program that carries messages and proofs between ledgers; it can delay, not forge | endpoint (relay); the sync protocol over gRPC |
| CLPR Service | the protocol's own part of each ledger: queues, channels, checks, payment | CLPR Service (native in Hiero nodes; Solidity on EVM) |
| outbound queue | where a ledger keeps the messages it has sent until they are answered | outbound queue, per channel (the EVM contracts cap each connector's share) |
| message id | the number a message is given when it is queued | message id (strictly increasing per channel) |
| running hash | a hash of the previous running hash and the message, so one proof covers a batch | `SHA-256(previous_running_hash ‖ serialized_payload)` |
| trust anchor | the other ledger's signing identity that a channel keeps on file | trust anchor (verifier-specific; changed only by proof) |
| verifier | the small program that checks one kind of proof | verifier contract / native verifier |
| connector | the account that agrees to pay for a message | connector (approval, charge, stake, slashing) |
| reply | the one answer every accepted message gets | Response Message (`ClprMessageReply`) |
| control message | a message the protocol sends itself to update settings | Control Message (`ConfigUpdate`) |
| bundle | a batch of messages with one proof | bundle |
| endpoint manifest | each ledger's on-chain list of endpoint addresses | endpoint manifest (versioned, proven per channel) |
| commit, reveal | the two phases of registering a channel: post a hash, then prove the key | commit-reveal registration |
| paused | the channel stops taking new messages and rejects out-of-order replies until the peer corrects them, then resumes by itself | `PAUSED` channel status |

## Labelling claims

Use the callout kinds exactly as [content-model.md](content-model.md) defines them. The three
that matter most:

- `spec` — the text's own words. Quote with quotation marks when verbatim.
- `impl` — what the Solidity or Java code does. Always name the file or the repository document.
  If the implementation differs from the spec, say so in the same sentence.
- `open` — something the specification itself marks as unresolved (stake sizing, queue
  monopolization, admin incentives, and the thirteen "options to consider").

When the specification is ambiguous or two upstream documents disagree, describe the
disagreement rather than picking a side silently. The developer page does this in several places
(verifier "fixed at registration time" vs. supplied at `completeChannel`; the Hiero verifier
document vs. the Solidity). The changelog lists them so a maintainer can raise them upstream.

## Things not to claim

- That endpoints are "trustless", full stop. They are untrusted for safety; liveness depends on
  at least one honest endpoint per side.
- A single round-trip time or throughput figure. The site carries none; a demo measurement is not
  a specification property.
- That a step with no on-chain trace was "observed".
- That nothing sits between the two ledgers. Endpoints relay every bundle: they can delay a
  message but cannot forge one. Say "no bridge to trust", not "nothing in between".
- That a verifier is immutable or can never change. Its address is fixed for the Channel's
  lifetime, but the contract may sit behind an upgradeable proxy.
- That CLPR holds no funds. The CLPR Service is the custodian of Connector funds and endpoint
  bonds; what it never pools is user assets.
- A latency bound such as "as fast as consensus". A message waits for the source ledger's
  finality at the level the Channel's verifier accepts, an endpoint sync and the destination's
  consensus.
- The native Hiero implementation's status beyond what HIP-1535 states: Approved, and an opt-in
  service that networks which do not enable it are unaffected by. No pinned LFDT-CLPR repository
  records the pull request, the release or the default setting, and the organization profile's
  "pending approval" is out of date. Do not state a merge date, a release version or a default
  unless a maintainer has confirmed it and the clpr-audit skill's live check records it with a date.
- Anything about ledgers the spec does not document as supported. The contracts repository
  contains verifier code for other proof systems; the site says it "carries verifier code" and
  stops there.
- That CLPR "guarantees delivery". It guarantees that a payload was produced on the peer ledger and
  not altered (authenticity and integrity) and that messages arrive in order with exactly one
  response each; delivery itself needs at least one honest, reachable endpoint per side, and
  without one messages wait but are never forged.
- That CLPR interprets payloads or does application work. A message is opaque bytes; token
  transfers, contract calls, swaps and every other meaning belong to the applications at each end
  (design §3.4, which only outlines the patterns). Payloads are not confidential and must be
  treated as untrusted input.
- That trust disappears. It moves to the ledgers, their CLPR Services and the Channel's verifier,
  and anyone can register a Channel with any verifier. Never write "as safe as the two ledgers,
  and not one bit less".
- Product or vendor names for a ledger type. Say "EVM ledger"; name QBFT or CometBFT only as the
  proof type an endpoint or verifier handles. Besu appears in the repositories as a test and
  deployment stack, not as the only target.
- Anything about other interledger designs that the design's executive summary and HIP-1535's
  Motivation do not say. Those two say interledger solutions often rely on an intermediary
  consensus layer, a federated bridge, an external validator set or a custodian. Write "many
  bridges", never "typical", "most" or "all", and give no figures, no failure counts and no
  "keeps failing".
- Maturity the sources do not claim. The site's host calls the lab a place for "very early open
  projects": the specification is still changing, some economic parameters are open and the
  endpoint is described as a prototype. Say "reference implementation", not "deployable today"
  or "production ready". The application patterns in design §3.4 are outlined, not specified.
- Who the maintainers are, beyond what the governance repository says (`teams.yml` lists people,
  not companies). Do not call CLPR "pending" a lab: it is one.
- That a Connector serves many Channels. A Connector is registered on one Channel; an operator's
  key can register Connectors on many.
- That nearly every failure rejects the bundle. A bundle whose proof, numbering or hashes fail is
  rejected and changes nothing; a failure in one message (connector missing or underfunded, an
  application error) becomes a failure reply and the rest of the bundle carries on; out-of-order
  replies pause the Channel.
- A formula or encoding without saying whether it is the specification's or the contracts'.
  Where they differ (the running-hash fold, the QBFT trust anchor) say which one the sentence
  describes.
- A drawing that puts the Verifier in front of the CLPR Service. The Endpoint submits a bundle
  to the CLPR Service, which calls the ledger's own Verifier Contract; each ledger has its own.
  A Connector sits beside the Service (its registration and locked stake are in the Service);
  the application calls the Service, which asks the Connector.
- A formula, a sync call or an ordering without saying whether it is the specification's or the
  pinned reference contracts' and endpoint's. The specification streams `sync` and updates all
  Channel state before dispatch; the reference endpoint serves a single call and the contracts
  charge the Connector after the call. Say which one the figure shows.
- That the sending side is never paid. A Response Message charges the source Connector the same
  way, and the charge goes to the submitter on that ledger.
- A reason for how ledgers or CLPR work that no source gives. Introduce it as "in general", or
  as the page's own explanation, or leave it out.

## Keep it stable

CLPR is still changing, and a page that records today's wire details has to be rewritten at every sync. The pages state what stays true across versions and leave the rest to the specification.

Write: the roles and what each does, the lifecycle of a channel, the trust chain and what is not trusted, the guarantees and the limits, and why a design choice was made.

Leave to the specification: field names and numbers, struct, interface and ABI layouts, state tree tags, fixed addresses, port numbers and defaults, formulas and parameters, how a hash is folded, class and module names of an implementation, and lists of where an implementation differs from the text.

When a sync changes such a detail, delete it from the page if the sentence still reads without it. Update it only when a reader cannot follow the concept without it. `node checks/check-detail.mjs` (part of `pnpm run check`) fails on field numbers, fixed addresses, port numbers, tag numbers and code blocks that lay out fields or an interface. A deliberate exception carries `detail-allow: <reason>` on its line or the line before; the weekly upstream report lists them. Figures, simulations and journey rows that name fields show the pinned snapshot, which the notice at the top of the developer page says.

## LFDT website requirements

The site speaks for an LF Decentralized Trust lab, and LFDT's website requirements for projects and labs apply to every page. `scripts/check-site-policy.mjs` (run from the repository root with `pnpm run check:policy`, and in CI) checks the mechanical parts.

- Say "lab", not "project". Show the affiliation line "An LF Decentralized Trust Lab", the LFDT logo and the Linux Foundation legal text, word for word, in the footer.
- No promotion of commercial offerings, no sales leads, no vendor programs or registration links, no testimonials or quotes used as endorsement, no ads.
- No hype or hyperbole: no slogans, no "no single point of failure", no claim the specification does not support. The trust model is the ledgers, the CLPR Services and the Verifier Contracts, and Verifier Contracts should be immutable.
- Never hyphenate "open source".
- An organization's name or logo appears only where the page is talking about that organization, as a plain statement of fact, such as where CLPR originated. Link its home page, never a program or registration page.
- Link the Code of Conduct and the security reporting route.
- Quote a primary source (the LFDT release), not a news site, and end every blog post with `## Sources`.

## Editing checklist

1. Is every protocol statement one of: spec, implementation, open? Is it labelled?
2. Does every upstream link go through `design()`, `spec()`, `sol()` or `pinned()`?
3. Did a section number change? Search the MDX for `section N` references.
4. Did a journey step's narration change? Both `plain` and `protocol` must stay true, in both
   directions where the step exists in both.
5. `pnpm test` and `pnpm exec kse check-anchors` pass; a screenshot at 400 px shows no
   horizontal scroll.
6. If you corrected a claim that could come back, add its wording to `retiredVocab` in
   `src/data/pack.json` in the same change, so `kse check-vocab` fails on it from then on.
7. No word of our own names a protocol part. `pnpm exec kse check-vocab` (also run by
   `pnpm run check`) lists any that slipped in.
8. Did you add a field name, number, address, port or layout? Take it out (see Keep it stable).
9. From the repository root, `pnpm run check:policy` passes.

## Content rules shared with every engine pack

- Sources are the pinned repositories only: code, documentation, tests and configuration at the pinned commits.
- No provenance commentary and no certainty labels in the pages. `pack.json` `voice.bannedPhrases` enforces this once configured.
- Design intent that the code does not contain is labelled as such or left out; where a note and the code differ, follow the code.
- Flows cite `path:line` with a `symbol` that is on that line (`kse check-code-refs`).

The full rules are in the engine's `docs/authoring.md`.
