# Testing and tooling

There is no unit-test suite in the usual sense: the site is prose plus self-contained
simulations. What is tested is consistency (pages ↔ manifest ↔ upstream), link integrity, and
rendering, with tools that run in seconds.

## Commands

| Command | What it does |
|---|---|
| `pnpm run build` | Astro build to `dist/` |
| `pnpm run check` | `kse check-provenance`, `kse check-links` against `dist/`, `kse check-names` (a word in the gitignored `src/data/pack.local.json` `names.must_not_mention` (copy `pack.local.example.json`), appears nowhere on either page) and `kse check-vocab` (the specification's terms are the names), `checks/check-data.mjs` (data rows carry references; inventories match upstream), `kse content-map --check` (the generated map is current) and `kse check-orphans` (every component is imported somewhere) |
| `pnpm run verify` | build, then `check`, `check:anchors`, `check:browser`, the dark-theme simulation pass and `overflow.mjs` at 400px on both pages; stops at the first failing gate. Run it before calling anything done |
| `pnpm run content-map` | regenerate `docs/content-map.md` from the references in `src/data/` and the components |
| `pnpm exec kse check-scroll` | loads both built pages in Chromium and fails if either scrolls on its own within 2.5 s (a simulation once called `scrollIntoView` while initialising) |
| `pnpm exec kse check-sims` | clicks every button of every simulation on both pages (and steps each step-through to its end) and fails on a console or page error, on a click that moves the window, or on SVG text under 10px at 400px; `DARK=1` for the dark theme |
| `node checks/browser/check-diagram-text.mjs` | renders both built pages in the site theme and fails when a label in a figure or simulation runs past its box or the drawing's edge, runs into another box, or sits on another label |
| `pnpm run check:browser` | the three checks above, in sequence; needs a Chromium (see Screenshots) |
| `pnpm exec kse preview-diagram <Figure.astro> <out-prefix>` | renders one figure component with the engine's stylesheet and fonts (not the site theme; the diagram text check covers that), no build needed: light, dark and phone PNGs plus a report of text under 11px and elements outside the `viewBox` |
| `pnpm test` | build, then check |
| `pnpm run export:single` | build, then write each page as one self-contained HTML file to `export-single/` and open it from disk in Chromium to confirm it loads nothing else ([deployment.md](deployment.md)) |
| `kse check-voice` | no phrase listed in `pack.json` `voice.bannedPhrases` appears in the visible text of either page (configure it to forbid provenance commentary and certainty labels) |
| `kse check-code-refs` | every `path:line` plus `symbol` citation in the data files matches the source at the pinned commit |
| `pnpm run check:anchors` | every upstream reference resolves in `.upstream/` (run `pnpm run sync:fetch` first; skips with a notice if `.upstream/` is absent) |
| `pnpm run sync:fetch` / `pnpm run sync:status` | fetch upstream and write the drift report / print it only |
| `pnpm run sync:pin` | move the pins to the fetched heads |
| `pnpm exec kse shot <path> <out.png> [width] [fullPage] [clicks]` | screenshot a built page with the preinstalled Chromium |
| `pnpm exec kse audit-input` | pairs every section's text and every data table with the upstream passages their refs cite, at the pinned commits, into `.upstream/audit-input/`; the `clpr-audit` skill judges those pairs |
| `pnpm exec kse overflow <path> [width]` | list elements wider than the viewport that are not inside a scroller; exits 1 when there are any |

## Screenshots

`kse shot` serves `dist/` on a local port, opens it in Chromium, optionally clicks a
sequence of selectors separated by `|` (each followed by a short wait), takes the screenshot and
reports any console or page errors.

```bash
pnpm exec kse shot / general.png 1280 true                         # full page, desktop
pnpm exec kse shot /developers/ dev-phone.png 400 true             # full page, phone width
DARK=1 pnpm exec kse shot /developers/ dev-dark.png 1280 true      # dark theme
pnpm exec kse shot / journey.png 1280 false \
  '#journey-sim [data-dir="reverse"]|#journey-sim [data-role="next"]|#journey-sim [data-role="next"]'
```

The browser scripts prefer the preinstalled Playwright Chromium of the environment this was
built in (`/opt/pw-browsers/chromium-*/chrome-linux/chrome`) and fall back to Playwright's own
browser when that path does not exist; run `pnpm exec playwright install chromium` once on a new
machine, or set `PW_CHROME=/path/to/chrome`. Pages are opened with `reducedMotion: 'reduce'`, so
the reveal-on-scroll animation never leaves blanks in a full-page capture.

Full-page captures are tall (20,000–45,000 px); crop them with any image tool before looking.
`screenshots/` is git-ignored.

## Overflow

`kse overflow` finds the cause of a page that scrolls sideways on phones: it lists every
element whose right edge passes the viewport and that is not inside an `overflow-x: auto`
container. The usual culprits are a long inline `code` token (fixed globally with
`overflow-wrap: anywhere`), an SVG without a `viewBox`, or a table outside `.table-wrap`.

## Verifying a simulation's numbers

- SHA-256 chains (`RunningHash.astro`, `BundleVerify.astro`): recompute one value with Python,
  `hashlib.sha256(prev + payload.encode()).hexdigest()`, starting from 32 zero bytes.
- Keccak-256 (`CommitReveal.astro`): the component self-tests against `keccak256("")` and
  `keccak256("abc")` at load and shows "(hash unavailable)" if the test fails; cross-check a
  displayed value with any keccak implementation.
- Fees (`Money.astro`): charge = cost × (1 + margin/100), read straight off the screen.

## What CI runs

Pull requests and non-`main` pushes: `pnpm install && pnpm run build && pnpm run check`. Pushes to
`main`: the same, then deploy to Pages (if enabled). The weekly `upstream-watch` workflow runs
`pnpm exec kse sync-upstream --report-only` and files an issue when a pin is behind.
