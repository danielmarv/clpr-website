// All user-facing copy and links. Sources: LF-Decentralized-Trust/lab-proposals#5, the LFDT-CLPR GitHub org and the CLPR specification.

export const links = {
  githubOrg: "https://github.com/LFDT-CLPR",
  spec: "https://github.com/LFDT-CLPR/clpr-spec",
  smartContracts: "https://github.com/LFDT-CLPR/clpr-smart-contracts",
  endpoint: "https://github.com/LFDT-CLPR/clpr-endpoint",
  governance: "https://github.com/LFDT-CLPR/governance",
  hieroNative: "https://github.com/hiero-ledger/hiero-consensus-node/pull/27029",
  hip1535: "https://github.com/hiero-ledger/hiero-improvement-proposals/blob/main/HIP/hip-1535.md",
  labProposal: "https://github.com/LF-Decentralized-Trust/lab-proposals/issues/5",
  lfdt: "https://www.lfdecentralizedtrust.org/",
  hashgraph: "https://hashgraph.com",
  hedera: "https://hedera.com",
  hiero: "https://hiero.org",
  apacheLicense: "https://www.apache.org/licenses/LICENSE-2.0",
  dco: "https://developercertificate.org/",
  lfTrademarks: "https://www.linuxfoundation.org/legal/trademark-usage",
  openIssues: "https://github.com/search?q=org%3ALFDT-CLPR+is%3Aissue+is%3Aopen&type=issues",
  governanceRules: "https://github.com/LFDT-CLPR/governance/blob/main/GOVERNANCE.md",
  teams: "https://github.com/LFDT-CLPR/governance/blob/main/teams.yml",
  labsCharter: "https://github.com/LFDT-CLPR/governance/blob/main/lf-decentralized-trust-labs_Charter.pdf",
  contributing: "https://github.com/LFDT-CLPR/.github/blob/main/CONTRIBUTING.md",
  codeOfConduct: "https://github.com/LFDT-CLPR/.github/blob/main/CODE_OF_CONDUCT.md",
  security: "https://github.com/LFDT-CLPR/.github/blob/main/SECURITY.md",
  weeklyCall: "https://zoom-lfx.platform.linuxfoundation.org/meetings/lf-decentralized-trust-labs?view=week",
} as const;

// The site's pages; the home page's sections are linked from the footer.
export const nav = [
  { label: "Explainer", href: "/plumbing/" },
  { label: "Issue Explorer", href: "/issues/" },
  { label: "Governance", href: "/governance/" },
  { label: "Blog", href: "/blog/" },
] as const;

export const headerCta = { label: "Start contributing", href: "/#get-involved" } as const;

export const hero = {
  eyebrow: "An LF Decentralized Trust Lab",
  title: "Bridgeless cross-ledger messaging, verified by proofs.",
  lead:
    "CLPR (“Clipper”) is an open protocol for reliable, in-order messaging between independent ledger networks. The destination ledger verifies the source ledger’s state proofs instead of relying on a bridge, pooled liquidity or an intermediary validator set. A Channel still rests on both ledgers and on the CLPR Service and Verifier Contract implementations at each end, which should be open to review.",
  primaryCta: { label: "Start contributing", href: "#get-involved" },
  secondaryCta: { label: "Read the explainer", href: "/plumbing/" },
  // The first two numbers come from GitHub when the page is built and every hour after.
  stats: {
    label: "CLPR in numbers",
    repositories: "public repositories",
    stars: "GitHub stars",
  },
} as const;

export const story = {
  id: "how-it-works",
  label: "CLPR in three steps",
  statement: "Many bridges ask two ledgers to trust a third party. CLPR lets each ledger check the other’s proofs instead.",
  ledgerA: { name: "Ledger A", role: "Source, e.g. Hiero" },
  ledgerB: { name: "Ledger B", role: "Destination, e.g. an EVM ledger" },
  chapters: [
    {
      index: "01",
      name: "Two ledgers",
      title: "Two independent networks.",
      body: "Each ledger keeps its own consensus, its own rules and its own validators. Neither one has to hand control to anyone to talk to the other.",
    },
    {
      index: "02",
      name: "One Channel",
      title: "A direct, ordered Channel.",
      body: "Messages queue in order on the source ledger, linked by a running-hash chain, and cross in bundles. Each Data Message is answered with one response.",
    },
    {
      index: "03",
      name: "State proofs",
      title: "Verified by proofs.",
      body: "The destination’s Verifier Contract checks the source ledger’s state proof itself, without a bridge, pooled liquidity or an intermediary validator set.",
    },
  ],
} as const;

export const origins = {
  label: "A lab of LF Decentralized Trust, with a native Hiero service specified in HIP-1535.",
  text: "CLPR originated at Hedera, was developed by the Hashgraph team and was contributed to LF Decentralized Trust, where it is developed in the open as a Lab under the Labs charter. The first native implementation is part of Hiero.",
  // Each mark in its own colours (src), and its version for dark backgrounds (srcDark).
  // Heights are tuned per logo so the marks read at a similar optical size.
  logos: [
    { name: "Hashgraph", src: "/logos/hashgraph-black.svg", srcDark: "/logos/hashgraph-white.svg", width: 654.62, height: 141.73, href: links.hashgraph, className: "h-6 w-auto" },
    { name: "Hedera", src: "/logos/hedera-lockup-black.svg", srcDark: "/logos/hedera-lockup-white.svg", width: 448.29, height: 138.93, href: links.hedera, className: "h-8 w-auto" },
    { name: "Hiero", src: "/logos/hiero.svg", srcDark: "/logos/hiero-white.svg", width: 64, height: 20, href: links.hiero, className: "h-8 w-auto" },
    { name: "LF Decentralized Trust", src: "/logos/lfdt-horizontal-color.svg", srcDark: "/logos/lfdt-horizontal-white.svg", width: 698.7, height: 39.1, href: links.lfdt, className: "h-3.5 w-auto" },
  ],
} as const;

export const comparison = {
  id: "protocol",
  eyebrow: "Why bridgeless",
  title: "Proofs take the place of a trusted middle party.",
  lead:
    "Interledger solutions often add an intermediary consensus layer or a federated bridge: a party in the middle that has to be trusted. CLPR does not add one. Each ledger verifies the other’s state with proofs that its Verifier Contract checks, and the Endpoints that carry those proofs cannot forge them.",
  columns: { bridge: "Many bridges", clpr: "CLPR" },
  caption: "How CLPR differs from bridge-based interoperability",
  diagrams: {
    bridge: {
      caption: "A third party sits between the chains: a federated bridge, a validator set or a custodian.",
      middle: "Bridge",
      middleNote: "Validators or custodian",
    },
    clpr: {
      caption: "Each ledger checks the other’s state proofs itself. Endpoints build and relay them but cannot forge them.",
      proof: "State proof",
    },
  },
  rows: [
    {
      aspect: "Where trust lives",
      bridge: "In a separate validator set, federation or custodian",
      clpr: "In the two ledgers, plus the CLPR Service and Verifier Contract implementations that check state proofs",
    },
    {
      aspect: "Custody",
      bridge: "Assets can sit with a custodian, whose keys become a target",
      clpr: "The protocol pools no user assets: each CLPR Service holds only Connector funds and Endpoint bonds. Applications built on CLPR may still hold assets",
    },
    {
      aspect: "When something goes offline",
      bridge: "Delivery depends on the intermediary layer staying up",
      clpr: "Anyone, including the sender, can resume by submitting the proof",
    },
    {
      aspect: "Speed",
      bridge: "Goes through the intermediary layer’s own process",
      clpr: "No third consensus: source finality at the verifier’s level, an Endpoint sync, then the destination’s consensus",
    },
    {
      aspect: "What moves",
      bridge: "Value or messages, through the intermediary",
      clpr: "Any payload: data, oracle feeds, contract calls and asset transfers built by applications",
    },
  ],
  caveat:
    "A Channel is only as trustworthy as its Verifier Contract and the CLPR Service implementations at each end. Anyone can register a Channel, so applications should check which verifier it uses. Verifier Contracts should be immutable, because an upgrade key would be a single point of compromise.",
  explainer: { label: "Why a party in the middle is the weak point", href: "/plumbing/#bridges" },
} as const;

// The design's application patterns (§3.4), which it outlines without specifying, and the limits of what
// CLPR proves.
export const useCases = {
  id: "use-cases",
  eyebrow: "Use cases",
  title: "One primitive, four kinds of application.",
  lead:
    "A CLPR message is bytes with an address, and each Data Message is answered by a response. The design outlines four patterns built on that primitive. They are applications, not part of the protocol, and none is specified yet.",
  patterns: [
    {
      name: "Remote smart contract call",
      body: "A contract on one ledger calls a contract on another through a proxy on each side. The result comes back as the response, later rather than within the same call.",
    },
    {
      name: "Escrow, mint, then burn",
      body: "Assets are locked on the source ledger and minted on the destination. If minting succeeds, the locked assets may be burned; if it fails, they are released.",
    },
    {
      name: "N-ledger atomic swap",
      body: "Several ledgers change state together through two-phase commit, carried as ordinary messages. If any one of them fails, all of them roll back.",
    },
    {
      name: "Native Hiero asset management",
      body: "Hiero tokens, fungible and non-fungible, handled across Hiero networks by the messaging layer itself, with no smart-contract proxies. The design gives this one sentence so far.",
    },
  ],
  limits: {
    title: "What CLPR does not promise",
    items: [
      {
        name: "Delivery depends on Endpoints",
        body: "If nobody runs an Endpoint for a Channel, messages wait in the queue. Nothing is lost or faked; nothing moves either.",
      },
      {
        name: "Nothing is secret",
        body: "Message contents sit on both ledgers in plain view. CLPR proves a message is authentic and unaltered, not that it is private.",
      },
      {
        name: "Authentic is not safe",
        body: "CLPR proves a message came from the other ledger, not that it is sensible. Applications treat every arrival as untrusted input.",
      },
    ],
    explainer: { label: "The limits in the explainer", href: "/plumbing/#limits" },
  },
  explainer: { label: "The four patterns in the explainer", href: "/plumbing/#patterns" },
  art: {
    call: "Call",
    result: "Result",
    locked: "Locked",
    minted: "Minted",
    together: "All commit, or all roll back",
    hiero: "Hiero network",
    outlined: "Outlined, not yet specified",
  },
} as const;

export const extensibility = {
  id: "architecture",
  eyebrow: "Architecture",
  title: "Adding a new ledger type.",
  lead:
    "CLPR is not tied to one ledger type. Supporting a new one means building three components. Where the CLPR Service is a smart contract, it needs no change, because each Verifier Contract translates the source ledger’s format into the local one.",
  components: [
    {
      name: "CLPR Service",
      body: "Native to the ledger or deployed as a smart contract. Curates CLPR state, manages Channels, routes messages and coordinates payment between Connectors, applications and Endpoints.",
    },
    {
      name: "CLPR Endpoints",
      body: "Read local ledger state, build state-proven bundles in the source ledger’s format, sync them with peer Endpoints, and keep the trust anchor on each remote Channel current as the ledger’s signing authority changes.",
    },
    {
      name: "Verifier Contracts",
      body: "Each checks one ledger type’s proofs, and a Channel is bound to one verifier address for its whole lifetime. They verify incoming state proofs against the Channel’s trust anchor and decode bundles into the local data format.",
    },
  ],
  footnote:
    "Hiero has a native CLPR Service, specified by the approved HIP-1535, and builds its Endpoints into every consensus node, so that side needs no separate relay infrastructure.",
  explainer: { label: "How a new ledger is added", href: "/plumbing/#extend" },
  art: {
    queue: "Ordered queue",
    applications: "Applications",
    bundles: "Bundle sync",
    anchor: "Trust-anchor updates",
    proof: "State proof",
    trustAnchor: "Trust anchor",
    local: "Local format",
  },
} as const;

export const repositories = {
  id: "code",
  eyebrow: "Open source",
  title: "Open specification, open implementations.",
  lead:
    "The specification is normative and language-neutral: wire formats, state and algorithms that can be implemented in any language on a ledger able to verify state proofs. The reference implementations show one way to do it.",
  openLabel: "Open repository",
  featuredLabel: "Start here",
  implementsLabel: "Implements",
  runsOnLabel: "Runs on",
  rulesLabel: "How the project is run",
  starsLabel: "GitHub stars",
  facts: [
    { term: "Code license", detail: "Apache-2.0 with DCO sign-off" },
    { term: "Status", detail: "A lab for very early open projects: the specification is still changing and some economic parameters are open" },
    { term: "Specifications", detail: "The Labs charter calls for the Community Specification License 1.0; clpr-spec currently carries Apache-2.0" },
  ],
  components: {
    service: "CLPR Service",
    endpoint: "CLPR Endpoint",
    verifier: "Verifier Contracts",
  },
  clone: {
    label: "Clone the specification",
    command: "git clone https://github.com/LFDT-CLPR/clpr-spec.git",
    copy: "Copy command",
    copied: "Copied",
  },
  spec: {
    name: "clpr-spec",
    kind: "Specification",
    body: "The CLPR specification: component behavior, common data structures and formats, plus architecture decision records tracing how the design evolved.",
    href: links.spec,
  },
  implementations: [
    {
      name: "clpr-smart-contracts",
      kind: "Solidity",
      body: "CLPR Service and Verifier Contracts for EVM ledgers.",
      href: links.smartContracts,
      implements: ["service", "verifier"],
      runsOn: "EVM ledgers",
      status: "Reference implementation",
    },
    {
      name: "clpr-endpoint",
      kind: "Java",
      body: "A CLPR Endpoint that reads EVM chain state and submits bundles to EVM ledgers. It supports QBFT and CometBFT proof types.",
      href: links.endpoint,
      implements: ["endpoint"],
      runsOn: "EVM ledgers (QBFT, CometBFT)",
      status: null,
    },
    {
      name: "hiero-consensus-node #27029",
      kind: "Native integration",
      body: "The native CLPR service inside the Hiero consensus node, specified by the approved HIP-1535. An opt-in service: networks that do not enable it are unaffected.",
      href: links.hieroNative,
      implements: ["service", "endpoint"],
      runsOn: "Hiero",
      status: "HIP-1535 approved",
    },
  ],
  governance: {
    name: "governance",
    kind: "Governance",
    body: "How the lab is run: maintainers, processes and decision-making, following LF Decentralized Trust practices.",
    href: links.governance,
  },
} as const;

export const involvement = {
  id: "get-involved",
  eyebrow: "Get involved",
  title: "Build CLPR in the open.",
  lead:
    "CLPR is a lab of LF Decentralized Trust, run in the open by its maintainers under LFDT’s technical oversight. Its maintainers and committers are listed in the governance repository, and the lab is open to anyone who wants to help.",
  paths: [
    {
      name: "Shape the specification",
      body: "Review the spec and its decision records, raise issues and propose changes. The Labs charter calls for specification work under the Community Specification License 1.0.",
      cta: "Open clpr-spec",
      href: links.spec,
    },
    {
      name: "Contribute code",
      body: "Improve the Solidity contracts or the Java Endpoint. Code is Apache-2.0 licensed and every commit needs a DCO sign-off.",
      cta: "Browse the repositories",
      href: links.githubOrg,
    },
    {
      name: "Connect your ledger",
      body: "Maintain a network that can produce or verify state proofs? Help build its Service, Endpoints and Verifier Contracts, or a native integration.",
      cta: "See how a ledger is added",
      href: "/plumbing/#extend",
    },
  ],
  actions: {
    primary: { label: "Browse open issues", href: "/issues/" },
    secondary: { label: "Read the specification", href: links.spec },
  },
} as const;

// The structure of hiero.org/tsc. CLPR's governance (GOVERNANCE.md in the governance repository) has no TSC:
// its Maintainers take the general decisions, so the page is theirs. Members appear once they are listed
// in members.list; until then the page shows empty cards and points to teams.yml.
type GovernanceMember = { name: string; role?: string; github?: string; photo?: string; bio?: string };

export const governancePage = {
  metaTitle: "Governance",
  description: "Who maintains CLPR, how the lab takes its decisions, and where its governance is kept.",
  kicker: "CLPR technical governance",
  title: "The maintainers of CLPR",
  lead: "The Maintainers take the decisions that affect the CLPR lab as a whole, in the open and under the Labs charter of LF Decentralized Trust.",
  actions: {
    primary: { label: "View the governance rules", href: links.governanceRules },
    secondary: { label: "Open meeting calendar", href: links.weeklyCall },
  },
  about: {
    eyebrow: "Governance",
    title: "About the governance",
    // {rules} is the link to GOVERNANCE.md.
    body: "The roles, decisions and votes of the lab are set out in its {rules}, under the Labs charter of LF Decentralized Trust. Decisions are made by consensus where possible; when a vote is needed, the Maintainers hold it in the weekly call or over 14 days in the issue, and every decision of the Maintainers should be tracked by an issue in the governance repository.",
    rulesLabel: "governance rules",
    chips: ["Public rules", "Open weekly call", "Decisions in the open"],
  },
  roles: [
    {
      name: "Maintainers",
      body: "Take the decisions that affect the lab as a whole: new repositories, and adding or removing Committers and Maintainers.",
    },
    {
      name: "Committers",
      body: "Are named per repository. They review and merge pull requests, ladder issues for new contributors and take part in the discussions.",
    },
    {
      name: "Contributors",
      body: "Anyone who opens an issue, writes code or documentation, or reviews a pull request. Consistent contributors can be nominated as Committers.",
    },
  ],
  members: {
    eyebrow: "The maintainers",
    title: "Who maintains CLPR",
    body: "The Maintainers are contributors who steward CLPR and keep it open to everyone who wants to help.",
    countLabel: "members listed",
    board: { label: "Current members", note: "Listed by surname" },
    noBio: "Biography not available.",
    githubLabel: "GitHub profile",
    empty: {
      title: "The maintainers are listed in the governance repository",
      body: "Every team of the lab and its members are in teams.yml in the governance repository, which the maintainers keep current.",
      link: { label: "See the teams", href: links.teams },
    },
    list: [] as GovernanceMember[],
  },
  resources: {
    eyebrow: "Resources",
    title: "Where the work is kept",
    lead: "Read the charter and the rules, and follow the lab's governance where it happens.",
    action: "Open resource",
    items: [
      { platform: "GitHub", name: "LFDT Labs charter", body: "The formal scope and operating rules for CLPR as an LFDT lab.", href: links.labsCharter },
      { platform: "GitHub", name: "Governance rules", body: "The roles, decision making and voting, in GOVERNANCE.md.", href: links.governanceRules },
      { platform: "GitHub", name: "Teams", body: "Every team, its members and its rights on each repository, in teams.yml.", href: links.teams },
      { platform: "LFX", name: "Weekly call", body: "The weekly CLPR call, open to everyone, on the LFX meeting calendar.", href: links.weeklyCall },
    ],
  },
} as const;

export const issueExplorer = {
  metaTitle: "Issue Explorer",
  description: "Every open, unassigned issue in the main CLPR repositories, filtered by difficulty or repository.",
  kicker: "Contribute",
  title: "Issue Explorer",
  lead: "Every open CLPR issue that nobody has picked up yet. Filter by how much you want to take on, or by the repository you already know.",
  chips: { open: "Open", unassigned: "Unassigned", repositories: "{count} repositories" },
  counter: "{count} open issues",
  counterOne: "1 open issue",
  refreshed: "Refreshed {time} from GitHub",
  unavailable: "GitHub could not be reached when this page was built. The issues are all on GitHub itself.",
  // The repositories the explorer covers, as tiles that also filter the board; the others keep their
  // issues on GitHub (see closing).
  repositoriesLabel: "Repositories",
  repositories: [
    { name: "clpr-spec", body: "The specification, its decision records and the verifier documents." },
    { name: "clpr-smart-contracts", body: "The Solidity CLPR Service and Verifier Contracts for EVM ledgers." },
    { name: "clpr-endpoint", body: "The Java CLPR Endpoint for EVM ledgers: sync, proofs and bundle submission." },
    { name: "clpr-e2e", body: "The end-to-end repository for CLPR." },
  ],
  openOne: "1 open",
  openMany: "{count} open",
  search: { label: "Search issues", placeholder: "Search titles, repositories, labels…" },
  sort: { label: "Sort", updated: "Recently active", created: "Newest", comments: "Most discussed" },
  difficultyLabel: "Difficulty",
  // In priority order: an issue labelled both "good first issue" and "beginner" shows as the first. A label
  // matches a level when, lower-cased and without a "skill:"-style prefix, it is one of the level's names.
  levels: [
    { id: "good-first-issue", label: "Good first issue", names: ["good first issue", "first timers only", "first issue"], body: "Ideal for first-time contributors new to the project." },
    { id: "beginner", label: "Beginner", names: ["beginner", "starter", "easy"], body: "Straightforward tasks that need light domain knowledge." },
    { id: "intermediate", label: "Intermediate", names: ["intermediate"], body: "Moderately complex issues for developers gaining experience." },
    { id: "advanced", label: "Advanced", names: ["advanced", "hard", "expert"], body: "Challenging issues requiring deep technical expertise." },
  ],
  everything: "Everything",
  tally: { none: "No matching issues", one: "1 issue", many: "{count} issues", page: "page {page} of {total}" },
  status: "{count} issues match the current filters.",
  statusOne: "1 issue matches the current filters.",
  clear: "Clear filters",
  empty: {
    title: "Nothing matches those filters",
    body: "Try a broader search, or clear the filters to see every open issue.",
  },
  failed: {
    title: "The issues could not be loaded",
    body: "GitHub did not answer when this page was last built. It tries again within the hour, and every open issue is always on GitHub itself.",
  },
  issueName: "{title}, issue {number} in {repository}",
  ages: { today: "today", yesterday: "yesterday", days: "{count} days ago", weeks: "{count} weeks ago", months: "{count} months ago", year: "a year ago", years: "{count} years ago" },
  comments: "{count} comments",
  pager: { label: "Issue pages", previous: "Previous page", next: "Next page", page: "Page {page}" },
  // From CONTRIBUTING.md in the org profile and the Committers' role in GOVERNANCE.md.
  steps: {
    title: "How to pick one up",
    items: [
      { name: "Claim it", body: "Say on the issue that you would like to take it. A Committer of the repository can assign it to you." },
      { name: "Fork and branch", body: "Fork the repository, create a branch, and build and test your change locally." },
      { name: "Sign every commit", body: "Sign off for the Developer Certificate of Origin and GPG-sign: git commit --signoff -S." },
      { name: "Open a pull request", body: "The repository's Committers review it and merge it once it meets the project's standards." },
    ],
  },
  contributing: { label: "Read the contribution guidelines", href: links.contributing },
  closing: {
    title: "Looking further afield?",
    body: "The explorer covers the main CLPR repositories. The governance and organization repositories keep their open issues on GitHub.",
    cta: { label: "Search every open issue", href: links.openIssues },
  },
} as const;

// The blog's labels; the posts are Markdown files in content/posts/ (src/lib/posts.ts, docs/blogs.md),
// and the blog's title and subtitle are in content/posts/_index.md.
export const blog = {
  description: "News and announcements from the CLPR lab.",
  kicker: "Lab news",
  latestLabel: "Latest post",
  readLabel: "Read the post",
  backLabel: "All posts",
  readingTime: "{minutes} min read",
  postCount: "{count} posts",
  postCountOne: "1 post",
  pageOf: "Page {page} of {total}",
  pager: { label: "Archive pages", first: "First", previous: "Previous", next: "Next", last: "Last", page: "Page {page}" },
  rail: { label: "About this post", author: "Author", authors: "Authors", contents: "On this page", share: "Share" },
  shareOn: "Share on {network}",
  nearby: { label: "Nearby posts", older: "Older post", newer: "Newer post" },
  more: { title: "More from the blog", all: "All posts" },
  latestOn: "Latest post {date}",
  photoBy: "Photo:",
  tagsLabel: "Tags",
  // Beside the newest post while there are fewer than three: what to follow between posts.
  follow: {
    title: "Follow the work",
    body: "CLPR is built in the open. Watch the repositories, pick up an issue, or join the weekly call.",
    links: [
      { label: "LFDT-CLPR on GitHub", href: links.githubOrg },
      { label: "Issue Explorer", href: "/issues/" },
      { label: "Weekly call", href: links.weeklyCall },
    ],
  },
} as const;

export const footer = {
  tagline: "Bridgeless cross-ledger messaging, specified in the open.",
  backToTop: "Back to top",
  newTab: "opens in a new tab",
  wordmark: "CLPR",
  columns: [
    {
      title: "Explore",
      links: [
        { label: "How it works", href: "/#how-it-works" },
        { label: "Why bridgeless", href: "/#protocol" },
        { label: "Use cases", href: "/#use-cases" },
        { label: "Architecture", href: "/#architecture" },
        { label: "Code", href: "/#code" },
      ],
    },
    {
      title: "Learn",
      links: [
        { label: "The plumbing of CLPR", href: "/plumbing/" },
        { label: "For developers", href: "/plumbing/developers/" },
        { label: "Glossary", href: "/plumbing/developers/#glossary" },
        { label: "Blog", href: "/blog/" },
      ],
    },
    {
      title: "Build",
      links: [
        { label: "Issue Explorer", href: "/issues/" },
        { label: "Specification", href: links.spec },
        { label: "Smart contracts", href: links.smartContracts },
        { label: "Endpoint", href: links.endpoint },
        { label: "Native Hiero integration", href: links.hieroNative },
        { label: "HIP-1535: CLPR for Hiero", href: links.hip1535 },
        { label: "All LFDT-CLPR repositories", href: links.githubOrg },
      ],
    },
    {
      title: "Lab",
      links: [
        { label: "Maintainers and committers", href: "/governance/" },
        { label: "Governance repository", href: links.governance },
        { label: "Lab proposal", href: links.labProposal },
        { label: "Code of Conduct", href: links.codeOfConduct },
        { label: "Report a vulnerability", href: links.security },
        { label: "Developer Certificate of Origin", href: links.dco },
        { label: "Apache License 2.0", href: links.apacheLicense },
      ],
    },
  ],
  backing: {
    label: "Who is behind CLPR",
    stewardedBy: "A lab of",
    contributedBy: "Contributed by",
    builtInto: "Native service for",
  },
  // LFDT's website requirements for projects and labs: the affiliation line, and the legal attribution
  // word for word, with the current year. {trademarks} is the link to the Trademark Usage page.
  affiliation: "An LF Decentralized Trust Lab",
  license:
    "Code is licensed under Apache-2.0; the Labs charter calls for specifications under the Community Specification License 1.0.",
  legal: {
    text: "© {year} The Linux Foundation. All rights reserved.{break}The Linux Foundation has registered trademarks and uses trademarks. For a list of trademarks of The Linux Foundation, please see our {trademarks} page.",
    trademarks: { label: "Trademark Usage", href: links.lfTrademarks },
  },
} as const;

export const site = {
  name: "CLPR",
  expansion: "Cross Ledger Protocol",
  fullName: "CLPR — Cross Ledger Protocol",
  description:
    "CLPR (“Clipper”) is an open, bridgeless Cross Ledger Protocol: a messaging layer for reliable, in-order message passing between independent ledger networks, with application logic left to applications. An LF Decentralized Trust Lab.",
  skipLink: "Skip to content",
  menuOpen: "Open menu",
  menuClose: "Close menu",
  githubLabel: "GitHub",
  homeLabel: "CLPR home",
  theme: { label: "Color theme", light: "Light", dark: "Dark", system: "System" },
} as const;
