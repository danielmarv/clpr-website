<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# The plumbing explainer (`explainer/`)

`explainer/` is a separate Astro project: its rules are in `explainer/CLAUDE.md` and its
documentation in `explainer/docs/` (start at `explainer/docs/README.md`). `pnpm build` at the root
builds it into `public/plumbing/` (git-ignored) before `next build`; `pnpm run verify` inside
`explainer/` runs its gates. Content follows `explainer/docs/syncing.md`; the three `clpr-*` skills
under `.claude/skills/` are the drift check, the audit and the only one that edits. The audit covers
the whole repository, not only the explainer: the website's copy in `src/content/site.ts` is paired
with its sources in `src/content/site-refs.json`, so a new or changed block needs an entry there. Content stays neutral and stable by rule: `explainer/docs/writing-guide.md` (Keep it stable, LFDT website requirements) says what to write and what to leave to the specification, and `pnpm run check:policy` here plus `pnpm run check` in `explainer/` fail on what breaks it. Figures and simulations are drawn in the landing
page's vocabulary: the `clpr-figure` skill and its `art.mjs` say which shape each actor takes.
