"use client";

import { useEffect, useRef } from "react";

import {
  buildStrands,
  clamp01,
  easeInOut,
  easeOut,
  makeStar,
  pointAt,
  TAU,
  traceRange,
  type BundleShape,
  type Point,
} from "@/components/fibres";
import { seeded, type Random } from "@/components/sceneGraphs";
import { cn } from "@/lib/utils";

/*
 * The hero illustration: ledgers joined directly by Channels.
 *
 * Every star is a ledger and every bundle of fibres is a Channel between two
 * of them. No ledger sits in the middle: the light at the core is only where
 * the direct Channels between the inner ledgers cross.
 *
 * On load the network draws itself, ledgers first, then the Channels between
 * them, from the core outwards. After that a message now and then crosses a
 * Channel, the receiving ledger flares and rings as it verifies the proof, and
 * the response travels back. The drawing tilts a little towards the pointer.
 * With reduced motion the finished network holds still.
 */

const INTRO_SECONDS = 3.4;
const INTRO_DELAY = 0.35;

type Ledger = Point & {
  /** Distance from the center, 0 → 1. */
  radius: number;
  /** Star size, in units of the illustration's radius. */
  size: number;
  /** Intro time (0 → 1) at which the ledger appears. */
  appear: number;
  rim: boolean;
  spin: number;
  phase: number;
  flare: number;
};

type Shape = BundleShape & {
  width: number;
  alpha: number;
  /** Intro window (0 → 1) in which the Channel opens. */
  open: [number, number];
};

type Channel = {
  from: number;
  to: number;
  strands: Float32Array[];
  length: number;
  width: number;
  alpha: number;
  open: [number, number];
  /** Channels between ledgers at the same distance from the center open from both ends. */
  bothEnds: boolean;
  /** Colors at the start, the middle and the end. */
  colors: [string, string, string];
};

type Message = {
  channel: number;
  forward: boolean;
  /** Seconds since it left; negative while a response waits for the proof check. */
  age: number;
  duration: number;
  lanes: number[];
  response: boolean;
};

type Ripple = Point & { size: number; age: number };

const RADIUS = { inner: 0.52, ring: 0.875, rim: 1 };
/** Core, inner and spoke Channels: 5 + 5 + 15, built first by buildChannels. */
const INNER_CHANNELS = 25;

const SHAPES = {
  // Across the core, between inner ledgers two apart. They all pass the center.
  core: { strands: 32, bow: 0.16, spread: 0.15, twist: 0.03, width: 1.3, alpha: 0.12, open: [0.06, 0.42] },
  inner: { strands: 34, bow: -0.08, spread: 0.18, twist: 0.03, width: 0.85, alpha: 0.22, open: [0.14, 0.46] },
  spoke: { strands: 30, bow: 0.1, spread: 0.2, twist: 0.06, width: 0.8, alpha: 0.24, open: [0.26, 0.58] },
  ring: { strands: 26, bow: 0.06, spread: 0.16, twist: 0.03, width: 0.75, alpha: 0.22, open: [0.5, 0.76] },
  edge: { strands: 22, bow: 0.05, spread: 0.16, twist: 0.04, width: 0.7, alpha: 0.2, open: [0.58, 0.86] },
  rim: { strands: 16, bow: 0, spread: 0.03, twist: 0, width: 0.7, alpha: 0.3, open: [0.78, 1] },
} satisfies Record<string, Shape>;

// From the amber core through coral to the pink rim.
const STOPS: [number, number, number, number][] = [
  [0, 255, 182, 86],
  [0.35, 255, 150, 88],
  [0.62, 255, 124, 108],
  [0.86, 255, 102, 152],
  [1, 238, 104, 190],
];

function tint(radius: number): string {
  const r = clamp01(radius);
  const upper = STOPS.findIndex(([stop]) => stop >= r);
  const [s1, r1, g1, b1] = STOPS[Math.max(0, upper - 1)];
  const [s2, r2, g2, b2] = STOPS[Math.max(0, upper)];
  const t = s2 > s1 ? (r - s1) / (s2 - s1) : 0;
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgb(${mix(r1, r2)} ${mix(g1, g2)} ${mix(b1, b2)})`;
}

function polar(radius: number, degrees: number): Point {
  const angle = (degrees * Math.PI) / 180;
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

/** Five inner ledgers, a ring of ten and the ten corners of the rim. */
function buildLedgers(random: Random): Ledger[] {
  const ledgers: Ledger[] = [];
  const add = (radius: number, degrees: number, size: number, appear: number) =>
    ledgers.push({
      ...polar(radius, degrees),
      radius,
      size,
      appear,
      rim: radius === RADIUS.rim,
      spin: (random() - 0.5) * 0.6,
      phase: random() * TAU,
      flare: 0,
    });
  for (let i = 0; i < 5; i++) add(RADIUS.inner, -90 + i * 72, 0.105, 0.02 + i * 0.012);
  for (let i = 0; i < 10; i++) add(RADIUS.ring, -90 + i * 36, 0.078, 0.5 + (i % 2) * 0.05);
  for (let i = 0; i < 10; i++) add(RADIUS.rim, -72 + i * 36, 0.05, 0.8);
  return ledgers;
}

function buildChannels(ledgers: Ledger[], random: Random): Channel[] {
  const channels: Channel[] = [];
  const link = (from: number, to: number, shape: Shape) => {
    // Radial Channels grow outwards, from the ledger nearer the center.
    if (ledgers[from].radius > ledgers[to].radius) [from, to] = [to, from];
    const a = ledgers[from];
    const b = ledgers[to];
    const strands = buildStrands(a, b, shape, random);
    const [mx, my] = pointAt(strands[Math.floor(strands.length / 2)], 0.5);
    channels.push({
      from,
      to,
      strands,
      length: Math.hypot(b.x - a.x, b.y - a.y),
      width: shape.width,
      alpha: shape.alpha,
      open: shape.open,
      bothEnds: Math.abs(a.radius - b.radius) < 0.01,
      colors: [tint(a.radius), tint(Math.hypot(mx, my)), tint(b.radius)],
    });
  };
  const inner = (i: number) => (i + 5) % 5;
  const ring = (i: number) => 5 + ((i + 10) % 10);
  const rim = (i: number) => 15 + ((i + 10) % 10);
  for (let i = 0; i < 5; i++) link(inner(i), inner(i + 2), SHAPES.core);
  for (let i = 0; i < 5; i++) link(inner(i), inner(i + 1), SHAPES.inner);
  for (let i = 0; i < 5; i++) {
    link(inner(i), ring(2 * i), SHAPES.spoke);
    link(inner(i), ring(2 * i + 1), SHAPES.spoke);
    link(inner(i), ring(2 * i - 1), SHAPES.spoke);
  }
  for (let i = 0; i < 10; i++) link(ring(i), ring(i + 1), SHAPES.ring);
  for (let i = 0; i < 10; i++) {
    link(ring(i), rim(i), SHAPES.edge);
    link(ring(i + 1), rim(i), SHAPES.edge);
  }
  for (let i = 0; i < 10; i++) link(rim(i), rim(i + 1), SHAPES.rim);
  return channels;
}

/** The outline of the network: the ten ledgers on the rim, optionally grown a little. */
function traceRim(ctx: CanvasRenderingContext2D, ledgers: Ledger[], grow = 1) {
  ctx.beginPath();
  ledgers
    .filter((ledger) => ledger.rim)
    .forEach((ledger, index) =>
      index ? ctx.lineTo(ledger.x * grow, ledger.y * grow) : ctx.moveTo(ledger.x * grow, ledger.y * grow),
    );
  ctx.closePath();
}

/** The membrane inside the rim: warm at the core, pink towards the edge. */
function paintHaze(ctx: CanvasRenderingContext2D, ledgers: Ledger[], alpha: number) {
  if (alpha <= 0) return;
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = alpha;
  const fill = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  fill.addColorStop(0, "rgb(255 168 86 / 0.42)");
  fill.addColorStop(0.42, "rgb(255 132 100 / 0.2)");
  fill.addColorStop(0.85, "rgb(250 104 150 / 0.1)");
  fill.addColorStop(1, "rgb(238 104 190 / 0.06)");
  ctx.fillStyle = fill;
  traceRim(ctx, ledgers);
  ctx.fill();
}

/** Where the five Channels across the core cross, their light adds up. */
function paintCore(ctx: CanvasRenderingContext2D, alpha: number) {
  if (alpha <= 0) return;
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = alpha;
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 0.4);
  glow.addColorStop(0, "rgb(255 200 128 / 0.7)");
  glow.addColorStop(0.35, "rgb(255 152 92 / 0.28)");
  glow.addColorStop(1, "rgb(255 130 110 / 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(-0.4, -0.4, 0.8, 0.8);
}

/** How far a Channel has opened at a given intro time, 0 → 1. */
function openness(channel: Channel, intro: number): number {
  const [start, end] = channel.open;
  return easeOut(clamp01((intro - start) / (end - start)));
}

function paintChannels(
  ctx: CanvasRenderingContext2D,
  channels: Channel[],
  ledgers: Ledger[],
  scale: number,
  openOf: (index: number) => number,
) {
  // The fibres stay inside the rim, so the network keeps a crisp outline.
  ctx.save();
  traceRim(ctx, ledgers, 1.025);
  ctx.clip();
  ctx.globalCompositeOperation = "lighter";
  for (const [index, channel] of channels.entries()) {
    const open = openOf(index);
    if (open <= 0) continue;
    const a = ledgers[channel.from];
    const b = ledgers[channel.to];
    const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    gradient.addColorStop(0, channel.colors[0]);
    gradient.addColorStop(0.5, channel.colors[1]);
    gradient.addColorStop(1, channel.colors[2]);
    ctx.strokeStyle = gradient;
    ctx.globalAlpha = channel.alpha;
    ctx.lineWidth = channel.width / scale;
    ctx.beginPath();
    for (const strand of channel.strands) {
      if (channel.bothEnds) {
        traceRange(ctx, strand, 0, open / 2);
        traceRange(ctx, strand, 1 - open / 2, 1);
      } else {
        traceRange(ctx, strand, 0, open);
      }
    }
    ctx.stroke();
  }
  ctx.restore();
}

function paintLedgers(
  ctx: CanvasRenderingContext2D,
  ledgers: Ledger[],
  stars: { warm: HTMLCanvasElement; pink: HTMLCanvasElement },
  time: number,
  intro: number,
) {
  ctx.globalCompositeOperation = "lighter";
  for (const ledger of ledgers) {
    const shown = clamp01((intro - ledger.appear) / 0.12);
    if (shown <= 0) continue;
    const twinkle = 0.88 + 0.12 * Math.sin(time * 1.3 + ledger.phase);
    // A ledger brightens as it appears, then settles.
    const arrival = 1 + 0.5 * Math.sin(Math.PI * shown);
    const size = ledger.size * 2 * arrival * (1 + ledger.flare * 0.7);
    ctx.globalAlpha = Math.min(1, easeOut(shown) * twinkle * (1 + ledger.flare * 0.6));
    ctx.save();
    ctx.translate(ledger.x, ledger.y);
    ctx.rotate(ledger.spin);
    ctx.drawImage(ledger.rim ? stars.pink : stars.warm, -size / 2, -size / 2, size, size);
    ctx.restore();
  }
}

function paintTraffic(
  ctx: CanvasRenderingContext2D,
  channels: Channel[],
  messages: Message[],
  ripples: Ripple[],
  star: HTMLCanvasElement,
  scale: number,
) {
  ctx.globalCompositeOperation = "lighter";
  for (const message of messages) {
    if (message.age < 0) continue;
    const channel = channels[message.channel];
    const progress = easeInOut(clamp01(message.age / message.duration));
    const head = message.forward ? progress : 1 - progress;
    const fade = Math.min(1, progress * 8, (1 - progress) * 8);
    // Messages in transit are violet; responses come back warm.
    ctx.strokeStyle = message.response ? "rgb(255 220 180)" : "rgb(214 206 255)";
    ctx.lineWidth = 1.6 / scale;
    // Three overlapping trails of different length: bright at the head, fading behind it.
    for (const trail of [0.05, 0.1, 0.2]) {
      const tail = message.forward ? head - trail : head + trail;
      ctx.globalAlpha = 0.5 * fade;
      ctx.beginPath();
      for (const lane of message.lanes) {
        traceRange(ctx, channel.strands[lane], Math.max(0, Math.min(head, tail)), Math.min(1, Math.max(head, tail)));
      }
      ctx.stroke();
    }
    const [x, y] = pointAt(channel.strands[message.lanes[Math.floor(message.lanes.length / 2)]], head);
    const size = 0.1;
    ctx.globalAlpha = fade;
    ctx.drawImage(star, x - size / 2, y - size / 2, size, size);
  }
  // The receiving ledger rings as it checks the proof.
  ctx.strokeStyle = "rgb(255 140 192)";
  ctx.lineWidth = 1.4 / scale;
  for (const ripple of ripples) {
    const k = ripple.age / 1.1;
    ctx.globalAlpha = 0.8 * (1 - k) * (1 - k);
    ctx.beginPath();
    ctx.arc(ripple.x, ripple.y, ripple.size * (0.3 + k * 1.1), 0, TAU);
    ctx.stroke();
  }
}

export function HeroMesh({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const cache = document.createElement("canvas");
    const cacheCtx = cache.getContext("2d");
    if (!canvas || !ctx || !cacheCtx) return;

    const random = seeded(29);
    const ledgers = buildLedgers(random);
    const channels = buildChannels(ledgers, random);
    const stars = {
      warm: makeStar("rgb(255 226 184 / 0.95)", "rgb(255 170 104 / 0.32)"),
      pink: makeStar("rgb(255 206 226 / 0.9)", "rgb(242 127 189 / 0.3)"),
    };
    const messages: Message[] = [];
    const ripples: Ripple[] = [];

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Only draw the network in when the visitor actually starts at the top.
    let intro = reducedMotion.matches || window.scrollY > 80 ? 1 : 0;
    let delay = INTRO_DELAY;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let scale = 1;
    let cached = false;
    let time = 0;
    let last = 0;
    let frame = 0;
    let running = false;
    let visible = true;
    let nextMessage = 0.8;
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 };

    const place = (target: CanvasRenderingContext2D) => {
      target.setTransform(pixelRatio * scale, 0, 0, pixelRatio * scale, (pixelRatio * width) / 2, (pixelRatio * height) / 2);
    };
    const clear = (target: CanvasRenderingContext2D) => {
      target.setTransform(1, 0, 0, 1, 0, 0);
      target.globalAlpha = 1;
      target.globalCompositeOperation = "source-over";
      target.clearRect(0, 0, target.canvas.width, target.canvas.height);
    };
    // During the intro `cache` collects the Channels that have finished opening, so each frame
    // only redraws the ones still opening. Afterwards it holds the finished network.
    const baked = new Set<number>();
    const paintIntro = () => {
      const done = channels.flatMap((channel, index) =>
        !baked.has(index) && openness(channel, intro) >= 1 ? [index] : [],
      );
      if (done.length) {
        place(cacheCtx);
        paintChannels(cacheCtx, channels, ledgers, scale, (index) => (done.includes(index) ? 1 : 0));
        done.forEach((index) => baked.add(index));
      }
      clear(ctx);
      place(ctx);
      paintHaze(ctx, ledgers, clamp01((intro - 0.05) / 0.55));
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 1;
      ctx.drawImage(cache, 0, 0);
      place(ctx);
      paintChannels(ctx, channels, ledgers, scale, (index) => (baked.has(index) ? 0 : openness(channels[index], intro)));
      paintCore(ctx, clamp01((intro - 0.2) / 0.3));
    };
    const paintFinished = () => {
      clear(cacheCtx);
      place(cacheCtx);
      paintHaze(cacheCtx, ledgers, 1);
      paintChannels(cacheCtx, channels, ledgers, scale, () => 1);
      paintCore(cacheCtx, 1);
    };

    const render = () => {
      if (!width || !height) return;
      if (intro < 1) {
        paintIntro();
      } else {
        // The finished network is drawn once; each frame only adds the traffic and the stars.
        if (!cached) {
          paintFinished();
          cached = true;
        }
        clear(ctx);
        ctx.drawImage(cache, 0, 0);
        place(ctx);
        paintTraffic(ctx, channels, messages, ripples, stars.warm, scale);
      }
      paintLedgers(ctx, ledgers, stars, time, intro);
    };

    const send = () => {
      // Mostly the busy inner Channels (the core, inner and spoke Channels come first), sometimes one further out.
      const index = random() < 0.7 ? Math.floor(random() * INNER_CHANNELS) : Math.floor(random() * channels.length);
      const channel = channels[index];
      const spine = Math.floor(channel.strands.length / 2);
      // Fibres along the spine of the bundle, close together, so the message reads as one packet.
      const lanes = [-3, -2, -1, 0, 1, 2, 3].map((step) => Math.min(channel.strands.length - 1, Math.max(0, spine + step)));
      messages.push({
        channel: index,
        forward: random() < 0.5,
        age: 0,
        duration: 1.1 + channel.length * 1.2,
        lanes,
        response: false,
      });
    };

    const step = (delta: number) => {
      time += delta;
      if (intro < 1) {
        if (delay > 0) delay -= delta;
        else intro = Math.min(1, intro + delta / INTRO_SECONDS);
      } else {
        nextMessage -= delta;
        if (nextMessage <= 0 && messages.length < 4) {
          send();
          nextMessage = 0.9 + random() * 1.6;
        }
      }
      for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i];
        message.age += delta;
        if (message.age < message.duration) continue;
        messages.splice(i, 1);
        const channel = channels[message.channel];
        const target = ledgers[message.forward ? channel.to : channel.from];
        target.flare = 1;
        ripples.push({ x: target.x, y: target.y, size: target.size * 2.2, age: 0 });
        // Every message gets exactly one response, once the proof is checked.
        if (!message.response) {
          messages.push({
            ...message,
            forward: !message.forward,
            age: -0.45,
            lanes: message.lanes.map((lane) => Math.min(channel.strands.length - 1, lane + 1)),
            response: true,
          });
        }
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].age += delta;
        if (ripples[i].age > 1.1) ripples.splice(i, 1);
      }
      const decay = Math.exp(-delta * 2.6);
      for (const ledger of ledgers) ledger.flare *= decay;

      const follow = 1 - Math.exp(-delta * 3);
      tilt.x += (tilt.tx - tilt.x) * follow;
      tilt.y += (tilt.ty - tilt.y) * follow;
      canvas.style.transform = `perspective(1600px) rotateX(${(-tilt.y * 5).toFixed(2)}deg) rotateY(${(tilt.x * 7).toFixed(2)}deg)`;
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
      if (reducedMotion.matches) {
        intro = 1;
        messages.length = 0;
        ripples.length = 0;
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
      // Leave room around the rim for the stars' glow.
      scale = (Math.min(width, height) / 2) * 0.9;
      cached = false;
      baked.clear();
      render();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      tilt.tx = (event.clientX / window.innerWidth) * 2 - 1;
      tilt.ty = (event.clientY / window.innerHeight) * 2 - 1;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
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
    <div data-scene-art aria-hidden="true" className={cn("hero-mesh relative", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
