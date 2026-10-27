import type { CSSProperties, ReactNode } from "react";

import type { Point } from "@/components/fibres";
import { seeded } from "@/components/sceneGraphs";

/*
 * SVG building blocks for the fibre-language diagrams (PropertyArt,
 * MessageJourney): bundles of fine fibres between two points, soft stars with
 * four rays, ledger membranes and the Endpoint hexagon. Pure and deterministic,
 * so they render the same on the server and in the browser.
 */

export type Tone = "violet" | "pink" | "warm" | "mist";

export const TONES: Record<Tone, string> = {
  violet: "#9d8bff",
  pink: "#f27fbd",
  warm: "#ffb49a",
  mist: "#d4cff0",
};

export const round = (value: number) => Math.round(value * 10) / 10;

/** One fibre from a to b: a cubic bowed sideways by `bow` plus its place in the fan (relative to length). */
export function fibre(a: Point, b: Point, bow: number, offset = 0): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const side = length * (bow + offset);
  const c1 = { x: a.x + dx * 0.33 + nx * side, y: a.y + dy * 0.33 + ny * side };
  const c2 = { x: a.x + dx * 0.67 + nx * side * 0.9, y: a.y + dy * 0.67 + ny * side * 0.9 };
  return `M${round(a.x)} ${round(a.y)}C${round(c1.x)} ${round(c1.y)} ${round(c2.x)} ${round(c2.y)} ${round(b.x)} ${round(b.y)}`;
}

export function Bundle({
  from,
  to,
  tone = "violet",
  stroke,
  strands = 6,
  spread = 0.08,
  bow = 0,
  opacity = 0.55,
  seed = 1,
}: {
  from: Point;
  to: Point;
  tone?: Tone;
  stroke?: string;
  strands?: number;
  spread?: number;
  bow?: number;
  opacity?: number;
  seed?: number;
}) {
  const random = seeded(seed);
  return (
    <g stroke={stroke ?? TONES[tone]} strokeOpacity={opacity} strokeWidth={0.9}>
      {Array.from({ length: strands }, (_, s) => {
        const lane = strands > 1 ? (s / (strands - 1)) * 2 - 1 : 0;
        // Denser along the spine of the bundle, sparser at its edges.
        const fan = Math.sign(lane) * Math.pow(Math.abs(lane), 1.5) + (random() - 0.5) * 0.2;
        return <path key={s} d={fibre(from, to, bow, spread * fan)} />;
      })}
    </g>
  );
}

/** Soft star glows and ledger membranes, one set per diagram so the ids stay unique. */
export function Glows({ id }: { id: string }) {
  return (
    <defs>
      {(Object.entries(TONES) as [Tone, string][]).map(([tone, color]) => (
        <radialGradient key={tone} id={`${id}-${tone}`}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.14" stopColor={color} stopOpacity="0.95" />
          <stop offset="0.42" stopColor={color} stopOpacity="0.25" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      ))}
      {(["violet", "pink", "mist"] as const).map((tone) => (
        <radialGradient key={tone} id={`${id}-${tone}-membrane`}>
          <stop offset="0" stopColor={TONES[tone]} stopOpacity="0.24" />
          <stop offset="1" stopColor={TONES[tone]} stopOpacity="0.05" />
        </radialGradient>
      ))}
    </defs>
  );
}

/** A Channel's fibres, violet at Ledger A and pink at Ledger B. */
export function LaneGradient({ id, x1, x2 }: { id: string; x1: number; x2: number }) {
  return (
    <defs>
      <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x1} y1="0" x2={x2} y2="0">
        <stop offset="0" stopColor={TONES.violet} />
        <stop offset="1" stopColor={TONES.pink} />
      </linearGradient>
    </defs>
  );
}

export function Star({ id, tone, r, x = 0, y = 0 }: { id: string; tone: Tone; r: number; x?: number; y?: number }) {
  const ray = Math.max(0.6, r * 0.07);
  return (
    <g transform={`translate(${round(x)} ${round(y)})`}>
      <circle r={r} fill={`url(#${id}-${tone})`} />
      <path d={`M${-r} 0L0 ${-ray}L${r} 0L0 ${ray}ZM0 ${-r}L${ray} 0L0 ${r}L${-ray} 0Z`} fill="#fff" fillOpacity={0.65} />
    </g>
  );
}

export function hexagon(x: number, y: number, r: number): string {
  return (
    Array.from({ length: 6 }, (_, k) => {
      const angle = (k / 6) * Math.PI * 2 + Math.PI / 6;
      return `${k ? "L" : "M"}${round(x + Math.cos(angle) * r)} ${round(y + Math.sin(angle) * r)}`;
    }).join("") + "Z"
  );
}

export function timing(duration: number, delay: number): CSSProperties {
  return { "--duration": `${duration}s`, "--delay": `${delay}s` } as CSSProperties;
}

/** A part that rides `path`; at rest it sits `at` percent along it. */
export function Mover({
  path,
  motion,
  at,
  duration = 4.8,
  delay = 0,
  hidden = false,
  children,
}: {
  path: string;
  motion: string;
  at: number;
  duration?: number;
  delay?: number;
  hidden?: boolean;
  children: ReactNode;
}) {
  return (
    <g
      className={`prop-move ${motion}`}
      style={{
        offsetPath: `path("${path}")`,
        offsetDistance: `${at}%`,
        opacity: hidden ? 0 : undefined,
        ...timing(duration, delay),
      }}
    >
      {children}
    </g>
  );
}

/** A part that flashes in place; `rest` is its opacity without motion. */
export function Pulse({
  x,
  y,
  motion,
  duration = 4.8,
  delay = 0,
  rest = 1,
  children,
}: {
  x: number;
  y: number;
  motion: string;
  duration?: number;
  delay?: number;
  rest?: number;
  children: ReactNode;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={`prop-pop ${motion}`} style={{ opacity: rest, ...timing(duration, delay) }}>
        {children}
      </g>
    </g>
  );
}

export function Endpoint({ x, y, tone, offline = false }: { x: number; y: number; tone: Tone; offline?: boolean }) {
  return (
    <path
      d={hexagon(x, y, 9)}
      fill="#0b0a13"
      fillOpacity={0.7}
      stroke={offline ? "#fff" : TONES[tone]}
      strokeOpacity={offline ? 0.3 : 0.85}
      strokeWidth={1.2}
      strokeDasharray={offline ? "2.5 2.5" : undefined}
    />
  );
}

/** A small ledger: a membrane with a handful of validators joined by fibres. */
export function MiniLedger({ id, tone, x, y, r, seed }: { id: string; tone: "violet" | "pink" | "mist"; x: number; y: number; r: number; seed: number }) {
  const random = seeded(seed);
  const ring = Array.from({ length: 5 }, (_, k) => {
    const angle = ((-90 + k * 72 + (random() - 0.5) * 24) * Math.PI) / 180;
    return { x: Math.cos(angle) * r * 0.6, y: Math.sin(angle) * r * 0.6 };
  });
  const center = { x: 0, y: 0 };
  const links: [Point, Point][] = ring.flatMap((point, k) => [
    [point, ring[(k + 1) % ring.length]] as [Point, Point],
    [point, center] as [Point, Point],
  ]);
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={`url(#${id}-${tone}-membrane)`} stroke={TONES[tone]} strokeOpacity={0.45} strokeWidth={0.8} />
      {links.map(([a, b], k) => (
        <Bundle key={k} from={a} to={b} tone={tone} strands={3} spread={0.16} opacity={0.4} seed={seed * 10 + k} />
      ))}
      {[center, ...ring].map((point, k) => (
        <Star key={k} id={id} tone={tone} r={k ? r * 0.3 : r * 0.36} x={point.x} y={point.y} />
      ))}
    </g>
  );
}
