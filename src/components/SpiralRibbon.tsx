"use client";

import { useEffect, useRef } from "react";

import { clamp01, easeInOut, TAU, type Point } from "@/components/fibres";
import { seeded, type Random } from "@/components/sceneGraphs";
import { cn } from "@/lib/utils";

/*
 * The closing illustration: the CLPR spiral as a twisting ribbon of light.
 *
 * The ribbon follows the centerline of the CLPR mark (ClprMark) at the mark's
 * own stroke width. Its fibres run around a flattened tube that turns as it
 * goes, so the band pinches and fans like a twisted ribbon: fibres facing the
 * viewer are warm, the ones behind are violet. When the section comes into
 * view the ribbon draws itself from the tail into the coil. After that,
 * messages travel along it in order, from the tail into the coil. With reduced
 * motion the finished ribbon holds still.
 */

const SAMPLES = 720;
const STRANDS = 72;
const TWISTS = 2.6;
/** Thickness of the tube relative to its width: 0 is a flat band. */
const FLAT = 0.45;
/** The twist narrows the band on average, so the ribbon is a little wider than the mark's stroke. */
const WIDEN = 1.45;
/** Samples per stroke; each stroke takes the color of its middle. */
const CHUNK = 8;
const BUILD_SECONDS = 2.8;

type Ribbon = {
  /** Per strand: x, y for every sample, in the mark's coordinates. */
  points: Float32Array[];
  /** Per strand: how far each sample faces the viewer, -1 (behind) → 1 (in front). */
  depth: Float32Array[];
  /** Per sample: how much light the fibres may add there; less where the band is narrow and they pile up. */
  density: Float32Array;
};

type Bead = { strand: number; index: number; size: number; phase: number; twinkles: boolean };

type Message = { strand: number; s: number };

// The mark's bounding box (the viewBox of ClprMark).
const BOX = { x: 405, y: 356, width: 117.4, height: 77.7 };

// Centerline of CLPR_SPIRAL_PATH with the half-width of its stroke: down the tail,
// around the bowl, up the right side, over the top, into the coil and its curl.
const SPINE: [number, number, number][] = [
  [411.75, 357.5, 6.75],
  [411.75, 362.75, 6.75],
  [412.65, 375.5, 6.75],
  [416.8, 387.75, 6.75],
  [422.7, 398.6, 6.75],
  [430.56, 408.15, 6.75],
  [440.1, 416.0, 6.75],
  [450.97, 421.91, 6.75],
  [463.2, 425.7, 6.75],
  [475.96, 426.96, 6.75],
  [495.8, 421.6, 6.75],
  [510.3, 407.1, 6.75],
  [515.6, 387.3, 6.75],
  [513.7, 377.9, 6.75],
  [508.4, 370.0, 6.75],
  [500.5, 364.7, 6.75],
  [491.1, 362.8, 6.75],
  [485.3, 364.0, 6.6],
  [480.4, 367.2, 6.5],
  [477.2, 372.1, 6.3],
  [476.0, 377.9, 6.0],
  [477.6, 385.4, 5.0],
  [482.3, 390.3, 4.0],
  [491.1, 391.5, 3.0],
  [496.6, 387.0, 2.2],
  [497.1, 381.5, 1.6],
  [494.2, 378.4, 1.1],
  [491.1, 378.5, 0.7],
];

// Colors along the ribbon (tail → coil): violet for fibres behind, peach and gold in front.
const BACK: [number, number, number, number][] = [
  [0, 108, 90, 255],
  [0.5, 148, 84, 240],
  [1, 190, 96, 222],
];
const FRONT: [number, number, number, number][] = [
  [0, 255, 190, 196],
  [0.5, 255, 184, 156],
  [1, 255, 214, 170],
];

function lerpStops(stops: [number, number, number, number][], s: number): [number, number, number] {
  const upper = Math.max(1, stops.findIndex(([at]) => at >= s));
  const [a, r1, g1, b1] = stops[upper - 1];
  const [b, r2, g2, b2] = stops[upper];
  const t = clamp01((s - a) / (b - a));
  return [r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t];
}

/** Color and opacity of a fibre at a point along the ribbon, by how far it faces the viewer. */
function fibre(s: number, depth: number): { color: string; alpha: number } {
  const front = Math.pow((depth + 1) / 2, 2.2);
  const back = lerpStops(BACK, s);
  const fore = lerpStops(FRONT, s);
  const mix = (i: number) => Math.round(back[i] + (fore[i] - back[i]) * front);
  return { color: `rgb(${mix(0)} ${mix(1)} ${mix(2)})`, alpha: 0.12 + 0.5 * front };
}

/** Evenly spaced points along the spine (Catmull-Rom), with normals and half-widths. */
function sampleSpine(): { points: Point[]; normals: Point[]; widths: number[] } {
  const dense: (Point & { w: number })[] = [];
  const at = (i: number) => SPINE[Math.min(SPINE.length - 1, Math.max(0, i))];
  for (let i = 0; i < SPINE.length - 1; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    for (let step = 0; step < 24; step++) {
      const t = step / 24;
      const t2 = t * t;
      const t3 = t2 * t;
      const curve = (k: 0 | 1) =>
        0.5 *
        (2 * p1[k] +
          (p2[k] - p0[k]) * t +
          (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 +
          (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t3);
      dense.push({ x: curve(0), y: curve(1), w: p1[2] + (p2[2] - p1[2]) * t });
    }
  }
  const end = SPINE[SPINE.length - 1];
  dense.push({ x: end[0], y: end[1], w: end[2] });

  const lengths = [0];
  for (let i = 1; i < dense.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(dense[i].x - dense[i - 1].x, dense[i].y - dense[i - 1].y));
  }
  const total = lengths[lengths.length - 1];
  const points: Point[] = [];
  const widths: number[] = [];
  let cursor = 0;
  for (let i = 0; i < SAMPLES; i++) {
    const target = (i / (SAMPLES - 1)) * total;
    while (cursor < lengths.length - 2 && lengths[cursor + 1] < target) cursor++;
    const t = clamp01((target - lengths[cursor]) / (lengths[cursor + 1] - lengths[cursor] || 1));
    const a = dense[cursor];
    const b = dense[cursor + 1];
    points.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    widths.push(a.w + (b.w - a.w) * t);
  }
  const normals = points.map((_, i) => {
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(SAMPLES - 1, i + 1)];
    const length = Math.hypot(next.x - prev.x, next.y - prev.y) || 1;
    return { x: -(next.y - prev.y) / length, y: (next.x - prev.x) / length };
  });
  return { points, normals, widths };
}

/** Every fibre sits at its own angle around the flattened tube, which turns along the spine. */
function buildRibbon(random: Random): Ribbon {
  const spine = sampleSpine();
  const points: Float32Array[] = [];
  const depth: Float32Array[] = [];
  for (let k = 0; k < STRANDS; k++) {
    const around = (k / STRANDS) * TAU + (random() - 0.5) * 0.05;
    const twist = TWISTS + (random() - 0.5) * 0.16;
    const reach = 0.92 + random() * 0.12;
    const xy = new Float32Array(SAMPLES * 2);
    const facing = new Float32Array(SAMPLES);
    for (let i = 0; i < SAMPLES; i++) {
      const turn = TAU * twist * (i / (SAMPLES - 1)) + 0.6;
      const across = Math.cos(around) * Math.cos(turn) - FLAT * Math.sin(around) * Math.sin(turn);
      facing[i] = Math.cos(around) * Math.sin(turn) + FLAT * Math.sin(around) * Math.cos(turn);
      const offset = spine.widths[i] * WIDEN * reach * across;
      xy[i * 2] = spine.points[i].x + spine.normals[i].x * offset;
      xy[i * 2 + 1] = spine.points[i].y + spine.normals[i].y * offset;
    }
    points.push(xy);
    depth.push(facing);
  }
  const density = Float32Array.from(spine.widths, (width) => Math.min(1, (width + 0.8) / 6));
  return { points, depth, density };
}

/** Beads of light along the fibres, sorted along the ribbon so they appear as it draws. */
function buildBeads(random: Random): Bead[] {
  return Array.from({ length: 460 }, (_, n) => ({
    strand: Math.floor(random() * STRANDS),
    index: Math.floor(random() * SAMPLES),
    size: 0.5 + random() * 0.8,
    phase: random() * TAU,
    twinkles: n % 6 === 0,
  })).sort((a, b) => a.index - b.index);
}

/** Draws every fibre between two samples. */
function paintFibres(ctx: CanvasRenderingContext2D, ribbon: Ribbon, from: number, to: number, scale: number) {
  ctx.globalCompositeOperation = "lighter";
  ctx.lineWidth = 0.8 / scale;
  for (let k = 0; k < STRANDS; k++) {
    const xy = ribbon.points[k];
    for (let start = from; start < to; start += CHUNK) {
      const end = Math.min(to, start + CHUNK);
      const middle = Math.round((start + end) / 2);
      const { color, alpha } = fibre(middle / (SAMPLES - 1), ribbon.depth[k][middle]);
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha * ribbon.density[middle];
      ctx.beginPath();
      ctx.moveTo(xy[start * 2], xy[start * 2 + 1]);
      for (let i = start + 1; i <= end; i++) ctx.lineTo(xy[i * 2], xy[i * 2 + 1]);
      ctx.stroke();
    }
  }
}

function paintBeads(
  ctx: CanvasRenderingContext2D,
  ribbon: Ribbon,
  beads: Bead[],
  scale: number,
  pick: (bead: Bead) => number,
) {
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "rgb(255 236 226)";
  for (const bead of beads) {
    const glow = pick(bead);
    if (glow <= 0) continue;
    const facing = (ribbon.depth[bead.strand][bead.index] + 1) / 2;
    ctx.globalAlpha = glow * (0.15 + 0.75 * facing * facing);
    ctx.beginPath();
    const xy = ribbon.points[bead.strand];
    ctx.arc(xy[bead.index * 2], xy[bead.index * 2 + 1], bead.size / scale, 0, TAU);
    ctx.fill();
  }
}

/** Messages queue along the ribbon: a short bright trail on one fibre. */
function paintMessages(ctx: CanvasRenderingContext2D, ribbon: Ribbon, messages: Message[], scale: number) {
  ctx.globalCompositeOperation = "lighter";
  ctx.lineWidth = 1.3 / scale;
  ctx.strokeStyle = "rgb(236 230 255)";
  ctx.fillStyle = "rgb(255 246 238)";
  for (const message of messages) {
    const head = Math.min(SAMPLES - 1, Math.round(message.s * (SAMPLES - 1)));
    const tail = Math.max(0, head - 22);
    if (head <= tail) continue;
    const xy = ribbon.points[message.strand];
    const facing = (ribbon.depth[message.strand][head] + 1) / 2;
    const fade = Math.min(1, message.s * 12, (1 - message.s) * 10);
    ctx.globalAlpha = fade * (0.25 + 0.6 * facing);
    ctx.beginPath();
    ctx.moveTo(xy[tail * 2], xy[tail * 2 + 1]);
    for (let i = tail + 1; i <= head; i++) ctx.lineTo(xy[i * 2], xy[i * 2 + 1]);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(xy[head * 2], xy[head * 2 + 1], 1.6 / scale, 0, TAU);
    ctx.fill();
  }
}

export function SpiralRibbon({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const cache = document.createElement("canvas");
    const cacheCtx = cache.getContext("2d");
    if (!canvas || !ctx || !cacheCtx) return;

    const random = seeded(41);
    const ribbon = buildRibbon(random);
    const beads = buildBeads(random);
    const messages: Message[] = [];

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    // The ribbon draws itself the first time it comes into view.
    let build = reducedMotion.matches ? 1 : 0;
    let started = false;
    /** Samples of the ribbon already drawn into `cache`. */
    let drawn = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let scale = 1;
    let time = 0;
    let last = 0;
    let frame = 0;
    let running = false;
    let visible = false;
    let nextMessage = 0;
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 };

    const place = (target: CanvasRenderingContext2D) => {
      const k = pixelRatio * scale;
      target.setTransform(
        k,
        0,
        0,
        k,
        pixelRatio * (width / 2 - (BOX.x + BOX.width / 2) * scale),
        pixelRatio * (height / 2 - (BOX.y + BOX.height / 2) * scale),
      );
    };
    const clear = (target: CanvasRenderingContext2D) => {
      target.setTransform(1, 0, 0, 1, 0, 0);
      target.globalAlpha = 1;
      target.globalCompositeOperation = "source-over";
      target.clearRect(0, 0, target.canvas.width, target.canvas.height);
    };

    const render = () => {
      if (!width || !height) return;
      // Only the newly revealed stretch of the ribbon is drawn; the rest is already in the cache.
      const target = Math.round(easeInOut(build) * (SAMPLES - 1));
      if (target > drawn) {
        place(cacheCtx);
        paintFibres(cacheCtx, ribbon, drawn, target, scale);
        paintBeads(cacheCtx, ribbon, beads, scale, (bead) => (bead.index >= drawn && bead.index < target ? 1 : 0));
        drawn = target;
      }
      clear(ctx);
      ctx.drawImage(cache, 0, 0);
      if (build < 1) return;
      place(ctx);
      paintBeads(ctx, ribbon, beads, scale, (bead) =>
        bead.twinkles ? Math.pow(0.5 + 0.5 * Math.sin(time * 1.7 + bead.phase), 6) * 1.6 : 0,
      );
      paintMessages(ctx, ribbon, messages, scale);
    };

    const step = (delta: number) => {
      time += delta;
      if (build < 1) {
        build = Math.min(1, build + delta / BUILD_SECONDS);
      } else {
        // One message after the other, all at the same pace: they arrive in the order they left.
        nextMessage -= delta;
        if (nextMessage <= 0) {
          messages.push({ strand: Math.floor(random() * STRANDS), s: 0 });
          nextMessage = 0.9 + random() * 0.6;
        }
        for (let i = messages.length - 1; i >= 0; i--) {
          messages[i].s += delta * 0.075;
          if (messages[i].s >= 1) messages.splice(i, 1);
        }
      }
      const follow = 1 - Math.exp(-delta * 3);
      tilt.x += (tilt.tx - tilt.x) * follow;
      tilt.y += (tilt.ty - tilt.y) * follow;
      canvas.style.transform = `perspective(1600px) rotateX(${(-tilt.y * 4).toFixed(2)}deg) rotateY(${(tilt.x * 6).toFixed(2)}deg)`;
    };

    const tick = (now: number) => {
      if (!running) return;
      const delta = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      step(delta);
      render();
      frame = requestAnimationFrame(tick);
    };

    const sync = () => {
      const shouldRun = started && visible && !document.hidden && !reducedMotion.matches;
      if (shouldRun && !running) {
        running = true;
        last = 0;
        frame = requestAnimationFrame(tick);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(frame);
      }
      if (reducedMotion.matches) {
        build = 1;
        messages.length = 0;
        canvas.style.transform = "";
        render();
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = cache.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = cache.height = Math.max(1, Math.round(height * pixelRatio));
      // Leave a margin around the mark for the ribbon's fan and glow.
      scale = Math.min(width / (BOX.width * 1.14), height / (BOX.height * 1.2));
      drawn = 0;
      render();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      tilt.tx = (event.clientX / window.innerWidth) * 2 - 1;
      tilt.ty = (event.clientY / window.innerHeight) * 2 - 1;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) started = true;
        sync();
      },
      { threshold: 0.3 },
    );
    intersection.observe(canvas);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    reducedMotion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    resize();
    sync();

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      reducedMotion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div data-scene-art aria-hidden="true" className={cn("relative", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 size-full will-change-transform" />
    </div>
  );
}
