// All user-facing copy and links. Sources: LF-Decentralized-Trust/lab-proposals#5, the LFDT-CLPR GitHub org and hashgraph.com/clpr.

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
  hashgraph: "https://hashgraph.com/clpr/",
  hedera: "https://hedera.com",
  hiero: "https://hiero.org",
  apacheLicense: "https://www.apache.org/licenses/LICENSE-2.0",
  dco: "https://developercertificate.org/",
  lfTrademarks: "https://www.linuxfoundation.org/legal/trademark-usage",
} as const;

export const nav = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Why bridgeless", href: "#protocol" },
  { label: "Architecture", href: "#architecture" },
  { label: "Code", href: "#code" },
  { label: "Explainer", href: "/plumbing/" },
] as const;

export const headerCta = { label: "Get involved", href: "#get-involved" } as const;

export const hero = {
  eyebrow: "An LF Decentralized Trust Lab",
  title: "Cross-ledger messaging with no bridge to trust.",
  lead:
    "CLPR (“Clipper”) is an open protocol for reliable, in-order messaging between independent ledger networks. The destination ledger verifies the source ledger’s state proofs, so trust comes from the ledgers, not from bridges, pooled liquidity or intermediary validators.",
  primaryCta: { label: "Read the explainer", href: "/plumbing/" },
  secondaryCta: { label: "Read the specification", href: links.spec },
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
      body: "Messages queue in order on the source ledger, linked by a running-hash chain, and cross in bundles. Every Data Message gets exactly one response.",
    },
    {
      index: "03",
      name: "State proofs",
      title: "Proofs, not promises.",
      body: "The destination’s Verifier Contract checks the source ledger’s state proof itself. No bridge, no pooled liquidity, no intermediary validators.",
    },
  ],
} as const;

export const origins = {
  label: "Contributed by Hashgraph, with a native Hiero service specified in HIP-1535, and hosted as an LF Decentralized Trust lab.",
  text: "Contributed by Hashgraph under its agreement with the Hedera Governing Council. The ideas build on Dr. Leemon Baird’s proposals for cross-ledger communication. The first native implementation is part of Hiero.",
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
  title: "Trust lives in the ledgers, not in a bridge.",
  lead:
    "Interledger solutions often add an intermediary consensus layer or a federated bridge: a party in the middle that has to be trusted. CLPR has no such party. Each ledger verifies the other’s state with proofs it checks itself, and the Endpoints that carry those proofs cannot forge them.",
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
      clpr: "In the two ledgers, through state proofs checked by Verifier Contracts",
    },
    {
      aspect: "Custody",
      bridge: "Assets can sit with a custodian, whose keys become a target",
      clpr: "No pooled user assets: each CLPR Service holds only Connector funds and Endpoint bonds",
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
    "A Channel is only as trustworthy as its Verifier Contract, and anyone can register a Channel, so applications should check which verifier it uses.",
  explainer: { label: "Why a party in the middle is the weak point", href: "/plumbing/#bridges" },
} as const;

export const extensibility = {
  id: "architecture",
  eyebrow: "Architecture",
  title: "Bring any ledger that can prove its state.",
  lead:
    "CLPR is chain-agnostic. Supporting a new ledger type means building three components. The destination CLPR Service needs no change to its implementation, because each Verifier Contract translates the source ledger’s format into the local one.",
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
      body: "Each checks one ledger type’s proofs, and a Channel is bound to one for its whole lifetime. They verify incoming state proofs against the Channel’s trust anchor and decode bundles into the local data format.",
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
    "The specification is normative and language-neutral: wire formats, state and algorithms that any language can implement on any ledger. The reference implementations show one way to do it.",
  openLabel: "Open repository",
  featuredLabel: "Start here",
  implementsLabel: "Implements",
  runsOnLabel: "Runs on",
  rulesLabel: "How the project is run",
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
    primary: { label: "Read the specification", href: links.spec },
    secondary: { label: "Follow LFDT-CLPR on GitHub", href: links.githubOrg },
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
        { label: "Architecture", href: "/#architecture" },
        { label: "Code", href: "/#code" },
        { label: "The plumbing of CLPR", href: "/plumbing/" },
        { label: "For developers", href: "/plumbing/developers/" },
        { label: "Glossary", href: "/plumbing/developers/#glossary" },
      ],
    },
    {
      title: "Build",
      links: [
        { label: "Specification", href: links.spec },
        { label: "Smart contracts", href: links.smartContracts },
        { label: "Endpoint", href: links.endpoint },
        { label: "Native Hiero integration", href: links.hieroNative },
        { label: "HIP-1535: CLPR for Hiero", href: links.hip1535 },
        { label: "All LFDT-CLPR repositories", href: links.githubOrg },
      ],
    },
    {
      title: "Project",
      links: [
        { label: "Governance", href: links.governance },
        { label: "Lab proposal", href: links.labProposal },
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
    text: "© {year} The Linux Foundation. All rights reserved. The Linux Foundation has registered trademarks and uses trademarks. For a list of trademarks of The Linux Foundation, please see our {trademarks} page.",
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
