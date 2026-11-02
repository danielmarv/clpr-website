# Contributing

Thank you. The explainer lives in the CLPR website's repository and follows its rules; the
repository's own `CONTRIBUTING.md` covers sign-off and signed commits. This file adds what a good
change to the explainer looks like.

## Licensing and sign-off

- Code is licensed under the Apache License 2.0 and prose under CC BY 4.0.
- Every commit must carry a Developer Certificate of Origin sign-off: `git commit -s`, which adds
  `Signed-off-by: Your Name <you@example.com>`. By signing off you certify the
  [DCO](https://developercertificate.org/).
- Keep SPDX headers on new source files where the file type allows a comment.

## What a good change looks like

1. **It cites its source.** Any statement about the protocol links to the pinned upstream file
   through `src/lib/sources.ts` (`design()`, `spec()`, `sol()`, `pinned()`), never to a branch.
2. **It says what kind of claim it is.** Spec text, reference-implementation behaviour and open
   questions are labelled differently on the pages; keep them apart.
3. **It keeps both registers.** The general page uses everyday words and no protocol jargon in
   body text; the developer page is precise. A concept added to one usually belongs in the other
   at its own level.
4. **It builds and checks.** `pnpm test` runs the build, the provenance test and the link check;
   `pnpm run check:browser` drives every simulation and fails on an error, a click that moves the
   window, or unreadable text at phone width (needs a Chromium: `pnpm exec playwright install chromium`
   once). After a content change, `pnpm run sync:fetch && pnpm run check:anchors` proves every
   upstream reference, including the ones figures cite, still resolves.
5. **It has been looked at.** `pnpm exec kse shot / out.png 1280 true` renders a page; check
   light (`DARK=1` for dark) and 400 px wide. A new figure follows `docs/figures.md` and is
   previewed with `pnpm exec kse preview-diagram` before it is placed.

## Syncing with upstream

See `.claude/skills/clpr-sync/SKILL.md` and `docs/content-map.md`. Add an entry to `CHANGELOG.md` for
every sync, listing the upstream commit range and the sections touched.

## Code of conduct

The LF Decentralized Trust code of conduct applies to this repository.
