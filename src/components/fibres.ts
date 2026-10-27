import type { Random } from "@/components/sceneGraphs";

/*
 * Shared drawing helpers for the canvas illustrations (HeroMesh, StoryStage):
 * bundles of fine fibres between two points, partial polylines and the soft
 * four-ray star used for ledgers and validators.
 */

export const TAU = Math.PI * 2;

export type Point = { x: number; y: number };

/** How a bundle of fibres runs between two points, relative to its length. */
export type BundleShape = {
  strands: number;
  /** Curve of the whole bundle, the fan of its strands and an S-twist. */
  bow: number;
  spread: number;
  twist: number;
};

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function easeOut(value: number): number {
  return 1 - Math.pow(1 - value, 3);
}

export function easeInOut(value: number): number {
  return 0.5 - 0.5 * Math.cos(Math.PI * value);
}

export function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** One polyline per fibre; the fibres meet at both ends and fan out in between. */
export function buildStrands(a: Point, b: Point, shape: BundleShape, random: Random): Float32Array[] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  const nx = -dy / length;
  const ny = dx / length;
  const steps = Math.max(18, Math.round(length * 34));
  const strands: Float32Array[] = [];
  for (let s = 0; s < shape.strands; s++) {
    const lane = shape.strands > 1 ? (s / (shape.strands - 1)) * 2 - 1 : 0;
    // Denser along the spine of the bundle, sparser at its edges.
    const fan = Math.sign(lane) * Math.pow(Math.abs(lane), 1.5) + (random() - 0.5) * 0.08;
    const phase = random() * TAU;
    const waves = 1.5 + random() * 2;
    const wiggle = 0.006 + random() * 0.016;
    const points = new Float32Array((steps + 1) * 2);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const belly = Math.sin(Math.PI * t);
      const offset =
        length * (shape.bow * belly + shape.spread * fan * Math.pow(belly, 0.75) + shape.twist * Math.sin(TAU * t)) +
        wiggle * belly * Math.sin(waves * Math.PI * t + phase);
      points[i * 2] = a.x + dx * t + nx * offset;
      points[i * 2 + 1] = a.y + dy * t + ny * offset;
    }
    strands.push(points);
  }
  return strands;
}

export function pointAt(points: Float32Array, t: number): [number, number] {
  const last = points.length / 2 - 1;
  const position = clamp01(t) * last;
  const i = Math.min(last - 1, Math.floor(position));
  const f = position - i;
  return [
    points[i * 2] + (points[i * 2 + 2] - points[i * 2]) * f,
    points[i * 2 + 1] + (points[i * 2 + 3] - points[i * 2 + 1]) * f,
  ];
}

/** Adds the part of a polyline between t = from and t = to to the current path. */
export function traceRange(ctx: CanvasRenderingContext2D, points: Float32Array, from: number, to: number) {
  const last = points.length / 2 - 1;
  const [x0, y0] = pointAt(points, from);
  ctx.moveTo(x0, y0);
  for (let i = Math.floor(from * last) + 1; i < to * last; i++) ctx.lineTo(points[i * 2], points[i * 2 + 1]);
  const [x1, y1] = pointAt(points, to);
  ctx.lineTo(x1, y1);
}

/** A soft star with four thin rays, drawn once and stamped wherever it is needed. */
export function makeStar(core: string, halo: string): HTMLCanvasElement {
  const size = 128;
  const c = size / 2;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const glow = ctx.createRadialGradient(c, c, 0, c, c, c);
  glow.addColorStop(0, "rgb(255 251 244)");
  glow.addColorStop(0.07, core);
  glow.addColorStop(0.24, halo);
  glow.addColorStop(1, "rgb(255 150 140 / 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = "lighter";
  for (const angle of [0, Math.PI / 2]) {
    ctx.save();
    ctx.translate(c, c);
    ctx.rotate(angle);
    const ray = ctx.createLinearGradient(-c, 0, c, 0);
    ray.addColorStop(0, "rgb(255 236 214 / 0)");
    ray.addColorStop(0.5, "rgb(255 248 238 / 0.9)");
    ray.addColorStop(1, "rgb(255 236 214 / 0)");
    ctx.fillStyle = ray;
    ctx.beginPath();
    ctx.moveTo(-c * 0.92, 0);
    ctx.lineTo(0, -1.6);
    ctx.lineTo(c * 0.92, 0);
    ctx.lineTo(0, 1.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  return canvas;
}
