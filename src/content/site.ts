/**
 * All user-facing copy and links for the CLPR website live here, so content
 * can be reviewed (and later translated) without touching components.
 *
 * Sources: the CLPR LFDT Lab proposal (LF-Decentralized-Trust/lab-proposals#5),
 * the LFDT-CLPR GitHub organization and hashgraph.com/clpr.
 */

export const links = {
  githubOrg: "https://github.com/LFDT-CLPR",
  spec: "https://github.com/LFDT-CLPR/clpr-spec",
  smartContracts: "https://github.com/LFDT-CLPR/clpr-smart-contracts",
  endpoint: "https://github.com/LFDT-CLPR/clpr-endpoint",
  governance: "https://github.com/LFDT-CLPR/governance",
  hieroNative: "https://github.com/hiero-ledger/hiero-consensus-node/pull/27029",
  labProposal: "https://github.com/LF-Decentralized-Trust/lab-proposals/issues/5",
  lfdt: "https://www.lfdecentralizedtrust.org/",
  hashgraph: "https://hashgraph.com/clpr/",
  hedera: "https://hedera.com",
  hiero: "https://hiero.org",
  apacheLicense: "https://www.apache.org/licenses/LICENSE-2.0",
  dco: "https://developercertificate.org/",
} as const;

export const nav = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Why bridgeless", href: "#protocol" },
  { label: "Architecture", href: "#architecture" },
  { label: "Code", href: "#code" },
  { label: "Roadmap", href: "#roadmap" },
] as const;

export const headerCta = { label: "Get involved", href: "#get-involved" } as const;

export const hero = {
  eyebrow: "Bridgeless cross-ledger messaging",
  title: "Cross-ledger messaging with nothing in between.",
  lead:
    "CLPR (“Clipper”) is an open Cross Ledger PRotocol for reliable, asynchronous, in-order message passing between independent ledger networks. Trust comes from each ledger’s own state proofs, not from bridges, pooled liquidity or intermediary validator networks.",
  primaryCta: { label: "Read the specification", href: links.spec },
  secondaryCta: { label: "Explore the code", href: "#code" },
  scrollCue: "Scroll to see how",
} as const;

/* ------------------------------------------------------------------------ */
/* Scroll story                                                               */
/* ------------------------------------------------------------------------ */

export const story = {
  id: "story",
  label: "CLPR in three steps",
  statement: "Bridges ask two ledgers to trust a third party. CLPR lets each ledger trust only what it can prove.",
  ledgerA: { name: "Ledger A", role: "Source, e.g. Hiero" },
  ledgerB: { name: "Ledger B", role: "Destination, e.g. Besu" },
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

/* ------------------------------------------------------------------------ */
/* Protocol guarantees                                                        */
/* ------------------------------------------------------------------------ */

export const guarantees = {
  id: "guarantees",
  eyebrow: "Protocol properties",
  title: "Guarantees enforced by the ledgers themselves.",
  lead:
    "CLPR does not add a party that has to be trusted. What it promises follows from consensus, state proofs and an ordered queue on each side of the Channel.",
  items: [
    {
      name: "In order, tamper-evident",
      body: "Messages on a Channel arrive in the order they were sent. A running-hash chain fixes that order and makes any change visible.",
      visual: "order",
    },
    {
      name: "Exactly one response",
      body: "Every Data Message produces exactly one Response Message, with a status and reply bytes, on the same Channel.",
      visual: "response",
    },
    {
      name: "Zero custody",
      body: "Endpoints never hold assets. There is no pooled liquidity sitting in the middle, waiting to become a target.",
      visual: "custody",
    },
    {
      name: "Permissionless delivery",
      body: "If an Endpoint goes offline, anyone, including the sender, can submit the proof and the Channel moves on.",
      visual: "delivery",
    },
    {
      name: "Any payload",
      body: "Arbitrary bytes: data, oracle feeds and contract calls. Asset transfers are application logic built on top.",
      visual: "payload",
    },
    {
      name: "Speed of consensus",
      body: "No extra confirmation rounds from a bridge. Latency is bounded by how fast the two networks reach consensus.",
      visual: "speed",
    },
  ],
  // Labels inside the small diagrams.
  art: {
    offline: "Endpoint offline",
    anyone: "Anyone can deliver",
    bridge: "Bridge",
    clpr: "CLPR",
  },
} as const;

/* ------------------------------------------------------------------------ */
/* Interactive channel walkthrough                                            */
/* ------------------------------------------------------------------------ */

export type DemoNodeId =
  | "a-app"
  | "a-service"
  | "a-endpoint"
  | "b-endpoint"
  | "b-verifier"
  | "b-service"
  | "b-app";

export type DemoStep = {
  name: string;
  title: string;
  body: string;
  active: DemoNodeId[];
  /** Position of the outbound bundle on the channel, 0 (Ledger A) → 1 (Ledger B). null hides it. */
  bundle: number | null;
  /** Position of the response bundle, 1 (Ledger B) → 0 (Ledger A). null hides it. */
  response: number | null;
  proofVerified: boolean;
  queueLength: number;
};

export const walkthrough = {
  id: "how-it-works",
  eyebrow: "How it works",
  title: "Follow one message across a Channel.",
  lead: "Seven steps from one ledger to the other and back. Let it play, or step through at your own pace.",
} as const;

export const demo = {
  ariaLabel: "Step-by-step walkthrough of a message crossing a CLPR Channel",
  ledgerA: { name: "Ledger A", role: "Source, for example a Hiero network" },
  ledgerB: { name: "Ledger B", role: "Destination, for example a Besu network" },
  nodes: {
    "a-app": { name: "Application", note: "Sends a payload" },
    "a-service": { name: "CLPR Service", note: "Ordered outbound queue" },
    "a-endpoint": { name: "CLPR Endpoint", note: "Builds proven bundles" },
    "b-endpoint": { name: "CLPR Endpoint", note: "Submits the bundle" },
    "b-verifier": { name: "Verifier Contract", note: "Checks the state proof" },
    "b-service": { name: "CLPR Service", note: "Routes messages in order" },
    "b-app": { name: "Application", note: "Receives the payload" },
  } satisfies Record<DemoNodeId, { name: string; note: string }>,
  channel: {
    label: "Channel, bound to one Verifier Contract",
    emptyTitle: "Nothing in between",
    emptyBody: "No bridge. No pooled liquidity. No intermediary validators.",
    bundleTitle: "Bundle of 3 messages",
    bundleProof: "State proof attached",
    bundleProofVerified: "State proof verified",
    responseTitle: "Bundle of 3 responses",
  },
  queue: {
    caption: "Running-hash chain (illustrative values)",
    messages: [
      { id: "#1041", hash: "9f3a…c2e1" },
      { id: "#1042", hash: "41be…7d09" },
      { id: "#1043", hash: "c07e…19fa" },
    ],
  },
  controls: {
    previous: "Previous step",
    next: "Next step",
    play: "Play walkthrough",
    pause: "Pause walkthrough",
    steps: "Walkthrough steps",
    position: "Step {step} of {total}",
    keyboardHint: "Use ← and → to step through",
  },
  legend: {
    message: "Message in transit",
    proof: "State proof verified",
  },
  steps: [
    {
      name: "Send",
      title: "An application hands over a payload",
      body: "An application on Ledger A sends an arbitrary byte payload to its CLPR Service and names the Connector that will pay for execution on Ledger B.",
      active: ["a-app", "a-service"],
      bundle: null,
      response: null,
      proofVerified: false,
      queueLength: 2,
    },
    {
      name: "Queue",
      title: "The message joins an ordered queue",
      body: "The CLPR Service appends the message to the Channel’s outbound queue. Each message extends a running-hash chain, so order is fixed and tamper-evident.",
      active: ["a-service"],
      bundle: null,
      response: null,
      proofVerified: false,
      queueLength: 3,
    },
    {
      name: "Bundle",
      title: "An Endpoint builds a state-proven bundle",
      body: "A CLPR Endpoint batches queued messages into a bundle and attaches a state proof of Ledger A’s committed state. One proof covers every message in the bundle.",
      active: ["a-endpoint"],
      bundle: 0,
      response: null,
      proofVerified: false,
      queueLength: 3,
    },
    {
      name: "Transmit",
      title: "The bundle crosses the Channel",
      body: "Endpoints sync the bundle to the peer ledger. Submission is permissionless: if an Endpoint goes offline, anyone, including the sender, can deliver the proof.",
      active: ["a-endpoint", "b-endpoint"],
      bundle: 1,
      response: null,
      proofVerified: false,
      queueLength: 3,
    },
    {
      name: "Verify",
      title: "Ledger B checks the proof itself",
      body: "Ledger B’s Verifier Contract checks the proof against the Channel’s trust anchor and translates the bundle into Ledger B’s own data format.",
      active: ["b-verifier"],
      bundle: 1,
      response: null,
      proofVerified: true,
      queueLength: 3,
    },
    {
      name: "Deliver",
      title: "Messages arrive in order",
      body: "The CLPR Service routes each message, in order, to its destination application. What the payload means is up to the two applications.",
      active: ["b-service", "b-app"],
      bundle: null,
      response: null,
      proofVerified: true,
      queueLength: 3,
    },
    {
      name: "Respond",
      title: "Every message gets exactly one response",
      body: "Each Data Message produces exactly one Response Message with a status and reply bytes, which travels back to Ledger A over the same Channel.",
      active: ["b-service", "a-service"],
      bundle: null,
      response: 0,
      proofVerified: true,
      queueLength: 3,
    },
  ] satisfies DemoStep[],
};

export const origins = {
  label: "Contributed by Hashgraph, built natively into Hiero and stewarded by LF Decentralized Trust.",
  text: "Contributed by Hashgraph on behalf of the Hedera Governing Council, building on Dr. Leemon Baird’s approach to cross-ledger communication. Hiero is building the first native implementation.",
  logos: [
    // Heights are tuned per logo so the marks read at a similar optical size.
    { name: "Hashgraph", src: "/logos/hashgraph-black.svg", width: 654.62, height: 141.73, href: links.hashgraph, className: "h-6 w-auto" },
    { name: "Hedera", src: "/logos/hedera-lockup-black.svg", width: 448.29, height: 138.93, href: links.hedera, className: "h-8 w-auto" },
    { name: "Hiero", src: "/logos/hiero.svg", width: 64, height: 20, href: links.hiero, className: "h-8 w-auto" },
  ],
} as const;

/* ------------------------------------------------------------------------ */
/* Why bridgeless                                                             */
/* ------------------------------------------------------------------------ */

export const comparison = {
  id: "protocol",
  eyebrow: "Why bridgeless",
  title: "Trust lives in the ledgers, not in a bridge.",
  lead:
    "Bridges and relayers were built as workarounds for isolated chains, and they add a party in the middle that has to be trusted. CLPR removes that party: each ledger verifies the other’s state directly, using proofs it can check itself.",
  columns: { aspect: "", bridge: "Typical bridge", clpr: "CLPR" },
  caption: "How CLPR differs from bridge-based interoperability",
  aspectsLabel: "Compare by",
  diagrams: {
    bridge: {
      caption: "A third party sits between the chains and holds the keys and the assets.",
      middle: "Bridge",
      middleNote: "Validators and pooled assets",
    },
    clpr: {
      caption: "Each ledger checks the other’s state proofs itself. Nothing sits in between.",
      proof: "State proof",
    },
    ledgerA: "Ledger A",
    ledgerB: "Ledger B",
    // Labels inside the diagrams that change with the aspect.
    labels: {
      pooled: "Pooled assets",
      nothingHeld: "Nothing held",
      operatorOffline: "Operator offline",
      endpointOffline: "Endpoint offline",
      anyone: "Anyone can deliver",
      waiting: "Own confirmation rounds",
      direct: "Straight to Ledger B",
      tokens: "Tokens only",
      anyPayload: "Data, feeds, calls, assets",
    },
  },
  rows: [
    {
      aspect: "Where trust lives",
      visual: "trust",
      bridge: "In a separate validator set, multisig or relayer network",
      clpr: "In the two ledgers, through state proofs checked by Verifier Contracts",
    },
    {
      aspect: "Custody",
      visual: "custody",
      bridge: "Assets pooled in contracts that become a target",
      clpr: "Endpoints hold zero custody at any point",
    },
    {
      aspect: "When something goes offline",
      visual: "offline",
      bridge: "Transfers depend on the operator coming back",
      clpr: "Anyone, including the sender, can resume by submitting the proof",
    },
    {
      aspect: "Speed",
      visual: "speed",
      bridge: "Adds the bridge’s own confirmation rounds",
      clpr: "Bounded by how fast the two networks reach consensus",
    },
    {
      aspect: "What moves",
      visual: "payload",
      bridge: "Mostly tokens",
      clpr: "Any payload: data, oracle feeds, contract calls and asset transfers built by applications",
    },
  ],
} as const;

/* ------------------------------------------------------------------------ */
/* Architecture                                                               */
/* ------------------------------------------------------------------------ */

export const layers = {
  id: "architecture",
  eyebrow: "Architecture",
  title: "Four layers, one minimal API.",
  lead:
    "Applications only see a small interface for sending and receiving payloads. How ledgers prove and verify each other’s state stays below it, which is what lets CLPR span very different networks.",
  apiNote: "CLPR Application API",
  items: [
    {
      name: "Application",
      body: "A minimal API for sending and receiving message payloads. Asset transfers and cross-ledger contract calls are application logic on top of it.",
      terms: ["Data Message", "Response Message"],
    },
    {
      name: "Payment & routing",
      body: "Connectors pay for message execution on the destination ledger and can be slashed for misbehavior. The CLPR Service routes each message to its application.",
      terms: ["Connector", "Routing"],
    },
    {
      name: "Messaging",
      body: "An ordered, state-proven queue per Channel. Messages travel in bundles linked by a running-hash chain, so one proof extends trust to every message inside.",
      terms: ["Message", "Bundle"],
    },
    {
      name: "Network",
      body: "Permissionless Channel registration with commit-reveal against ID squatting, the bundle sync protocol between Endpoints, and the pluggable Verifier Contract interface.",
      terms: ["Channel", "Verifier Contract", "Trust Anchor"],
    },
  ],
} as const;

/* ------------------------------------------------------------------------ */
/* Extensibility                                                              */
/* ------------------------------------------------------------------------ */

export const extensibility = {
  id: "extensibility",
  eyebrow: "Chain-agnostic",
  title: "Bring any ledger that can prove its state.",
  lead:
    "CLPR is chain-agnostic. Supporting a new ledger type means building three components. The destination CLPR Service never changes, because each Verifier Contract translates the source ledger’s format into the local one.",
  components: [
    {
      name: "CLPR Service",
      body: "Native to the ledger or deployed as a smart contract. Curates CLPR state, manages Channels, routes messages and coordinates payment between Connectors, applications and Endpoints.",
    },
    {
      name: "CLPR Endpoints",
      body: "Read local ledger state, build state-proven bundles in the source ledger’s format, sync them with peer Endpoints, and rotate the ledger’s trust anchor in remote Verifier Contracts.",
    },
    {
      name: "Verifier Contracts",
      body: "Immutable contracts, one per target ledger type. They verify incoming state proofs against an updatable trust anchor and decode bundles into the local data format.",
    },
  ],
  stepsTitle: "Connecting a new ledger to Hiero",
  steps: [
    "Implement a CLPR Service and CLPR Endpoints for the new ledger type.",
    "Implement a Hiero Verifier Contract deployable to the new ledger.",
    "Implement a Verifier Contract for the new ledger, deployable to Hiero.",
    "Deploy each Verifier Contract to the opposite network.",
    "Set up a Channel between the two CLPR Services.",
    "Share each network’s CLPR Endpoints with the other.",
    "Bond a common Connector to the Channel.",
    "Deploy CLPR applications configured for that Connector and Channel.",
  ],
  footnote:
    "Once both ledgers implement CLPR natively, their validators become the Endpoints and no separate infrastructure is needed.",
  // Labels inside the small diagrams.
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

/* ------------------------------------------------------------------------ */
/* Code                                                                       */
/* ------------------------------------------------------------------------ */

export const repositories = {
  id: "code",
  eyebrow: "Open source",
  title: "Open specification, open implementations.",
  lead:
    "The specification is normative and has no software dependencies, so it can be implemented in any language for any chain. The reference implementations show one way to do it.",
  openLabel: "Open repository",
  featuredLabel: "Start here",
  facts: [
    { term: "Code license", detail: "Apache-2.0 with DCO sign-off" },
    { term: "Specification", detail: "Community Specification License 1.0" },
    { term: "First native adopter", detail: "Hiero consensus node" },
  ],
  clone: {
    label: "Clone the specification",
    command: "git clone https://github.com/LFDT-CLPR/clpr-spec.git",
    copy: "Copy command",
    copied: "Copied",
  },
  items: [
    {
      name: "clpr-spec",
      kind: "Specification",
      body: "The CLPR specification: component behavior, common data structures and formats, plus architecture decision records tracing how the design evolved.",
      href: links.spec,
    },
    {
      name: "clpr-smart-contracts",
      kind: "Solidity",
      body: "CLPR Service and Verifier Contracts for EVM networks, deployable to Hyperledger Besu today.",
      href: links.smartContracts,
    },
    {
      name: "clpr-endpoint",
      kind: "Java",
      body: "A CLPR Endpoint that reads EVM chain state, submits bundles to Besu networks and manages trust-anchor updates for Besu QBFT consensus.",
      href: links.endpoint,
    },
    {
      name: "governance",
      kind: "Governance",
      body: "How the lab is run: maintainers, processes and decision-making, following LF Decentralized Trust practices.",
      href: links.governance,
    },
    {
      name: "hiero-consensus-node #27029",
      kind: "Native integration",
      body: "The native CLPR service inside the Hiero consensus node, proposed in HIP-1535 and pending approval by the Hiero TSC.",
      href: links.hieroNative,
    },
  ],
} as const;

/* ------------------------------------------------------------------------ */
/* Terminology                                                                */
/* ------------------------------------------------------------------------ */

export const glossary = {
  id: "terminology",
  eyebrow: "Shared vocabulary",
  title: "Terminology",
  lead: "The terms used throughout the CLPR specification.",
  filterLabel: "Filter terms",
  filterPlaceholder: "Try “proof” or “Channel”",
  emptyState: "No term matches “{query}”. Clear the filter to see all {count} terms.",
  clearLabel: "Clear filter",
  allLabel: "All",
  categories: ["Components", "Network", "Messaging", "Trust", "Payment"],
  relatedLabel: "Related terms",
  position: "Term {index} of {count}",
  previous: "Previous term",
  next: "Next term",
  terms: [
    { term: "Peer Ledger", category: "Network", definition: "The other ledger that a network communicates with over CLPR." },
    { term: "State Proof", category: "Trust", definition: "A cryptographic proof that a piece of data exists in a ledger’s committed state or history. State proofs are CLPR’s only mechanism of cross-ledger trust." },
    { term: "CLPR Endpoint", category: "Components", definition: "A node that periodically exchanges configuration and messages with peer Endpoints." },
    { term: "CLPR Service", category: "Components", definition: "Curates CLPR state per ledger, manages Channel state, routes messages to applications and coordinates payment between Connectors, applications and Endpoints." },
    { term: "Channel", category: "Network", definition: "An on-ledger communication path to a specific peer CLPR Service, bound to one Verifier Contract for its lifetime. Several Channels may connect the same two ledgers." },
    { term: "Connector", category: "Payment", definition: "An economic entity that authorizes messages on the source ledger and pays for their execution on the destination ledger." },
    { term: "Message", category: "Messaging", definition: "An arbitrary byte payload plus routing metadata: one unit of cross-ledger communication." },
    { term: "Bundle", category: "Messaging", definition: "An ordered batch of messages transmitted together between two ledgers, accompanied by a state proof." },
    { term: "Data Message", category: "Messaging", definition: "A message carrying application content. Every Data Message produces exactly one Response Message." },
    { term: "Response Message", category: "Messaging", definition: "Generated on the destination ledger after a Data Message is processed; carries a status and reply bytes back to the source." },
    { term: "Control Message", category: "Messaging", definition: "A protocol message that manages Channel state, such as configuration updates, rather than carrying application data." },
    { term: "Configuration", category: "Network", definition: "A ledger’s ChainID, protocol version and throttle parameters, as published to peers." },
    { term: "Verifier Contract", category: "Trust", definition: "An immutable smart contract that verifies state proofs from a remote ledger and decodes bundle content into the local ledger’s data format." },
    { term: "Trust Anchor", category: "Trust", definition: "The verifier-defined representation of a peer ledger’s current signing authority, stored per Channel and updated only through verified proofs." },
  ],
} as const;

/* ------------------------------------------------------------------------ */
/* Roadmap                                                                    */
/* ------------------------------------------------------------------------ */

export const roadmap = {
  id: "roadmap",
  eyebrow: "Roadmap",
  title: "The first year as an LFDT Lab.",
  lead: "A rough plan from the lab proposal. It will change as the community grows.",
  currentLabel: "Now",
  phases: [
    {
      period: "Months 1–3",
      name: "Bootstrapping",
      current: true,
      items: [
        "Set up the specification governance process",
        "Build, test and release pipelines for the reference implementations",
        "Collaboration tooling and onboarding material",
      ],
    },
    {
      period: "Months 4–6",
      name: "Maturing",
      current: false,
      items: [
        "Best practices and a library for CLPR applications",
        "More Service, Verifier and Endpoint reference implementations",
        "Stabilize the specification as version 1.0",
      ],
    },
    {
      period: "Months 7–9",
      name: "Evangelizing",
      current: false,
      items: [
        "Support community-built CLPR applications",
        "Expand reference implementations and deployments",
        "Work with ledger maintainers on native integrations",
      ],
    },
    {
      period: "Months 10–12",
      name: "Sustainment",
      current: false,
      items: [
        "A community of experts across the full CLPR stack",
        "A maturing ecosystem of applications built on CLPR",
      ],
    },
  ],
} as const;

/* ------------------------------------------------------------------------ */
/* Get involved                                                               */
/* ------------------------------------------------------------------------ */

export const involvement = {
  id: "get-involved",
  eyebrow: "Get involved",
  title: "Build CLPR in the open.",
  lead:
    "CLPR is stewarded under the neutral, vendor-independent governance of LF Decentralized Trust. Hashgraph and Hedera are the initial maintainers, and the lab is open to anyone who wants to help.",
  paths: [
    {
      name: "Shape the specification",
      body: "Review the spec and its decision records, raise issues and propose changes. Specification work follows the Community Specification License 1.0.",
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
      cta: "Read the governance docs",
      href: links.governance,
    },
  ],
  closing: {
    title: "Start with the specification.",
    body: "It is the shortest path to understanding how two ledgers can trust each other directly.",
    primary: { label: "Read the specification", href: links.spec },
    secondary: { label: "Follow LFDT-CLPR on GitHub", href: links.githubOrg },
  },
} as const;

/* ------------------------------------------------------------------------ */
/* Footer                                                                     */
/* ------------------------------------------------------------------------ */

export const footer = {
  tagline: "Bridgeless cross-ledger messaging, specified in the open.",
  statusLabel: "Lab status",
  githubCta: "Follow LFDT-CLPR on GitHub",
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
        { label: "Roadmap", href: "/#roadmap" },
        { label: "Terminology", href: "/#terminology" },
      ],
    },
    {
      title: "Project",
      links: [
        { label: "Specification", href: links.spec },
        { label: "Smart contracts", href: links.smartContracts },
        { label: "Endpoint", href: links.endpoint },
        { label: "Governance", href: links.governance },
      ],
    },
    {
      title: "Foundation",
      links: [
        { label: "LF Decentralized Trust", href: links.lfdt },
        { label: "Lab proposal", href: links.labProposal },
        { label: "Apache License 2.0", href: links.apacheLicense },
        { label: "Developer Certificate of Origin", href: links.dco },
      ],
    },
    {
      title: "Ecosystem",
      links: [
        { label: "Hiero", href: links.hiero },
        { label: "Hedera", href: links.hedera },
        { label: "CLPR at Hashgraph", href: links.hashgraph },
      ],
    },
  ],
  // Placeholder legal line. Replace with the official LFDT lab footer text before launch.
  legal:
    "© {year} CLPR contributors. Code is licensed under Apache-2.0; the specification under the Community Specification License 1.0. LF Decentralized Trust is a project of The Linux Foundation.",
} as const;

export const site = {
  name: "CLPR",
  expansion: "Cross Ledger Protocol",
  fullName: "CLPR — Cross Ledger Protocol",
  description:
    "CLPR (“Clipper”) is an open, bridgeless Cross Ledger Protocol for reliable, in-order message passing between independent ledger networks. An LF Decentralized Trust Lab.",
  skipLink: "Skip to content",
  menuOpen: "Open menu",
  menuClose: "Close menu",
  githubLabel: "GitHub",
  homeLabel: "CLPR home",
} as const;
