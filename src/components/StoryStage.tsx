"use client";

import { useEffect, useRef } from "react";

import {
  buildStrands,
  clamp01,
  easeInOut,
  easeOut,
  makeStar,
  pointAt,
  smoothstep,
  TAU,
  type Point,
} from "@/components/fibres";
import { seeded, type Random } from "@/components/sceneGraphs";
import { cn } from "@/lib/utils";

/*
 * The story's illustration: two ledgers, one Channel, state proofs.
 *
 * Each ledger is its own network of validators (stars joined by bundles of
 * fibres) with its own heartbeat, and an Endpoint (hexagon) on the side facing
 * the other ledger; Ledger B also holds its Verifier Contract (diamond). As the
 * visitor scrolls, the ledgers appear, the Channel opens between the two
 * Endpoints as a twisted ribbon, and messages queue on Ledger A, linked one to
 * the next, and cross in bundles of three. Every message gets exactly one
 * response back. In the last chapter each bundle carries a state proof (a
 * magenta ring): B's Verifier checks it and the verified state spreads through
 * B's validators.
 *
 * Scroll decides what is shown, in step with the chapters in Story.tsx; time
 * only moves the traffic. The ledgers sit where ProtocolField publishes them
 * (--ledger-a-x …), so the aurora glows behind them and the labels line up.
 */

/** Seconds between two bundles leaving Ledger A, and for one to cross. */
const BUNDLE_EVERY = 1.9;
const CROSSING = 2.6;
/** Seconds the Verifier takes before the responses leave Ledger B. */
const CHECK = 0.45;
const QUEUE = 6;
const CHANNEL_SAMPLES = 240;
const CHANNEL_FIBRES = 30;

type Tone = { fibre: string; rgb: [number, number, number]; ring: string; star: HTMLCanvasElement };

type Validator = Point & { size: number; phase: number; beat: number; flare: number };

type LedgerArt = {
  /** Which way the Endpoint faces: Ledger A to the right (1), Ledger B to the left (-1). */
  side: 1 | -1;
  validators: Validator[];
  endpoint: Point;
  verifier: Point | null;
  bundles: Float32Array[][];
  /** Seconds between two heartbeats of the ledger's own consensus. */
  heartbeat: number;
};

type Layout = { a: Point; b: Point; r: number };

type Bundle = { age: number; response: boolean; proof: boolean };

type Wave = { age: number };

function polar(radius: number, degrees: number): Point {
  const angle = (degrees * Math.PI) / 180;
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

function nearest(points: Point[], to: Point): Point {
  return points.reduce((best, point) =>
    Math.hypot(point.x - to.x, point.y - to.y) < Math.hypot(best.x - to.x, best.y - to.y) ? point : best,
  );
}

/** A ring of eight validators around three inner ones, in unit space (radius 1). */
function buildLedger(side: 1 | -1, withVerifier: boolean, heartbeat: number, random: Random): LedgerArt {
  const ring = Array.from({ length: 8 }, (_, k) =>
    polar(0.8 + (random() - 0.5) * 0.08, 22.5 + k * 45 + (random() - 0.5) * 12),
  );
  const inner = Array.from({ length: 3 }, (_, k) => polar(0.36, 90 + k * 120 + (random() - 0.5) * 20));
  const endpoint = { x: side * 0.98, y: 0 };
  const verifier = withVerifier ? { x: side * 0.5, y: 0.32 } : null;

  const links: [Point, Point][] = [];
  ring.forEach((point, k) => {
    links.push([point, ring[(k + 1) % ring.length]]);
    links.push([point, nearest(inner, point)]);
  });
  inner.forEach((point, k) => links.push([point, inner[(k + 1) % inner.length]]));
  const byDistance = [...ring].sort(
    (p, q) => Math.hypot(p.x - endpoint.x, p.y - endpoint.y) - Math.hypot(q.x - endpoint.x, q.y - endpoint.y),
  );
  links.push([endpoint, byDistance[0]], [endpoint, byDistance[1]], [endpoint, nearest(inner, endpoint)]);
  if (verifier) links.push([verifier, endpoint], [verifier, nearest(inner, verifier)]);

  const bundles = links.map(([p, q]) =>
    buildStrands(p, q, { strands: 10, bow: (random() - 0.5) * 0.24, spread: 0.2, twist: 0.04 }, random),
  );
  // The heartbeat runs around the ring, so the ledger's own consensus reads as a rhythm.
  const validators = [...ring, ...inner].map((point, index) => ({
    ...point,
    size: index < ring.length ? 0.13 : 0.16,
    phase: random() * TAU,
    beat: ((Math.atan2(point.y, point.x) + Math.PI) / TAU) * 0.8,
    flare: 0,
  }));
  return { side, validators, endpoint, verifier, bundles, heartbeat };
}

/** Membrane, rim and fibres of one ledger, drawn once into its own canvas. */
function paintLedger(ledger: LedgerArt, tone: Tone, r: number, pixelRatio: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const size = Math.ceil(r * 2.6 * pixelRatio);
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const [red, green, blue] = tone.rgb;
  ctx.setTransform(pixelRatio * r, 0, 0, pixelRatio * r, size / 2, size / 2);

  const membrane = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  membrane.addColorStop(0, `rgb(${red} ${green} ${blue} / 0.2)`);
  membrane.addColorStop(0.75, `rgb(${red} ${green} ${blue} / 0.07)`);
  membrane.addColorStop(1, `rgb(${red} ${green} ${blue} / 0.03)`);
  ctx.fillStyle = membrane;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = `rgb(${red} ${green} ${blue} / 0.4)`;
  ctx.lineWidth = 1 / r;
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, 1.01, 0, TAU);
  ctx.clip();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = tone.fibre;
  ctx.globalAlpha = 0.24;
  ctx.lineWidth = 0.75 / r;
  ctx.beginPath();
  for (const bundle of ledger.bundles) {
    for (const strand of bundle) {
      ctx.moveTo(strand[0], strand[1]);
      for (let i = 2; i < strand.length; i += 2) ctx.lineTo(strand[i], strand[i + 1]);
    }
  }
  ctx.stroke();
  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, 0.6);
  core.addColorStop(0, `rgb(${red} ${green} ${blue} / 0.28)`);
  core.addColorStop(1, `rgb(${red} ${green} ${blue} / 0)`);
  ctx.globalAlpha = 1;
  ctx.fillStyle = core;
  ctx.fillRect(-0.6, -0.6, 1.2, 1.2);
  ctx.restore();
  return canvas;
}

/** The Channel's path: a shallow arc from Endpoint A to Endpoint B, with unit normals. */
function channelPath(from: Point, to: Point): { points: Float32Array; normals: Float32Array } {
  const control = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 - Math.hypot(to.x - from.x, to.y - from.y) * 0.14 };
  const points = new Float32Array(CHANNEL_SAMPLES * 2);
  for (let i = 0; i < CHANNEL_SAMPLES; i++) {
    const t = i / (CHANNEL_SAMPLES - 1);
    const u = 1 - t;
    points[i * 2] = u * u * from.x + 2 * u * t * control.x + t * t * to.x;
    points[i * 2 + 1] = u * u * from.y + 2 * u * t * control.y + t * t * to.y;
  }
  const normals = new Float32Array(CHANNEL_SAMPLES * 2);
  for (let i = 0; i < CHANNEL_SAMPLES; i++) {
    const prev = Math.max(0, i - 1);
    const next = Math.min(CHANNEL_SAMPLES - 1, i + 1);
    const dx = points[next * 2] - points[prev * 2];
    const dy = points[next * 2 + 1] - points[prev * 2 + 1];
    const length = Math.hypot(dx, dy) || 1;
    normals[i * 2] = -dy / length;
    normals[i * 2 + 1] = dx / length;
  }
  return { points, normals };
}

/**
 * The Channel as a twisted ribbon of fibres, violet at Ledger A and pink at
 * Ledger B, pinched into both Endpoints. Returned with its position on the page.
 */
function paintChannel(
  path: { points: Float32Array; normals: Float32Array },
  halfWidth: number,
  tones: { a: Tone; b: Tone },
  pixelRatio: number,
  random: Random,
): { canvas: HTMLCanvasElement; x: number; y: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < CHANNEL_SAMPLES; i++) {
    minX = Math.min(minX, path.points[i * 2]);
    maxX = Math.max(maxX, path.points[i * 2]);
    minY = Math.min(minY, path.points[i * 2 + 1]);
    maxY = Math.max(maxY, path.points[i * 2 + 1]);
  }
  const pad = halfWidth * 2 + 4;
  const x = minX - pad;
  const y = minY - pad;
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil((maxX - minX + pad * 2) * pixelRatio);
  canvas.height = Math.ceil((maxY - minY + pad * 2) * pixelRatio);
  const ctx = canvas.getContext("2d");
  if (!ctx) return { canvas, x, y };
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, -x * pixelRatio, -y * pixelRatio);
  ctx.globalCompositeOperation = "lighter";

  const [ar, ag, ab] = tones.a.rgb;
  const [br, bg, bb] = tones.b.rgb;
  // A soft glow under the ribbon, violet at A and pink at B.
  const first = { x: path.points[0], y: path.points[1] };
  const lastPoint = { x: path.points[(CHANNEL_SAMPLES - 1) * 2], y: path.points[(CHANNEL_SAMPLES - 1) * 2 + 1] };
  const glow = ctx.createLinearGradient(first.x, first.y, lastPoint.x, lastPoint.y);
  glow.addColorStop(0, `rgb(${ar} ${ag} ${ab} / 0.045)`);
  glow.addColorStop(1, `rgb(${br} ${bg} ${bb} / 0.045)`);
  ctx.strokeStyle = glow;
  ctx.lineCap = "round";
  // Several faint strokes of shrinking width add up to a soft falloff.
  for (const width of [3.4, 2.6, 1.9, 1.3, 0.8].map((k) => halfWidth * k)) {
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < CHANNEL_SAMPLES; i++) ctx.lineTo(path.points[i * 2], path.points[i * 2 + 1]);
    ctx.stroke();
  }
  ctx.lineCap = "butt";
  ctx.lineWidth = 0.8;
  for (let k = 0; k < CHANNEL_FIBRES; k++) {
    const around = (k / CHANNEL_FIBRES) * TAU + (random() - 0.5) * 0.1;
    const reach = 0.85 + random() * 0.2;
    for (let start = 0; start < CHANNEL_SAMPLES - 1; start += 8) {
      const end = Math.min(CHANNEL_SAMPLES - 1, start + 8);
      const middle = (start + end) / 2 / (CHANNEL_SAMPLES - 1);
      const turn = TAU * 2.2 * middle;
      const facing = (Math.cos(around) * Math.sin(turn) + 0.35 * Math.sin(around) * Math.cos(turn) + 1) / 2;
      const front = facing * facing;
      const mix = (a: number, b: number) => Math.round(a + (b - a) * middle + (255 - a - (b - a) * middle) * 0.45 * front);
      ctx.strokeStyle = `rgb(${mix(ar, br)} ${mix(ag, bg)} ${mix(ab, bb)})`;
      ctx.globalAlpha = 0.12 + 0.5 * front;
      ctx.beginPath();
      for (let i = start; i <= end; i++) {
        const t = i / (CHANNEL_SAMPLES - 1);
        const turnAt = TAU * 2.2 * t;
        const across = Math.cos(around) * Math.cos(turnAt) - 0.35 * Math.sin(around) * Math.sin(turnAt);
        // The ribbon pinches into the Endpoints at both ends.
        const offset = halfWidth * reach * across * Math.pow(Math.sin(Math.PI * t), 0.35);
        const px = path.points[i * 2] + path.normals[i * 2] * offset;
        const py = path.points[i * 2 + 1] + path.normals[i * 2 + 1] * offset;
        if (i === start) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }
  return { canvas, x, y };
}

function hexagon(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const angle = (k / 6) * TAU + Math.PI / 6;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (k) ctx.lineTo(px, py);
    else ctx.moveTo(px, py);
  }
  ctx.closePath();
}

function diamond(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - radius);
  ctx.lineTo(x + radius, y);
  ctx.lineTo(x, y + radius);
  ctx.lineTo(x - radius, y);
  ctx.closePath();
}

/** A short burst, 0 → 1 → 0 over `length` seconds after `at`. */
function pulse(time: number, at: number, length: number): number {
  const t = (time - at) / length;
  return t > 0 && t < 1 ? Math.sin(Math.PI * t) : 0;
}

export function StoryStage({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const section = canvas?.closest<HTMLElement>('[data-scene="story"]');
    if (!canvas || !ctx || !section) return;

    const random = seeded(53);
    const tones = {
      a: {
        fibre: "rgb(176 164 255)",
        rgb: [139, 123, 255] as [number, number, number],
        ring: "rgb(196 186 255)",
        star: makeStar("rgb(228 222 255 / 0.95)", "rgb(139 123 255 / 0.34)"),
      },
      b: {
        fibre: "rgb(255 156 204)",
        rgb: [242, 127, 189] as [number, number, number],
        ring: "rgb(255 176 214)",
        star: makeStar("rgb(255 216 234 / 0.95)", "rgb(242 127 189 / 0.34)"),
      },
    };
    const warm = makeStar("rgb(255 228 196 / 0.95)", "rgb(255 170 110 / 0.34)");
    const ledgers = { a: buildLedger(1, false, 2.6, random), b: buildLedger(-1, true, 3.3, random) };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let layout: Layout = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 }, r: 1 };
    let layoutKey = "";
    let art: {
      a: HTMLCanvasElement;
      b: HTMLCanvasElement;
      channel: { canvas: HTMLCanvasElement; x: number; y: number };
      path: { points: Float32Array; normals: Float32Array };
      halfWidth: number;
    } | null = null;

    const bundles: Bundle[] = [];
    const waves: Wave[] = [];
    const flares = { a: 0, b: 0, verifier: 0 };
    /** Seconds the Channel has been open; drives the queue and the bundles. */
    let openFor = 0;
    let time = 0;
    let last = 0;
    let frame = 0;
    let running = false;
    let visible = false;

    const progress = () => {
      const rect = section.getBoundingClientRect();
      return clamp01(-rect.top / Math.max(1, rect.height - window.innerHeight));
    };

    // The ledgers' places come from ProtocolField; without WebGL the labels' fallbacks apply.
    const readLayout = (): Layout => {
      const style = getComputedStyle(document.documentElement);
      const px = (name: string, fallback: number) => {
        const value = parseFloat(style.getPropertyValue(name));
        return Number.isFinite(value) ? value : fallback;
      };
      return {
        a: { x: px("--ledger-a-x", width * 0.25), y: px("--ledger-a-y", height * 0.4) },
        b: { x: px("--ledger-b-x", width * 0.75), y: px("--ledger-b-y", height * 0.4) },
        r: px("--ledger-r", 80),
      };
    };

    const world = (center: Point, point: Point): Point => ({
      x: center.x + point.x * layout.r,
      y: center.y + point.y * layout.r,
    });

    const prepare = () => {
      const next = readLayout();
      const key = `${next.a.x}|${next.a.y}|${next.b.x}|${next.b.y}|${next.r}|${pixelRatio}`;
      if (art && key === layoutKey) return;
      layout = next;
      layoutKey = key;
      const from = world(layout.a, ledgers.a.endpoint);
      const to = world(layout.b, ledgers.b.endpoint);
      const path = channelPath(from, to);
      const halfWidth = Math.min(18, Math.max(6, layout.r * 0.12));
      art = {
        a: paintLedger(ledgers.a, tones.a, layout.r, pixelRatio),
        b: paintLedger(ledgers.b, tones.b, layout.r, pixelRatio),
        channel: paintChannel(path, halfWidth, tones, pixelRatio, seeded(61)),
        path,
        halfWidth,
      };
    };

    /** A point on the Channel, pushed sideways by `shift` (in half-widths). */
    const onChannel = (u: number, shift: number): Point => {
      if (!art) return { x: 0, y: 0 };
      const [x, y] = pointAt(art.path.points, u);
      const [nx, ny] = pointAt(art.path.normals, u);
      return { x: x + nx * art.halfWidth * shift, y: y + ny * art.halfWidth * shift };
    };

    const drawLedger = (key: "a" | "b", show: number, proofs: number) => {
      if (!art || show <= 0) return;
      const ledger = ledgers[key];
      const tone = tones[key];
      const center = layout[key];
      const grow = 0.9 + 0.1 * easeOut(show);
      const size = (art[key].width / pixelRatio) * grow;
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = show;
      ctx.drawImage(art[key], center.x - size / 2, center.y - size / 2, size, size);

      ctx.globalCompositeOperation = "lighter";
      for (const validator of ledger.validators) {
        const beat = (time - validator.beat) % ledger.heartbeat;
        const heartbeat = beat > 0 && beat < 0.6 ? Math.pow(Math.sin((Math.PI * beat) / 0.6), 2) : 0;
        // Verified state spreads through Ledger B from its Verifier.
        let verified = 0;
        if (key === "b" && ledger.verifier) {
          const distance = Math.hypot(validator.x - ledger.verifier.x, validator.y - ledger.verifier.y);
          for (const wave of waves) verified = Math.max(verified, pulse(wave.age, distance * 0.55, 0.6));
        }
        const twinkle = 0.85 + 0.15 * Math.sin(time * 1.4 + validator.phase);
        const point = world(center, validator);
        const s = validator.size * layout.r * 2 * grow * (1 + 0.35 * heartbeat + 0.9 * verified * proofs);
        ctx.globalAlpha = show * Math.min(1, twinkle + 0.4 * verified * proofs);
        ctx.drawImage(tone.star, point.x - s / 2, point.y - s / 2, s, s);
      }

      // The Endpoint, facing the other ledger.
      const endpoint = world(center, ledger.endpoint);
      const flare = flares[key];
      ctx.globalAlpha = show;
      ctx.strokeStyle = tone.ring;
      ctx.lineWidth = 1.4;
      hexagon(ctx, endpoint.x, endpoint.y, Math.max(6, layout.r * 0.11) * (1 + flare * 0.25));
      ctx.stroke();
      const glow = Math.max(10, layout.r * 0.2) * (1 + flare);
      ctx.globalAlpha = show * (0.6 + 0.4 * flare);
      ctx.drawImage(tone.star, endpoint.x - glow / 2, endpoint.y - glow / 2, glow, glow);

      // Ledger B's Verifier Contract.
      if (ledger.verifier) {
        const verifier = world(center, ledger.verifier);
        ctx.globalAlpha = show;
        ctx.strokeStyle = "rgb(255 140 192)";
        ctx.lineWidth = 1.4;
        diamond(ctx, verifier.x, verifier.y, Math.max(5, layout.r * 0.085) * (1 + flares.verifier * 0.3));
        ctx.stroke();
        if (flares.verifier > 0.02) {
          const v = Math.max(12, layout.r * 0.3) * (1 + flares.verifier);
          ctx.globalAlpha = flares.verifier;
          ctx.drawImage(tones.b.star, verifier.x - v / 2, verifier.y - v / 2, v, v);
        }
      }
    };

    /** Messages waiting on Ledger A, in order, each linked to the next by the running hash. */
    const drawQueue = (show: number, head: number) => {
      if (show <= 0) return;
      const start = world(layout.a, { x: 0.16, y: 0 });
      const end = world(layout.a, { x: 0.82, y: 0 });
      const at = (slot: number): Point => ({
        x: end.x + ((start.x - end.x) * slot) / (QUEUE - 1),
        y: end.y + ((start.y - end.y) * slot) / (QUEUE - 1),
      });
      const first = Math.ceil(head - 0.001);
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgb(181 171 255)";
      ctx.lineWidth = 1;
      ctx.globalAlpha = show * 0.55;
      ctx.beginPath();
      const front = at(Math.max(0, first - head));
      ctx.moveTo(front.x, front.y);
      const tail = at(Math.min(QUEUE - 1, first + QUEUE - 1 - head));
      ctx.lineTo(tail.x, tail.y);
      ctx.stroke();
      ctx.fillStyle = "rgb(236 232 255)";
      for (let message = first; message < first + QUEUE; message++) {
        const slot = message - head;
        if (slot < 0 || slot > QUEUE - 1) continue;
        const point = at(slot);
        ctx.globalAlpha = show * Math.min(1, (QUEUE - 1 - slot) * 1.5 + 0.2);
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2.2, 0, TAU);
        ctx.fill();
      }
    };

    const drawBundle = (bundle: Bundle, proofs: number) => {
      const u = easeInOut(clamp01(bundle.age / CROSSING));
      const along = bundle.response ? 1 - u : u;
      const fade = Math.min(1, u * 10, (1 - u) * 10);
      // Three messages travel together; responses come back warm, a little below.
      const spacing = 0.028;
      const middle = onChannel(along, bundle.response ? -0.5 : 0.3);
      for (let k = -1; k <= 1; k++) {
        const point = onChannel(clamp01(along + k * spacing * (bundle.response ? 1 : -1)), bundle.response ? -0.5 : 0.3);
        const size = bundle.response ? 16 : 18;
        ctx.globalAlpha = fade;
        ctx.drawImage(bundle.response ? warm : tones.a.star, point.x - size / 2, point.y - size / 2, size, size);
      }
      if (bundle.proof && !bundle.response) {
        ctx.globalAlpha = fade * proofs;
        ctx.strokeStyle = "rgb(255 140 192)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(middle.x, middle.y, Math.max(8, layout.r * 0.09), 0, TAU);
        ctx.stroke();
      }
    };

    const render = () => {
      if (!width || !height) return;
      prepare();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const p = progress();
      const show = {
        ledgers: smoothstep(0.27, 0.38, p),
        channel: smoothstep(0.5, 0.64, p),
        proofs: smoothstep(0.72, 0.8, p),
      };
      if (!art || show.ledgers <= 0) return;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      // The Channel opens from Endpoint A towards Endpoint B.
      if (show.channel > 0) {
        const front = onChannel(show.channel, 0);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, front.x, height);
        ctx.clip();
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        const { canvas: ribbon, x, y } = art.channel;
        ctx.drawImage(ribbon, x, y, ribbon.width / pixelRatio, ribbon.height / pixelRatio);
        ctx.restore();
        if (show.channel < 1) {
          const size = 28;
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = 1;
          ctx.drawImage(tones.a.star, front.x - size / 2, front.y - size / 2, size, size);
        }
      }

      drawLedger("a", show.ledgers, show.proofs);
      drawLedger("b", show.ledgers, show.proofs);

      const open = show.channel >= 1;
      const head = open ? 3 * (Math.floor(openFor / BUNDLE_EVERY) + easeInOut(clamp01((openFor % BUNDLE_EVERY) / 0.4))) : 0;
      drawQueue(show.channel, head);
      if (!open) return;
      ctx.globalCompositeOperation = "lighter";
      if (reducedMotion.matches) {
        // A still frame: one bundle on its way, one set of responses coming back.
        drawBundle({ age: CROSSING * 0.55, response: false, proof: show.proofs > 0 }, show.proofs);
        drawBundle({ age: CROSSING * 0.3, response: true, proof: false }, show.proofs);
        return;
      }
      for (const bundle of bundles) drawBundle(bundle, show.proofs);
    };

    const step = (delta: number) => {
      time += delta;
      const p = progress();
      const open = smoothstep(0.5, 0.64, p) >= 1;
      const proofs = smoothstep(0.72, 0.8, p) > 0.5;
      if (open) {
        const before = Math.floor(openFor / BUNDLE_EVERY);
        openFor += delta;
        if (Math.floor(openFor / BUNDLE_EVERY) > before) {
          bundles.push({ age: 0, response: false, proof: proofs });
          flares.a = 1;
        }
      } else {
        openFor = 0;
        bundles.length = 0;
      }
      for (let i = bundles.length - 1; i >= 0; i--) {
        const bundle = bundles[i];
        bundle.age += delta;
        if (bundle.age < CROSSING) continue;
        bundles.splice(i, 1);
        if (bundle.response) {
          flares.a = 1;
          continue;
        }
        flares.b = 1;
        if (bundle.proof) {
          flares.verifier = 1;
          waves.push({ age: 0 });
        }
        // Every message gets exactly one response, once B has handled it.
        bundles.push({ age: -CHECK, response: true, proof: false });
      }
      for (let i = waves.length - 1; i >= 0; i--) {
        waves[i].age += delta;
        if (waves[i].age > 2) waves.splice(i, 1);
      }
      const decay = Math.exp(-delta * 3);
      flares.a *= decay;
      flares.b *= decay;
      flares.verifier *= decay;
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
      const shouldRun = visible && !document.hidden && !reducedMotion.matches;
      if (shouldRun && !running) {
        running = true;
        last = 0;
        frame = requestAnimationFrame(tick);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(frame);
      }
      if (!running) render();
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      art = null;
      render();
    };

    // With reduced motion the stage only changes when the visitor scrolls.
    const onScroll = () => {
      if (!running) render();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    intersection.observe(section);
    window.addEventListener("scroll", onScroll, { passive: true });
    reducedMotion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    resize();
    sync();

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("scroll", onScroll);
      reducedMotion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div data-scene-art aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}
