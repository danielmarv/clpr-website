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
under `.claude/skills/` are the drift check, the audit and the only one that edits.
