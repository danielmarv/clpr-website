# Deployment

The explainer is not deployed on its own. The CLPR website builds it from this directory and
serves the two pages at `/plumbing/` and `/plumbing/developers/`.

## As part of the website

At the repository root, `pnpm build` runs `node explainer/embed.mjs` and then `next build`.
`embed.mjs` runs Astro's own executable with `BASE_PATH=/plumbing/` and writes to
`public/plumbing/` (git-ignored), which Next serves as static files; `pnpm build:explainer` runs
that step alone. Two settings in `next.config.ts` make the directory URLs resolve:
`trailingSlash: true` (the pages link to each other with relative URLs, so the general page must
be served at `/plumbing/` with the slash) and one `rewrites()` entry per page mapping `/plumbing/`
and `/plumbing/developers/` to their `index.html`. A redirect-based variant without
`trailingSlash` loops, because Next makes the trailing slash optional in every redirect source.

Canonical links take their host from `SITE_URL` in the deploy environment, or from Netlify's
`URL`. With neither set the build falls back to a placeholder host, so check the
`<link rel="canonical">` of a deployed page once per environment. Node 24 comes from
`.node-version` and `railpack.json`; pnpm from `packageManager` through Corepack.

## Standalone preview

Inside `explainer/`, `pnpm exec astro build` writes a standalone copy with base `/` to `dist/`,
which is what the gates check (`pnpm run verify`). `pnpm run preview` serves that build and
`pnpm run dev` serves the source with live reload at http://localhost:4321.

## Preview as a Claude artifact

```bash
pnpm exec astro build && pnpm exec kse export-artifact
```

writes `export/`: the two pages with relative asset paths (`index.html`, `developers.html`), the
favicon and `assets/`. Any Claude Code session, on any account, can publish `export/index.html`
as an artifact with the other files as its supporting files, which gives a private link that can
be shared from the artifact's own Share menu. `export/` is git-ignored.

## Share as a single file

```bash
pnpm run export:single
```

builds, then writes `export-single/`: `plumbing-of-clpr.html` and `plumbing-of-clpr-developers.html`,
one self-contained file per page with the stylesheets, the simulation scripts and the favicon
inlined. Either file opens from disk in a browser with every simulation working, so it can be sent
over chat or email to people who have no access to a deployment. The two files link to each other
by name; send both when the links between the pages matter. Before it returns, the script opens
each file from disk in Chromium and fails if the page requests anything beyond itself or logs an
error, so it needs the same Chromium as the browser checks (see [testing.md](testing.md)). To
export an existing build without rebuilding, run `pnpm exec kse export-single`. `export-single/`
is git-ignored.

## Continuous integration

`.github/workflows/explainer.yml` installs the workspace, installs Chromium through Playwright
and runs `pnpm run verify` in this directory on every pull request and push that touches
`explainer/`. `kse check-anchors` passes there without the upstream checkouts; run it locally
after a sync. `.github/workflows/upstream-watch.yml` compares the pinned upstream commits with
upstream HEAD once a week and opens an issue when they have moved.
