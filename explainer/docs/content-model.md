# Content model

Where words live, how a section is declared, and which components a section may use.

## Two pages, two registers

| | General page `/` | Developer page `/developers/` |
|---|---|---|
| File | `src/content/general.mdx` | `src/content/developers.mdx` |
| Reader | Anyone; no prior knowledge | A developer; no prior knowledge of CLPR, comfortable with ledgers, hashes, contracts |
| Voice | Short plain sentences. The specification's terms are the names, each explained in plain words at first use (see [writing-guide.md](writing-guide.md)) | Precise. Spec terminology, field names, section numbers, code |
| Each section ends with | Usually a `<Check>` self-test | A generated reference line under the heading; code blocks and tables where the spec has them |
| Length (at the initial release) | about 9,500 words | about 15,000 words |

The same simulation often appears on both pages. Props such as `detail` or `mode` switch its
register; the component's internal data does not change.

## Declaring a section

Sections are registered, not improvised. `src/data/sections.json` holds, per page, an ordered
list of `{ id, title, refs, illustration? }`: `refs` are the upstream passages that back the
section (design or spec heading anchors, or a pinned file path, in the shape `check-anchors.mjs`
resolves) and `illustration: true` marks a section that contains the site's own illustrations,
which the provenance footer names. On the developer page `Section.astro` renders the refs as a
"Source:" line under the heading; the general page renders no inline source lines at all and cites
its sources in the footer. In the MDX file a section is:

```mdx
<Section id="running-hash" page="general">

Prose, components, tables…

</Section>
```

`Section.astro` looks up the title and computes the number from the registry; the TOC is built
from the same list; the `acts` list in the same file groups sections (each act names its `first`
section, and `Section.astro` renders the act band in front of it, so acts never appear in the MDX); `kse check-provenance` fails the build if the sections in `dist/` do
not match the registry exactly, in order. To add a section: add it to the JSON at the right
position, add the matching `<Section>` block at the same position, and fix any prose that refers
to section numbers (search for `section 1`, `section 15`, and so on).

Element ids must be unique per page. Section ids are reserved for sections; simulation ids end in
`-sim` by default and are passed explicitly when a sim appears twice (`id="money-dev"`).

## Components available in MDX

| Component | Use | Notes |
|---|---|---|
| `<Callout kind="…">` | A labelled aside | `term` New term · `plain` In plain English · `gotcha` Gotcha · `spec` From the spec (quote or tight paraphrase) · `impl` Reference implementation (what the code does, including divergences) · `open` Open question (what the spec marks unresolved) · `key` Key point (one sentence, set as a pull-quote) · `note` with a custom `title` |
| `<Figure lead caption source kind minWidth>` | A captioned static drawing, usually wrapped by a component under `src/components/diagrams/<page>/` | See [figures.md](figures.md); `kind` is `spec` / `impl` / `open` / `plain` |
| `<JourneyTrailer mode href />` | The twelve-second wordless loop of the journey in the hero (pure CSS animation; pauses on tap, hover and off screen; static last frame under reduced motion) | `mode` is `plain` or `protocol`; `href` points at the full simulation; mounted from the page files, not the MDX |
| `<Refs refs={[…]} />` | "Source:" line; renders only on the developer page; duplicates collapsed | `Ref` objects as in `sections.json` |
| `<SecRef id="…" page? />` | "section N", linked, with N from the registry | Never write a section number in prose |
| `<AdrTable detail? />` | The decision records from `adrs.json` | `detail` switches to the developer wording |
| `<Patterns />`, `<Roles />`, `<LedgersTable />`, `<OpenIssues />`, `<Repos />` | Lists and tables rendered from the data files | `{ doc: 'design' \| 'spec', anchor, label }` or `{ doc: 'repo', id, path, label }`; anchors are GitHub heading slugs and are verified by `check-anchors.mjs` |
| `<Check q="…">…</Check>` | Collapsible self-test | General page mainly |
| `<Cast />` / `<Cast detail />` | The actor cards | Plain-first or spec-first wording |
| `<Journey mode="plain" \| "both" \| "protocol" />` | The 28-step round trip | Data in `journey.json` |
| Other sims | See [simulations.md](simulations.md) | Each accepts `id`, some accept `detail` |
| Inline links | `<a href={design('…')}>`, `{spec('…')}`, `{pinned('id','path')}`, `{sol('path')}` | Import from `'../lib/sources'` at the top of the MDX file; never paste a GitHub URL |

Tables are plain HTML inside `<div class="table-wrap">…</div>`; give cells that hold running text
`class="wrap"`. Fenced code blocks (` ```solidity `, ` ```protobuf `, ` ```text `) are
highlighted and theme-aware.

## MDX gotchas

- Close every tag, including `</svg>` inside a figure; MDX errors name the line.
- Avoid a literal `{` in prose; MDX treats it as an expression.
- A blank line inside a JSX block switches MDX back to Markdown parsing; keep component children
  either all-Markdown (with blank lines) or all-JSX (without).
- Component props that are numbers need braces: `minWidth={700}`.

## What a claim must carry

Every statement about the protocol is one of three things, and the reader can tell which:

1. **It is in the text.** State it plainly and back it with a ref in `sections.json` (rendered under
   the heading on the developer page) or an inline pinned link; quote only when the exact wording
   matters. Prose never says "the specification says".
2. **The reference implementation does so.** Say "reference implementation" or "the EVM
   contracts" and cite the file or the repository's own docs. Where it diverges from the spec,
   say that too; the contracts repository keeps a list.
3. **The spec marks it open.** Use `kind="open"` and say what is undecided.

Anything that is none of the three (an inference, a demo observation, a reasonable guess) is
either labelled "inferred" or left out. `journey.json` carries the same discipline per step in its
`evidence` field (`event`, `intx`, `inferred`).

See [writing-guide.md](writing-guide.md) for voice and [provenance.md](provenance.md) for why the
links look the way they do.
