/*
 * The networks the background draws: real topologies instead of point clouds.
 *
 * Every scene is a graph of nodes (validators, Endpoints, Verifier Contracts,
 * commits, cities …), links between them and packets that travel the links.
 * networkLayer.ts renders them as shaded nodes, glowing lines and moving
 * light; sceneForms.ts adds the particle dust around them. Coordinates are
 * the same local units as the particle drawings (roughly −2.3 … 2.3 wide).
 *
 *   hero       a ring of validators orbiting the CLPR spiral, gossiping
 *   story      two ledgers as validator meshes, a Channel between their Endpoints,
 *              bundles that cross, proofs that Ledger B's Verifier checks
 *   chain      a running-hash chain of blocks, attested by a validator quorum below
 *   route      the seven stops of one message across a Channel, and its response
 *   bridge     a hub of custodians that crumbles; the direct proof link stays
 *   mesh       a triangulated network floor under the layer stack
 *   globe      validators in real cities, four ledgers, Channels between them
 *   branches   a git history with contributors pushing commits
 *   growth     the network growing through the four roadmap phases
 *   knowledge  the glossary terms, linked where one definition mentions another
 *   community  a scale-free contributor network that keeps gaining members
 */

import { glossary, roadmap } from "@/content/site";
import { RELATED } from "@/lib/glossary";
import type { FormName } from "@/components/sceneMotion";

export type V3 = [number, number, number];
export type Random = () => number;

export function seeded(seed: number): Random {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
export const lerp = (a: V3, b: V3, t: number): V3 => add(a, scale(sub(b, a), t));
export const length = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const normalize = (a: V3): V3 => scale(a, 1 / (length(a) || 1));
const distance = (a: V3, b: V3) => length(sub(a, b));

/** How each node is drawn; the order is the index the glyph shader switches on. */
export const ROLES = [
  "validator", // a ledger node: a soft four-ray star
  "endpoint", // a CLPR Endpoint: a star in a hexagon
  "verifier", // a Verifier Contract: a star in a diamond
  "custodian", // a bridge custodian or vault: a hollow grey square
  "commit", // a commit, or a node that is planned but not live: a hollow ring
  "leaf", // a small node with a soft glow
  "packet", // a message in transit
  "proof", // the ring of a state proof around a bundle
  "city", // a validator on the globe
  "atmosphere", // the rim light of the globe
  "hub", // an application or a well-connected node: a larger star with a ring
  "ripple", // an expanding ring: arrival, verification, a new member
] as const;
export type Role = (typeof ROLES)[number];

/** Story only: the space an element is drawn in. */
export const GROUP = { ledgerA: 0, ledgerB: 1, channel: 2 } as const;
/** Story only: what has to be on screen before an element shows. */
export const GATE = { always: 0, channel: 1, proof: 2 } as const;

export type GraphNode = {
  at: V3;
  size: number;
  role: Role;
  tone: number;
  alpha: number;
  order: number;
  group: number;
  gate: number;
  crumble: boolean;
  seed: number;
  /** Ripple: cycles per second and phase; 0 for none. The ripple starts when (time × speed + phase) wraps. */
  pulse: [number, number];
  tag: number;
};

export type GraphLink = {
  a: V3;
  b: V3;
  /** Quadratic Bézier control point (mode 0), or [lift above the sphere, 0, 0] (mode 1, a great-circle arc). */
  c: V3;
  mode: 0 | 1;
  segments: number;
  tone: [number, number];
  width: number;
  alpha: number;
  dash: number;
  order: number;
  group: number;
  gate: number;
  crumble: boolean;
  seed: number;
  tags: [number, number];
};

export type GraphPacket = {
  link: number;
  /** Cycles per second. In each cycle the packet travels during [start, start + duration]. */
  speed: number;
  phase: number;
  start: number;
  duration: number;
  reverse: boolean;
  size: number;
  role: Role;
  tone: number;
  /** Length of the light trail, as a fraction of the link; 0 for none. */
  tail: number;
  width: number;
  alpha: number;
  gate: number;
};

type NodeOptions = Partial<Omit<GraphNode, "at">>;
type LinkOptions = Partial<Omit<GraphLink, "a" | "b" | "c" | "mode" | "tone">> & {
  tone?: number | [number, number];
  /** Bend: offset of the Bézier control point from the midpoint. */
  lift?: V3;
  /** Great-circle arc on the unit sphere, lifted this much at its middle. */
  arc?: number;
};
type PacketOptions = Partial<Omit<GraphPacket, "link">> & { speed: number };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export class Graph {
  nodes: GraphNode[] = [];
  links: GraphLink[] = [];
  packets: GraphPacket[] = [];
  private random: Random;

  constructor(seed: number) {
    this.random = seeded(seed);
  }

  node(at: V3, options: NodeOptions = {}): number {
    this.nodes.push({
      at,
      size: 0.05,
      role: "validator",
      tone: 0.3,
      alpha: 1,
      order: clamp01((at[0] + 2.4) / 4.8),
      group: 0,
      gate: GATE.always,
      crumble: false,
      seed: this.random(),
      pulse: [0, 0],
      tag: -1,
      ...options,
    });
    return this.nodes.length - 1;
  }

  link(from: number | V3, to: number | V3, options: LinkOptions = {}): number {
    const start = typeof from === "number" ? this.nodes[from] : undefined;
    const end = typeof to === "number" ? this.nodes[to] : undefined;
    const a = start?.at ?? (from as V3);
    const b = end?.at ?? (to as V3);
    const { lift, arc, tone = start?.tone ?? 0.3, ...rest } = options;
    const mode = arc === undefined ? 0 : 1;
    const c: V3 = mode === 1 ? [arc ?? 0, 0, 0] : add(lerp(a, b, 0.5), lift ?? [0, 0, 0]);
    this.links.push({
      a,
      b,
      c,
      mode,
      segments: mode === 1 ? 36 : lift ? 28 : 1,
      tone: typeof tone === "number" ? [tone, end?.tone ?? tone] : tone,
      width: 1,
      alpha: 0.7,
      dash: 0,
      order: start?.order ?? clamp01((a[0] + 2.4) / 4.8),
      group: start?.group ?? 0,
      gate: GATE.always,
      crumble: false,
      seed: this.random(),
      tags: [start?.tag ?? -1, end?.tag ?? -1],
      ...rest,
    });
    return this.links.length - 1;
  }

  packet(link: number, options: PacketOptions) {
    this.packets.push({
      link,
      phase: 0,
      start: 0,
      duration: 1,
      reverse: false,
      size: 0.03,
      role: "packet",
      tone: this.links[link].tone[0],
      tail: 0.3,
      width: 1.4,
      alpha: 1,
      gate: this.links[link].gate,
      ...options,
    });
  }

  /** An expanding ring at `at`, starting each time the cycle reaches `when` (0–1). */
  ripple(at: V3, speed: number, when: number, options: NodeOptions = {}) {
    return this.node(at, { role: "ripple", size: 0.06, alpha: 0.9, ...options, pulse: [speed, 1 - when] });
  }

  /** Links each node to its k nearest neighbours (each pair once). */
  mesh(ids: number[], k: number, options: LinkOptions = {}): number[] {
    const seen = new Set<string>();
    const links: number[] = [];
    for (const id of ids) {
      const nearest = ids
        .filter((other) => other !== id)
        .sort((p, q) => distance(this.nodes[p].at, this.nodes[id].at) - distance(this.nodes[q].at, this.nodes[id].at))
        .slice(0, k);
      for (const other of nearest) {
        const key = id < other ? `${id}-${other}` : `${other}-${id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        links.push(this.link(id, other, options));
      }
    }
    return links;
  }

  /** Gossip: one packet per link, at random phases and in random directions. */
  gossip(links: number[], options: Partial<PacketOptions> & { speed?: number } = {}) {
    const { speed = 0.3, ...rest } = options;
    for (const link of links) {
      this.packet(link, {
        speed: speed * (0.7 + this.random() * 0.7),
        phase: this.random(),
        reverse: this.random() < 0.5,
        ...rest,
      });
    }
  }

  nearest(ids: number[], to: V3, k: number): number[] {
    return [...ids].sort((p, q) => distance(this.nodes[p].at, to) - distance(this.nodes[q].at, to)).slice(0, k);
  }

  rand() {
    return this.random();
  }
}

/** Evenly spread points on a sphere. */
function sphere(count: number, radius: number, center: V3 = [0, 0, 0], squash: V3 = [1, 1, 1]): V3[] {
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / count;
    const r = Math.sqrt(1 - y * y);
    const angle = i * Math.PI * (3 - Math.sqrt(5));
    return add(center, [Math.cos(angle) * r * radius * squash[0], y * radius * squash[1], Math.sin(angle) * r * radius * squash[2]]);
  });
}

/** A deterministic force-directed layout in 3D, fitted into a box. */
function forceLayout(count: number, edges: [number, number][], random: Random, box: V3, spacing = 1.4): V3[] {
  const points: V3[] = sphere(count, 1).map((p) => add(p, [(random() - 0.5) * 0.3, (random() - 0.5) * 0.3, (random() - 0.5) * 0.3]));
  const k = spacing / Math.cbrt(count);
  for (let step = 0; step < 360; step++) {
    const cooling = 0.08 * (1 - step / 360) + 0.004;
    const forces: V3[] = points.map(() => [0, 0, 0]);
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const d = sub(points[i], points[j]);
        const l = Math.max(0.02, length(d));
        const push = scale(d, (k * k) / (l * l));
        forces[i] = add(forces[i], push);
        forces[j] = sub(forces[j], push);
      }
      forces[i] = sub(forces[i], scale(points[i], 0.06));
    }
    for (const [i, j] of edges) {
      const d = sub(points[j], points[i]);
      const pull = scale(d, length(d) / k);
      forces[i] = add(forces[i], pull);
      forces[j] = sub(forces[j], pull);
    }
    points.forEach((p, i) => {
      const f = forces[i];
      const l = length(f);
      points[i] = add(p, scale(f, Math.min(l, cooling) / (l || 1)));
    });
  }
  // Fit the bulk of the nodes to the box; outliers are pulled in softly.
  const extent = [0, 1, 2].map((axis) => {
    const values = points.map((p) => Math.abs(p[axis])).sort((a, b) => a - b);
    return values[Math.floor(values.length * 0.9)] || 1;
  });
  const soft = (value: number, limit: number) =>
    Math.abs(value) <= limit ? value : Math.sign(value) * (limit + (Math.abs(value) - limit) * 0.25);
  return points.map((p) => [0, 1, 2].map((axis) => soft((p[axis] / extent[axis]) * box[axis], box[axis] * 1.05)) as V3);
}

/** The corners of a cube, and which pairs of corners form its 12 edges. */
function cube(center: V3, size: number, rx: number, ry: number): { corners: V3[]; edges: [number, number][] } {
  const corners: V3[] = [];
  for (let i = 0; i < 8; i++) {
    const [x, y, z] = [(i & 1 ? 1 : -1) * size * 0.5, (i & 2 ? 1 : -1) * size * 0.5, (i & 4 ? 1 : -1) * size * 0.5];
    const y1 = y * Math.cos(rx) - z * Math.sin(rx);
    const z1 = y * Math.sin(rx) + z * Math.cos(rx);
    corners.push(add(center, [x * Math.cos(ry) + z1 * Math.sin(ry), y1, -x * Math.sin(ry) + z1 * Math.cos(ry)]));
  }
  const edges: [number, number][] = [];
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) if ([1, 2, 4].includes(i ^ j)) edges.push([i, j]);
  return { corners, edges };
}

/** A point on the unit sphere; longitude 0 faces the camera before the globe turns. */
export function onGlobe(latitude: number, longitude: number, radius = 1): V3 {
  const lat = (latitude * Math.PI) / 180;
  const lon = (longitude * Math.PI) / 180;
  return [Math.cos(lat) * Math.sin(lon) * radius, Math.sin(lat) * radius, Math.cos(lat) * Math.cos(lon) * radius];
}

/** Brand tones per side of a Channel. */
const TONE_A = 0.1;
const TONE_B = 0.68;
const TONE_PROOF = 0.86;

/*
 * One bundle crossing a Channel: three messages, one state proof around them,
 * a ripple where it lands, and three responses on the way back. All timings are
 * fractions of one cycle of `speed`.
 */
function bundleTraffic(
  graph: Graph,
  out: number,
  back: number,
  speed: number,
  options: { gate?: number; proofGate?: number; arriveAt?: V3; returnAt?: V3; arriveGroup?: number; returnGroup?: number; size?: number },
) {
  const { gate = GATE.always, proofGate = gate, size = 0.034 } = options;
  const lead = 0.06;
  for (const phase of [lead, lead - 0.03, lead - 0.06]) {
    graph.packet(out, { speed, phase, start: 0, duration: 0.5, size, tone: 0.28, tail: 0.08, gate });
    graph.packet(back, { speed, phase, start: 0.55, duration: 0.4, size: size * 0.8, tone: 0.62, tail: 0.06, alpha: 0.75, gate });
  }
  // One proof covers every message in the bundle.
  graph.packet(out, { speed, phase: lead - 0.03, start: 0, duration: 0.5, size: size * 2.6, role: "proof", tone: TONE_PROOF, tail: 0, gate: proofGate });
  // The lead message lands when the cycle reaches 0.5 - lead; the responses when it reaches 0.95 - lead.
  if (options.arriveAt) graph.ripple(options.arriveAt, speed, 0.5 - lead, { tone: TONE_B, size: 0.07, group: options.arriveGroup ?? 0, gate });
  if (options.returnAt) graph.ripple(options.returnAt, speed, 0.95 - lead, { tone: TONE_A, size: 0.05, group: options.returnGroup ?? 0, gate, alpha: 0.6 });
}

/* ---- The hero ------------------------------------------------------------ */

/*
 * Drawn in orbit space: x is the angle, y the radius, z the height above the
 * ring's plane (all in units of the spiral's half width). The shader turns the
 * ring around the spiral like a planet's ring, so a straight link here follows it.
 */
export function heroGraph(): Graph {
  const graph = new Graph(3);
  const count = 16;
  const ids = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (graph.rand() - 0.5) * 0.12;
    const endpoint = i % 4 === 0;
    return graph.node([angle, 1.14 + (graph.rand() - 0.5) * 0.08, (graph.rand() - 0.5) * 0.06], {
      size: endpoint ? 0.03 : 0.021,
      role: endpoint ? "endpoint" : "validator",
      tone: 0.12 + (i / count) * 0.75,
      order: i / count,
    });
  });
  // A ring lattice: each validator talks to its two neighbours on either side.
  const links: number[] = [];
  ids.forEach((id, i) => {
    for (const step of [1, 2]) {
      const other = ids[(i + step) % count];
      const to = graph.nodes[other].at;
      const wrapped: V3 = i + step >= count ? [to[0] + Math.PI * 2, to[1], to[2]] : to;
      links.push(graph.link(id, wrapped, { segments: step * 10, width: step === 1 ? 0.9 : 0.7, alpha: step === 1 ? 0.42 : 0.16, tone: [graph.nodes[id].tone, graph.nodes[other].tone] }));
    }
  });
  graph.gossip(links, { speed: 0.3, size: 0.016, tail: 0.5, alpha: 0.9 });
  return graph;
}

/* ---- The scroll story -------------------------------------------------- */

/*
 * Each ledger is drawn in its own unit sphere (the particle shell sits at
 * radius 0.9–1) and turns around the axis that points at the other ledger, so
 * its Endpoint stays put at the pole. The Channel is drawn in a space where
 * x = −1 is Ledger A's Endpoint and x = 1 is Ledger B's; y and z are in units of
 * the ledger radius.
 */
export const STORY_SPEED = 0.3;

export function storyGraph(): Graph {
  const graph = new Graph(7);
  const endpoints: V3[] = [];
  let verifier = -1;
  let verifierLinks: number[] = [];

  for (const [group, side, tone] of [
    [GROUP.ledgerA, 1, TONE_A],
    [GROUP.ledgerB, -1, TONE_B],
  ] as const) {
    const validators = sphere(13, 0.66).map((at, i) =>
      graph.node(at, {
        size: 0.05,
        role: "validator",
        tone: tone + ((i * 37) % 11) / 11 * 0.16 - 0.08,
        group,
        order: 0.1 + ((i * 53) % 13) / 13 * 0.6,
      }),
    );
    const gossipLinks = graph.mesh(validators, 3, { width: 0.9, alpha: 0.5, group });
    graph.gossip(gossipLinks, { speed: 0.32, size: 0.022, tail: 0.32, alpha: 0.9 });

    const endpointAt: V3 = [side, 0, 0];
    endpoints.push(endpointAt);
    const endpoint = graph.node(endpointAt, { size: 0.085, role: "endpoint", tone, group, order: 0.75 });
    for (const validator of graph.nearest(validators, endpointAt, 3)) {
      graph.link(endpoint, validator, { width: 1.1, alpha: 0.8, group, order: 0.8 });
    }

    if (group === GROUP.ledgerB) {
      // The Verifier Contract, just inside the Endpoint.
      verifier = graph.node([-0.58, -0.24, 0.3], { size: 0.075, role: "verifier", tone: TONE_PROOF, group, order: 0.8 });
      graph.link(endpoint, verifier, { width: 1.1, alpha: 0.8, group, order: 0.85 });
      verifierLinks = graph
        .nearest(validators, [-0.58, -0.24, 0.3], 4)
        .map((validator) => graph.link(verifier, validator, { width: 1, alpha: 0.6, group, order: 0.9 }));
    }
  }

  // The Channel: an outbound lane above, the responses below it.
  const out = graph.link([-1, 0, 0], [1, 0, 0], {
    lift: [0, 0.66, 0.36],
    tone: [TONE_A, TONE_B],
    width: 1.8,
    alpha: 1.05,
    group: GROUP.channel,
    gate: GATE.channel,
    order: 0,
    segments: 44,
  });
  const back = graph.link([1, 0, 0], [-1, 0, 0], {
    lift: [0, 0.3, 0.16],
    tone: [TONE_B, TONE_A],
    width: 1,
    alpha: 0.42,
    group: GROUP.channel,
    gate: GATE.channel,
    order: 0.2,
    segments: 44,
  });
  bundleTraffic(graph, out, back, STORY_SPEED, {
    gate: GATE.channel,
    proofGate: GATE.proof,
    arriveAt: endpoints[1],
    arriveGroup: GROUP.ledgerB,
    returnAt: endpoints[0],
    returnGroup: GROUP.ledgerA,
    size: 0.05,
  });

  // Ledger B checks the proof, then the verified state spreads through its network.
  const toVerifier = graph.link(endpoints[1], graph.nodes[verifier].at, { group: GROUP.ledgerB, alpha: 0, gate: GATE.proof });
  graph.packet(toVerifier, { speed: STORY_SPEED, phase: 0.03, start: 0.5, duration: 0.08, size: 0.12, role: "proof", tone: TONE_PROOF, tail: 0, gate: GATE.proof });
  graph.ripple(graph.nodes[verifier].at, STORY_SPEED, 0.55, { tone: TONE_PROOF, size: 0.09, group: GROUP.ledgerB, gate: GATE.proof, alpha: 1.3 });
  for (const link of verifierLinks) {
    graph.packet(link, { speed: STORY_SPEED, phase: 0.03, start: 0.58, duration: 0.16, size: 0.03, tone: TONE_PROOF, tail: 0.5, gate: GATE.proof });
  }
  return graph;
}

/* ---- Section illustrations ------------------------------------------------ */

/** Guarantees: a running-hash chain of blocks, enforced by a validator quorum below. */
function chain(): Graph {
  const graph = new Graph(5);
  const count = 6;
  const speed = 0.17;
  const hop = 1 / count;
  const centers: V3[] = Array.from({ length: count }, (_, k) => [-1.9 + k * 0.76, -0.05 + k * 0.15, -0.3 + 0.22 * Math.sin(k * 1.3)]);
  centers.forEach((center, k) => {
    const newest = k === count - 1;
    const tone = 0.06 + k * 0.15;
    const order = k / count;
    const { corners, edges } = cube(center, 0.38, 0.42, 0.5 + k * 0.32);
    for (const [i, j] of edges) {
      graph.link(corners[i], corners[j], { tone, width: newest ? 1.5 : 1.05, alpha: newest ? 1.25 : 0.72, order });
    }
    graph.node(center, { size: 0.055, role: "leaf", tone, alpha: newest ? 1.5 : 0.9, order });
    if (k > 0) {
      const previous = centers[k - 1];
      const dir = normalize(sub(center, previous));
      const link = graph.link(add(previous, scale(dir, 0.27)), sub(center, scale(dir, 0.27)), {
        tone: [tone - 0.15, tone],
        width: 1.3,
        alpha: 0.85,
        order,
      });
      // The running hash: one pulse relays from block to block, then the chain grows.
      graph.packet(link, { speed, start: (k - 1) * hop, duration: hop, size: 0.04, tone, tail: 0.6 });
    }
    if (newest) graph.ripple(center, speed, (count - 1) * hop, { size: 0.16, tone: 0.95, order });
  });

  // The ledger underneath: validators that attest each block.
  const validators = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2 + (graph.rand() - 0.5) * 0.2;
    const x = Math.cos(angle) * 1.75;
    const at: V3 = [x, -0.86 + x * 0.12 + (graph.rand() - 0.5) * 0.1, Math.sin(angle) * 0.62 - 0.2];
    return graph.node(at, { size: 0.04, role: "validator", tone: clamp01((x + 2) / 4) * 0.85 });
  });
  const gossipLinks = graph.mesh(validators, 3, { width: 0.85, alpha: 0.42 });
  graph.gossip(gossipLinks, { speed: 0.35, size: 0.02, tail: 0.35 });
  centers.forEach((center) => {
    const [validator] = graph.nearest(validators, center, 1);
    graph.link(validator, sub(center, [0, 0.2, 0]), { width: 0.7, alpha: 0.26, dash: 7 });
  });
  return graph;
}

/** How it works: the seven stops of one message across a Channel, and its response. */
function route(): Graph {
  const graph = new Graph(11);
  const speed = 0.095;

  // Each ledger is a small network of validators around the CLPR components.
  const ledgers = ([[-1.35, TONE_A], [1.35, TONE_B]] as const).map(([x, tone]) => {
    const validators = sphere(10, 0.82, [x, -0.1, -0.3], [1, 0.55, 0.7]).map((at) =>
      graph.node(at, { size: 0.028, role: "leaf", tone, alpha: 0.5 }),
    );
    graph.gossip(graph.mesh(validators, 3, { width: 0.75, alpha: 0.16 }), { speed: 0.25, size: 0.014, tail: 0.3, alpha: 0.45 });
    return validators;
  });

  const stops = [
    graph.node([-2.02, 0.34, 0.16], { size: 0.06, role: "hub", tone: 0.02 }), // Application
    graph.node([-1.38, -0.06, -0.08], { size: 0.065, role: "validator", tone: 0.1 }), // CLPR Service
    graph.node([-0.74, 0.14, 0.06], { size: 0.07, role: "endpoint", tone: 0.2 }), // CLPR Endpoint
    graph.node([0.74, 0.14, 0.06], { size: 0.07, role: "endpoint", tone: 0.6 }), // CLPR Endpoint
    graph.node([1.12, -0.22, 0.22], { size: 0.065, role: "verifier", tone: TONE_PROOF }), // Verifier Contract
    graph.node([1.5, 0.06, -0.12], { size: 0.065, role: "validator", tone: 0.72 }), // CLPR Service
    graph.node([2.04, 0.38, 0.12], { size: 0.06, role: "hub", tone: 0.82 }), // Application
  ];
  stops.forEach((stop, index) => {
    for (const validator of graph.nearest(ledgers[index < 3 ? 0 : 1], graph.nodes[stop].at, 2)) {
      graph.link(stop, validator, { width: 0.7, alpha: 0.18, dash: 6 });
    }
  });

  const path = [
    graph.link(stops[0], stops[1], { width: 1.3, alpha: 0.8 }),
    graph.link(stops[1], stops[2], { width: 1.3, alpha: 0.8 }),
    graph.link(stops[2], stops[3], { lift: [0, 0.6, 0.24], width: 1.8, alpha: 1.05, segments: 36 }),
    graph.link(stops[3], stops[4], { width: 1.3, alpha: 0.8 }),
    graph.link(stops[4], stops[5], { width: 1.3, alpha: 0.8 }),
    graph.link(stops[5], stops[6], { width: 1.3, alpha: 0.8 }),
  ];
  const returnPath = [
    graph.link(stops[5], stops[3], { width: 0.9, alpha: 0.35, lift: [0, -0.12, 0] }),
    graph.link(stops[3], stops[2], { lift: [0, -0.42, -0.12], width: 1, alpha: 0.42, segments: 36, tone: [0.6, 0.2] }),
    graph.link(stops[2], stops[1], { width: 0.9, alpha: 0.35, lift: [0, -0.1, 0] }),
  ];

  // The message: hop by hop, as in the walkthrough below.
  const hops: [number, number, number][] = [
    [path[0], 0, 0.07],
    [path[1], 0.07, 0.14],
    [path[2], 0.14, 0.34],
    [path[3], 0.34, 0.4],
    [path[4], 0.4, 0.46],
    [path[5], 0.46, 0.53],
  ];
  const arrivals = [1, 2, 3, 4, 5, 6];
  hops.forEach(([link, start, end], index) => {
    graph.packet(link, { speed, start, duration: end - start, size: 0.045, tone: 0.3, tail: index === 2 ? 0.3 : 0.7 });
    const stop = graph.nodes[stops[arrivals[index]]];
    graph.ripple(stop.at, speed, end, { tone: index === 3 ? TONE_PROOF : stop.tone, size: index === 3 ? 0.09 : 0.065 });
  });
  graph.packet(path[2], { speed, start: 0.14, duration: 0.2, size: 0.11, role: "proof", tone: TONE_PROOF, tail: 0 });

  // Exactly one response, back over the same Channel.
  const responses: [number, number, number, number][] = [
    [returnPath[0], 0.6, 0.66, 3],
    [returnPath[1], 0.66, 0.84, 2],
    [returnPath[2], 0.84, 0.9, 1],
  ];
  for (const [link, start, end, arrival] of responses) {
    graph.packet(link, { speed, start, duration: end - start, size: 0.038, tone: 0.72, tail: 0.5 });
    graph.ripple(graph.nodes[stops[arrival]].at, speed, end, { tone: 0.72, size: 0.055, alpha: 0.6 });
  }
  return graph;
}

/** Why bridgeless: a hub of custodians between two ledgers crumbles; the direct proof link stays. */
function bridge(): Graph {
  const graph = new Graph(13);
  const ledgers = ([[-2.0, TONE_A], [2.0, TONE_B]] as const).map(([x, tone]) => {
    const validators = sphere(10, 0.44, [x, 0.12, 0]).map((at) => graph.node(at, { size: 0.042, role: "validator", tone }));
    graph.gossip(graph.mesh(validators, 3, { width: 0.9, alpha: 0.5 }), { speed: 0.32, size: 0.02, tail: 0.32 });
    const endpointAt: V3 = [x - Math.sign(x) * 0.5, 0.2, 0.06];
    const endpoint = graph.node(endpointAt, { size: 0.065, role: "endpoint", tone });
    for (const validator of graph.nearest(validators, endpointAt, 3)) graph.link(endpoint, validator, { width: 1, alpha: 0.75 });
    return { validators, endpoint };
  });

  // The bridge: custodians around a vault of pooled assets, wired to both ledgers.
  const hub: V3 = [0, -0.52, 0];
  const ghost = { tone: -1, crumble: true } as const;
  const vault = graph.node(hub, { size: 0.11, role: "custodian", alpha: 1, ...ghost });
  const ringU: V3 = [1, 0, 0];
  const ringV: V3 = normalize([0, 0.35, 0.94]);
  const custodians = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2 + 0.3;
    const at = add(hub, add(scale(ringU, Math.cos(angle) * 0.46), scale(ringV, Math.sin(angle) * 0.46)));
    return graph.node(at, { size: 0.058, role: "custodian", alpha: 0.95, ...ghost });
  });
  custodians.forEach((custodian, i) => {
    graph.link(custodian, custodians[(i + 1) % custodians.length], { width: 1, alpha: 0.6, ...ghost });
    graph.link(vault, custodian, { width: 0.85, alpha: 0.42, dash: 5, ...ghost });
  });
  for (const [side, ledger] of [[-1, ledgers[0]], [1, ledgers[1]]] as const) {
    const near = graph.nearest(custodians, [side * 0.6, -0.5, 0], 2);
    const reach = graph.nearest(ledger.validators, hub, 2);
    near.forEach((custodian, i) => {
      const wire = graph.link(reach[i], custodian, { width: 1, alpha: 0.5, dash: 12, ...ghost });
      graph.packet(wire, { speed: 0.12, phase: graph.rand(), size: 0.026, tone: -1, tail: 0.25, alpha: 0.7, reverse: side > 0 });
    });
  }

  // CLPR: state proofs straight from ledger to ledger.
  const out = graph.link(ledgers[0].endpoint, ledgers[1].endpoint, { lift: [0, 1.0, 0.28], tone: [TONE_A, TONE_B], width: 1.8, alpha: 1.1, segments: 40 });
  const back = graph.link(ledgers[1].endpoint, ledgers[0].endpoint, { lift: [0, 0.62, 0.14], tone: [TONE_B, TONE_A], width: 1, alpha: 0.42, segments: 40 });
  bundleTraffic(graph, out, back, 0.24, { arriveAt: graph.nodes[ledgers[1].endpoint].at, returnAt: graph.nodes[ledgers[0].endpoint].at });
  return graph;
}

/** Architecture: a triangulated network floor; the layer stack floats above it. */
function mesh(): Graph {
  const graph = new Graph(17);
  const columns = 30;
  const rows = 16;
  const ids: number[][] = [];
  for (let j = 0; j < rows; j++) {
    ids.push([]);
    for (let i = 0; i < columns; i++) {
      const x = -4.5 + (9 * i) / (columns - 1) + (graph.rand() - 0.5) * 0.16;
      const z = 1.2 - (8.2 * j) / (rows - 1) + (graph.rand() - 0.5) * 0.2;
      const isHub = graph.rand() < 0.05;
      const order = Math.min(1, Math.hypot(x / 4.5, (z + 2.9) / 4.1) * 0.8);
      const fade = Math.min(1, Math.max(0.12, 1 - (x - 0.4) / 1.6));
      ids[j].push(
        graph.node([x, 0, z], { size: isHub ? 0.038 : 0.02, role: "leaf", tone: clamp01((x + 4.5) / 9), alpha: (isHub ? 0.95 : 0.55) * fade, order }),
      );
    }
  }
  const links: number[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < columns; i++) {
      const style = { width: 0.7, alpha: 0.17 * graph.nodes[ids[j][i]].alpha / 0.55 };
      if (i + 1 < columns) links.push(graph.link(ids[j][i], ids[j][i + 1], style));
      if (j + 1 < rows) links.push(graph.link(ids[j][i], ids[j + 1][i], style));
      if (i + 1 < columns && j + 1 < rows) {
        links.push((i + j) % 2 ? graph.link(ids[j][i], ids[j + 1][i + 1], style) : graph.link(ids[j][i + 1], ids[j + 1][i], style));
      }
    }
  }
  const busy = links.filter((link) => graph.rand() < 0.07 && graph.links[link].alpha > 0.1);
  graph.gossip(busy, { speed: 0.3, size: 0.024, tail: 0.9, width: 1.1, alpha: 0.75 });
  return graph;
}

/*
 * Chain-agnostic: four ledgers whose validators run in real cities, Channels
 * between the ledgers, and the land under them (the land dots are particles,
 * see sceneForms.ts).
 */
const GLOBE_LEDGERS: { tone: number; cities: [number, number][] }[] = [
  // Ashburn, San José, London, Singapore, Tokyo
  { tone: 0.04, cities: [[39.0, -77.5], [37.3, -121.9], [51.5, -0.1], [1.35, 103.8], [35.7, 139.7]] },
  // Frankfurt, Zurich, Dubai, Mumbai, Sydney
  { tone: 0.4, cities: [[50.1, 8.7], [47.4, 8.5], [25.2, 55.3], [19.1, 72.9], [-33.9, 151.2]] },
  // Toronto, São Paulo, Lagos, Nairobi, Johannesburg
  { tone: 0.66, cities: [[43.7, -79.4], [-23.5, -46.6], [6.5, 3.4], [-1.3, 36.8], [-26.2, 28.0]] },
  // Dallas, Amsterdam, Stockholm, Hong Kong, Seoul
  { tone: 0.94, cities: [[32.8, -96.8], [52.4, 4.9], [59.3, 18.1], [22.3, 114.2], [37.6, 127.0]] },
];

/** Channels between ledgers: [ledger, city] → [ledger, city]. */
const GLOBE_CHANNELS: [[number, number], [number, number]][] = [
  [[0, 0], [2, 0]],
  [[0, 2], [1, 0]],
  [[1, 3], [0, 3]],
  [[2, 3], [1, 2]],
  [[3, 1], [2, 2]],
  [[3, 3], [0, 4]],
  [[2, 1], [3, 0]],
  [[1, 4], [3, 4]],
];

const angleBetween = (a: V3, b: V3) => Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));

function globe(): Graph {
  const graph = new Graph(29);
  graph.node([0, 0, 0], { size: 1, role: "atmosphere", tone: 0.15, alpha: 0.5, order: 0 });

  // Faint meridians and the equator, so the sphere reads even over the oceans.
  for (let k = 0; k < 6; k++) {
    const longitude = -180 + k * 30;
    for (const [from, to] of [[90, 0], [0, -90]]) {
      graph.link(onGlobe(from, longitude), onGlobe(to, longitude), { arc: 0, tone: 0.2, width: 0.7, alpha: 0.07, order: 0.1 });
      graph.link(onGlobe(from, longitude + 180), onGlobe(to, longitude + 180), { arc: 0, tone: 0.2, width: 0.7, alpha: 0.07, order: 0.1 });
    }
  }
  for (let k = 0; k < 3; k++) {
    graph.link(onGlobe(0, -180 + k * 120), onGlobe(0, -60 + k * 120), { arc: 0, tone: 0.3, width: 0.7, alpha: 0.1, order: 0.1 });
  }

  const cities = GLOBE_LEDGERS.map(({ tone, cities }) =>
    cities.map(([latitude, longitude]) =>
      graph.node(onGlobe(latitude, longitude, 1.012), {
        size: 0.03,
        role: "city",
        tone,
        pulse: [0.12 + graph.rand() * 0.12, graph.rand()],
      }),
    ),
  );
  const arc = (from: number, to: number, lift: number, options: LinkOptions) => {
    const a = graph.nodes[from].at;
    const b = graph.nodes[to].at;
    return graph.link(from, to, { arc: lift * (0.4 + angleBetween(a, b) / Math.PI), ...options });
  };

  // Each ledger's own network.
  cities.forEach((ledger, index) => {
    const ring = [...ledger].sort((p, q) => Math.atan2(graph.nodes[p].at[0], graph.nodes[p].at[2]) - Math.atan2(graph.nodes[q].at[0], graph.nodes[q].at[2]));
    ring.forEach((city, i) => {
      if (i === ring.length - 1) return;
      const link = arc(city, ring[i + 1], 0.12, { width: 0.8, alpha: 0.34, tone: GLOBE_LEDGERS[index].tone });
      graph.packet(link, { speed: 0.12 + graph.rand() * 0.1, phase: graph.rand(), size: 0.016, tail: 0.25, alpha: 0.7, reverse: graph.rand() < 0.5 });
    });
  });

  // Channels between ledgers, with bundles and their proofs.
  GLOBE_CHANNELS.forEach(([[ledgerA, cityA], [ledgerB, cityB]], index) => {
    const from = cities[ledgerA][cityA];
    const to = cities[ledgerB][cityB];
    const link = arc(from, to, 0.42, { width: 1.35, alpha: 0.95, tone: [GLOBE_LEDGERS[ledgerA].tone, GLOBE_LEDGERS[ledgerB].tone] });
    const speed = 0.16 + (index % 3) * 0.03;
    const phase = graph.rand();
    for (const offset of [0, -0.035]) {
      graph.packet(link, { speed, phase: phase + offset, start: 0, duration: 0.6, size: 0.022, tail: 0.14, tone: 0.3 });
    }
    graph.packet(link, { speed, phase: phase - 0.018, start: 0, duration: 0.6, size: 0.05, role: "proof", tone: TONE_PROOF, tail: 0 });
    graph.ripple(graph.nodes[to].at, speed, (0.6 - phase + 1) % 1, { size: 0.045, tone: GLOBE_LEDGERS[ledgerB].tone });
  });
  return graph;
}

/** Open source: a git history; contributors push commits that merge back into main. */
function branches(): Graph {
  const graph = new Graph(31);
  const main = graph.link([-2.3, 0, 0], [2.3, 0, 0], { tone: [0.05, 0.95], width: 1.5, alpha: 0.85 });
  const feature = [
    graph.link([-1.5, 0, 0], [-0.9, 0.62, 0.35], { lift: [0.0, 0.31, 0.17], tone: 0.35, width: 1.2 }),
    graph.link([-0.9, 0.62, 0.35], [0.4, 0.62, 0.35], { tone: 0.35, width: 1.2 }),
    graph.link([0.4, 0.62, 0.35], [0.95, 0, 0], { lift: [0.25, 0.31, 0.17], tone: 0.35, width: 1.2 }),
  ];
  const fix = [
    graph.link([-0.7, 0, 0], [-0.1, -0.58, -0.35], { lift: [0.0, -0.29, -0.17], tone: 0.75, width: 1.2 }),
    graph.link([-0.1, -0.58, -0.35], [1.25, -0.58, -0.35], { tone: 0.75, width: 1.2 }),
    graph.link([1.25, -0.58, -0.35], [1.8, 0, 0], { lift: [0.25, -0.29, -0.17], tone: 0.75, width: 1.2 }),
  ];
  // Light runs along the history toward HEAD.
  for (const phase of [0, 0.33, 0.66]) graph.packet(main, { speed: 0.07, phase, size: 0.03, tail: 0.18 });
  [feature, fix].forEach((branch, b) =>
    branch.forEach((link, i) => graph.packet(link, { speed: 0.12, start: i / 3, duration: 1 / 3, phase: b * 0.5, size: 0.026, tail: 0.6 })),
  );

  const commits: number[] = [];
  for (const x of [-2.05, -1.5, -0.7, 0.1, 0.95, 1.8]) commits.push(graph.node([x, 0, 0], { size: 0.06, role: "commit", tone: clamp01((x + 2.3) / 4.6) }));
  const head = graph.node([2.2, 0, 0], { size: 0.07, role: "hub", tone: 0.95 });
  graph.ripple([2.2, 0, 0], 0.2, 0, { size: 0.07, tone: 0.95 });
  for (const x of [-0.75, -0.15, 0.35]) commits.push(graph.node([x, 0.62, 0.35], { size: 0.05, role: "commit", tone: 0.35 }));
  for (const x of [0.05, 0.65, 1.2]) commits.push(graph.node([x, -0.58, -0.35], { size: 0.05, role: "commit", tone: 0.75 }));
  commits.push(head);

  // Contributors around the history, each pushing to the commits nearest to them.
  for (let i = 0; i < 10; i++) {
    const x = -2 + i * 0.44 + (graph.rand() - 0.5) * 0.2;
    const above = i % 2 === 0;
    const at: V3 = [x, (above ? 1 : -1) * (0.88 + graph.rand() * 0.22) + (above ? 0.1 : -0.1), (graph.rand() - 0.5) * 1.1];
    const person = graph.node(at, { size: 0.032, role: "leaf", tone: 0.88 + graph.rand() * 0.12, alpha: 0.9 });
    const speed = 0.08 + graph.rand() * 0.06;
    const phase = graph.rand();
    const [commit] = graph.nearest(commits, at, 1);
    const push = graph.link(person, commit, { width: 0.7, alpha: 0.24, dash: 8 });
    graph.packet(push, { speed, phase, start: 0, duration: 0.25, size: 0.022, tail: 0.5, tone: 0.92 });
    graph.ripple(graph.nodes[commit].at, speed, (0.25 - phase + 1) % 1, { size: 0.05, tone: 0.92, alpha: 0.7 });
  }
  return graph;
}

/** Roadmap: the network grows through the four phases; the current one is live, later ones are planned. */
function growth(): Graph {
  const graph = new Graph(37);
  const current = Math.max(0, roadmap.phases.findIndex((phase) => phase.current));
  const stages: { at: V3; count: number; radius: number }[] = [
    { at: [-1.9, -0.3, 0.45], count: 4, radius: 0.26 },
    { at: [-0.68, -0.02, 0.15], count: 8, radius: 0.4 },
    { at: [0.62, 0.06, -0.2], count: 13, radius: 0.52 },
    { at: [1.95, 0.24, -0.6], count: 20, radius: 0.64 },
  ];
  const groups = stages.map(({ at, count, radius }, k) => {
    const live = k <= current;
    const tone = 0.08 + k * 0.27;
    const ids = sphere(count, radius, at).map((p) =>
      graph.node(p, { size: live ? 0.045 : 0.04, role: live ? "validator" : "commit", tone, alpha: live ? 1 : 0.5 }),
    );
    const links = graph.mesh(ids, k === 0 ? 2 : 3, live ? { width: 1, alpha: 0.7 } : { width: 0.8, alpha: 0.28, dash: 6 });
    if (live) graph.gossip(links, { speed: 0.35, size: 0.022, tail: 0.4 });
    if (k === current) {
      graph.ripple(at, 0.22, 0, { size: radius * 0.75, tone: 0.95, alpha: 0.75 });
      graph.ripple(at, 0.22, 0.5, { size: radius * 0.75, tone: 0.95, alpha: 0.75 });
    }
    return ids;
  });

  // The path through the year, and the links each phase adds to the next.
  stages.forEach((stage, k) => {
    if (k === stages.length - 1) return;
    const next = stages[k + 1];
    const spine = graph.link(stage.at, next.at, { lift: [0, 0.3, 0], tone: [0.08 + k * 0.27, 0.35 + k * 0.27], width: 1, alpha: 0.4, dash: 16 });
    graph.packet(spine, { speed: 0.12, phase: k * 0.25, size: 0.03, tail: 0.35 });
    const from = graph.nearest(groups[k], next.at, 2);
    const to = graph.nearest(groups[k + 1], stage.at, 2);
    from.forEach((id, i) => graph.link(id, to[i], { width: 0.7, alpha: 0.25, dash: 7 }));
  });
  return graph;
}

/** Terminology: the glossary as a knowledge graph. Tags are term indices, so the selected term can light up. */
function knowledge(): Graph {
  const graph = new Graph(41);
  const terms = glossary.terms;
  const index = new Map<string, number>(terms.map((term, i) => [term.term, i]));
  const edges: [number, number][] = [];
  terms.forEach((term, i) => {
    for (const name of RELATED.get(term.term) ?? []) {
      const j = index.get(name);
      if (j !== undefined && i < j) edges.push([i, j]);
    }
  });
  const degree = terms.map((_, i) => edges.filter(([a, b]) => a === i || b === i).length);
  const categoryTone: Record<string, number> = { Components: 0.04, Network: 0.28, Messaging: 0.52, Trust: 0.86, Payment: 1 };
  const positions = forceLayout(terms.length, edges, seeded(43), [2.0, 0.95, 1.0]);
  const ids = terms.map((term, i) =>
    graph.node(positions[i], {
      size: 0.045 + degree[i] * 0.007,
      role: degree[i] >= 5 ? "hub" : "validator",
      tone: categoryTone[term.category] ?? 0.4,
      tag: i,
    }),
  );
  for (const [i, j] of edges) {
    const link = graph.link(ids[i], ids[j], { width: 1, alpha: 0.5 });
    graph.packet(link, { speed: 0.1 + graph.rand() * 0.12, phase: graph.rand(), size: 0.022, tail: 0.45, reverse: graph.rand() < 0.5, alpha: 0.7 });
  }
  return graph;
}

/** Get involved: a scale-free contributor network (preferential attachment) that keeps gaining members. */
function community(): Graph {
  const graph = new Graph(47);
  const random = seeded(53);
  const count = 58;
  const edges: [number, number][] = [[0, 1], [1, 2], [2, 0]];
  const degree = [2, 2, 2];
  for (let node = 3; node < count; node++) {
    degree.push(0);
    const targets = new Set<number>();
    const wanted = random() < 0.3 ? 2 : 1;
    while (targets.size < wanted) {
      const total = degree.slice(0, node).reduce((sum, d) => sum + d, 0);
      let pick = random() * total;
      let target = 0;
      while (pick > degree[target]) pick -= degree[target++];
      targets.add(target);
    }
    for (const target of targets) {
      edges.push([target, node]);
      degree[target]++;
      degree[node]++;
    }
  }
  const positions = forceLayout(count, edges, seeded(59), [2.05, 1.0, 0.9], 2.8);
  const ids = positions.map((at, i) =>
    graph.node(at, {
      size: 0.022 + Math.sqrt(degree[i]) * 0.014,
      role: degree[i] >= 6 ? "hub" : degree[i] >= 3 ? "validator" : "leaf",
      tone: 0.05 + (i / count) * 0.9,
      order: i / count,
    }),
  );
  edges.forEach(([a, b], k) => {
    const link = graph.link(ids[a], ids[b], { width: 0.9, alpha: 0.42, order: b / count });
    if (k % 2 === 0) graph.packet(link, { speed: 0.12 + random() * 0.18, phase: random(), size: 0.02, tail: 0.5, reverse: random() < 0.5 });
  });
  // The newest members announce themselves.
  for (let i = count - 8; i < count; i++) graph.ripple(positions[i], 0.1 + random() * 0.08, random(), { size: 0.05, tone: 0.92, alpha: 0.8 });
  return graph;
}

const BUILDERS: Record<FormName, () => Graph> = { chain, route, bridge, mesh, globe, branches, growth, knowledge, community };

export function formGraph(name: FormName): Graph {
  return BUILDERS[name]();
}

/** Where a link is at u (0–1); the shader does the same. */
export function linkPoint(link: GraphLink, u: number): V3 {
  if (link.mode === 1) {
    const radius = length(link.a) * (1 + link.c[0] * Math.sin(Math.PI * u));
    return scale(normalize(lerp(link.a, link.b, u)), radius);
  }
  const v = 1 - u;
  return add(add(scale(link.a, v * v), scale(link.c, 2 * v * u)), scale(link.b, u * u));
}
