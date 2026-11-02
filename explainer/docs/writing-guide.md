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
| outbound queue | where a ledger keeps the messages it has sent until they are answered | outbound queue, per channel, sliced per connector |
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
| paused | the channel stops accepting bundles until a human acts | `PAUSED` channel status |

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
- That a step with no on-chain trace was "observed". The journey marks those `inferred`.
- That the native Hiero implementation is merged or production. At the pinned commit it is on a
  feature branch pending approval; say that, dated to the pin.
- Anything about ledgers the spec does not document as supported. The contracts repository
  contains verifier code for other proof systems; the site says it "carries verifier code" and
  stops there.

## Editing checklist

1. Is every protocol statement one of: spec, implementation, open? Is it labelled?
2. Does every upstream link go through `design()`, `spec()`, `sol()` or `pinned()`?
3. Did a section number change? Search the MDX for `section N` references.
4. Did a journey step's narration change? Both `plain` and `protocol` must stay true, in both
   directions where the step exists in both.
5. `pnpm test` and `pnpm exec kse check-anchors` pass; a screenshot at 400 px shows no
   horizontal scroll.
6. No word of our own names a protocol part. `pnpm exec kse check-vocab` (also run by
   `pnpm run check`) lists any that slipped in.

## Content rules shared with every engine pack

- Sources are the pinned repositories only: code, documentation, tests and configuration at the pinned commits.
- No provenance commentary and no certainty labels in the pages. `pack.json` `voice.bannedPhrases` enforces this once configured
  (the journey's evidence markers predate the rule; remove them before enabling the gate here).
- Design intent that the code does not contain is labelled as such or left out; where a note and the code differ, follow the code.
- Flows cite `path:line` with a `symbol` that is on that line (`kse check-code-refs`).

The full rules are in the engine's `docs/authoring.md`.
