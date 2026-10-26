/*
 * The particle side of the section illustrations.
 *
 * The networks themselves (nodes, links, traffic) are drawn by networkLayer.ts
 * from sceneGraphs.ts. The particles add what a network sits in: a soft dust
 * around nodes and links, the state inside each block, the fine grid of the
 * network floor and the land on the globe. They also carry the flow from one
 * illustration to the next as the visitor scrolls.
 *
 * Each illustration is a point cloud in the same local units as its graph.
 * Every point carries a weight:
 *   0     the particle is not part of the drawing and stays a star
 *   0 – 1 brightness
 *   > 1   highlight (drawn larger and pinker)
 */

import { FORMS, type FormName } from "@/components/sceneMotion";
import { add, formGraph, linkPoint, onGlobe, scale, seeded, type Graph, type Random, type V3 } from "@/components/sceneGraphs";
import { isLand } from "@/components/worldLand";

export { FORMS, seeded, type FormName };

/** Particles per texture row; the shader reads point `i` at (i % 256, i / 256 + form × rows). */
export const FORM_TEXTURE_WIDTH = 256;

type Point = [number, number, number, number];
type Part = { weight: number; point: (random: Random, k: number) => Point };

function direction(random: Random): V3 {
  for (;;) {
    const v: V3 = [random() * 2 - 1, random() * 2 - 1, random() * 2 - 1];
    const l = Math.hypot(...v);
    if (l > 0.001 && l <= 1) return scale(v, 1 / l);
  }
}

/** A soft cloud, densest at its center. */
function cloud(center: V3, radius: number, w: number, weight: number, squash: V3 = [1, 1, 1]): Part {
  return {
    weight,
    point: (random) => {
      const d = direction(random);
      const r = radius * Math.pow(random(), 1.6);
      return [...add(center, [d[0] * r * squash[0], d[1] * r * squash[1], d[2] * r * squash[2]]), w];
    },
  };
}

/** Points handed out in turn, so every one gets a particle before any gets two. */
function fixed(points: V3[], w: number, weight: number): Part {
  return { weight, point: (_, k) => [...points[k % points.length], w] };
}

/** Dust around the nodes and along the links of a network. */
function dust(graph: Graph, { spread = 3.2, nodeWeight = 1, linkWeight = 0.35, w = 0.45 } = {}): Part[] {
  const parts: Part[] = [];
  for (const node of graph.nodes) {
    if (node.role === "ripple" || node.role === "atmosphere" || node.alpha < 0.3) continue;
    parts.push(cloud(node.at, node.size * spread, w, node.size * nodeWeight));
  }
  for (const link of graph.links) {
    if (link.alpha < 0.2) continue;
    const reach = Math.hypot(...link.a.map((value, axis) => value - link.b[axis]));
    parts.push({
      weight: reach * linkWeight * link.alpha,
      point: (random) => {
        const at = linkPoint(link, random());
        const d = direction(random);
        const r = 0.035 * Math.pow(random(), 1.5);
        return [at[0] + d[0] * r, at[1] + d[1] * r, at[2] + d[2] * r, w * 0.8];
      },
    });
  }
  return parts;
}

/** Land on the unit globe as a dot matrix, about one dot per 1.4° (Antarctica left out). */
function landDots(): V3[] {
  const points: V3[] = [];
  const step = 1.4;
  for (let latitude = -56; latitude <= 78; latitude += step) {
    const columns = Math.max(1, Math.round((360 * Math.cos((latitude * Math.PI) / 180)) / step));
    for (let i = 0; i < columns; i++) {
      const longitude = -180 + ((i + 0.5) * 360) / columns;
      if (isLand(latitude, longitude)) points.push(onGlobe(latitude, longitude));
    }
  }
  return points;
}

/** The particles of each illustration, given its network. */
const EXTRAS: Partial<Record<FormName, (graph: Graph) => Part[]>> = {
  // The state inside every block of the chain.
  chain: (graph) =>
    graph.nodes.filter((node) => node.role === "leaf").map((node) => cloud(node.at, 0.17, node.alpha > 1 ? 1.4 : 0.8, 0.5)),
  // The fine grid of the network floor.
  mesh: () => [
    {
      weight: 6,
      point: (random) => {
        const i = Math.floor(random() * 150);
        const j = Math.floor(random() * 80);
        return [-4.5 + (9 * i) / 149, 0, 1.2 - (8.2 * j) / 79, 0.55];
      },
    },
  ],
};

const SETTINGS: Record<FormName, { share: number; dust?: Parameters<typeof dust>[1] | false }> = {
  chain: { share: 0.3, dust: { linkWeight: 0.15 } },
  route: { share: 0.3 },
  bridge: { share: 0.34 },
  mesh: { share: 0.42, dust: false },
  globe: { share: 0.62, dust: false },
  branches: { share: 0.28 },
  growth: { share: 0.3 },
  knowledge: { share: 0.3, dust: { spread: 4, nodeWeight: 1.6 } },
  community: { share: 0.3 },
};

function partsFor(name: FormName): Part[] {
  if (name === "globe") return [fixed(landDots(), 1, 1)];
  const graph = formGraph(name);
  const { dust: options } = SETTINGS[name];
  return [...(options === false ? [] : dust(graph, options)), ...(EXTRAS[name]?.(graph) ?? [])];
}

/** All illustrations, packed for an RGBA32F texture. */
export function buildForms(count: number) {
  const rowsPerForm = Math.ceil(count / FORM_TEXTURE_WIDTH);
  const stride = rowsPerForm * FORM_TEXTURE_WIDTH * 4;
  const data = new Float32Array(stride * FORMS.length);
  FORMS.forEach((name, form) => {
    const random = seeded(101 + form * 7);
    const { share } = SETTINGS[name];
    const parts = partsFor(name);
    const total = parts.reduce((sum, part) => sum + part.weight, 0);
    const cumulative: number[] = [];
    let running = 0;
    for (const part of parts) cumulative.push((running += part.weight / total));
    const handed = new Array<number>(parts.length).fill(0);
    for (let i = 0; i < count; i++) {
      if (random() > share) continue; // stays a star
      const pick = random();
      let index = 0;
      while (index < cumulative.length - 1 && cumulative[index] < pick) index++;
      const [x, y, z, w] = parts[index].point(random, handed[index]++);
      const jitter = 0.006;
      data.set(
        [x + (random() - 0.5) * jitter, y + (random() - 0.5) * jitter, z + (random() - 0.5) * jitter, w],
        form * stride + i * 4,
      );
    }
  });
  return { data, rowsPerForm };
}
