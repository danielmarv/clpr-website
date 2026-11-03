import type { ReactNode } from "react";

import type { Point } from "@/components/fibres";
import { Bundle, fibre, Glows, LaneGradient, MiniLedger, Mover, Pulse, Star, TONES, type Tone } from "@/components/fibreSvg";
import { useCases } from "@/content/site";

// Decorative diagrams for the four application patterns, in the vocabulary and motion of ComponentArt:
// the message leaves at the start of the cycle and lands at 42% (2.02s), the response is back by 92% (4.42s).

const WIDTH = 320;
const HEIGHT = 168;
const ARRIVES = 2.02;
const RETURNS = 4.42;
const labels = useCases.art;

function Art({ id, children }: { id: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} fill="none" aria-hidden="true" className="size-full overflow-visible">
      <Glows id={id} />
      {children}
    </svg>
  );
}

function Label({ x, y, anchor = "middle", children }: { x: number; y: number; anchor?: "start" | "middle" | "end"; children: ReactNode }) {
  return (
    <text x={x} y={y} textAnchor={anchor} className="fill-fg/45 text-[12px]">
      {children}
    </text>
  );
}

function Message({ id }: { id: string }) {
  return (
    <>
      <Star id={id} tone="violet" r={11} />
      <circle r={10} stroke={TONES.pink} strokeWidth={1.2} />
    </>
  );
}

function Response() {
  return <rect x={-5} y={-5} width={10} height={10} rx={2} transform="rotate(45)" fill="var(--art-fill)" stroke={TONES.warm} strokeWidth={1.4} />;
}

/** An asset: a tile, so it is not mistaken for a Connector's coin. */
function Asset({ tone, x = 0, y = 0 }: { tone: Tone; x?: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-7} y={-7} width={14} height={14} rx={3} fill="var(--art-fill)" stroke={TONES[tone]} strokeWidth={1.4} />
      <rect x={-2.5} y={-2.5} width={5} height={5} rx={1} fill={TONES[tone]} />
    </g>
  );
}

/** A Channel between two ledgers: the message lane above, the response lane below. */
function lanes(a: Point, b: Point, r: number) {
  return {
    upper: { from: { x: a.x + r, y: a.y - 6 }, to: { x: b.x - r, y: b.y - 6 }, bow: -0.14 },
    lower: { from: { x: b.x - r, y: b.y + 6 }, to: { x: a.x + r, y: a.y + 6 }, bow: -0.14 },
  };
}

function CallArt() {
  const id = "pattern-call";
  const a = { x: 52, y: 84 };
  const b = { x: 268, y: 84 };
  const { upper, lower } = lanes(a, b, 30);
  return (
    <Art id={id}>
      <LaneGradient id={`${id}-lane`} x1={a.x} x2={b.x} />
      <Bundle {...upper} stroke={`url(#${id}-lane)`} strands={6} spread={0.04} opacity={0.55} seed={11} />
      <Bundle {...lower} tone="warm" strands={5} spread={0.04} opacity={0.4} seed={12} />
      <MiniLedger id={id} tone="violet" x={a.x} y={a.y} r={28} seed={3} />
      <MiniLedger id={id} tone="pink" x={b.x} y={b.y} r={28} seed={4} />
      <Pulse x={b.x} y={b.y} motion="prop-ring" delay={ARRIVES} rest={0}>
        <circle r={34} stroke={TONES.pink} strokeWidth={1.4} />
      </Pulse>
      <Pulse x={a.x} y={a.y} motion="prop-ring" delay={RETURNS} rest={0}>
        <circle r={34} stroke={TONES.warm} strokeWidth={1.4} />
      </Pulse>
      <Mover path={fibre(upper.from, upper.to, upper.bow)} motion="prop-message" at={55}>
        <Message id={id} />
      </Mover>
      <Mover path={fibre(lower.from, lower.to, lower.bow)} motion="prop-response" at={35}>
        <Response />
      </Mover>
      <Label x={160} y={30}>{labels.call}</Label>
      <Label x={160} y={148}>{labels.result}</Label>
    </Art>
  );
}

function EscrowArt() {
  const id = "pattern-escrow";
  const a = { x: 52, y: 62 };
  const b = { x: 268, y: 62 };
  const locked = { x: a.x, y: 122 };
  const minted = { x: b.x, y: 122 };
  const { upper, lower } = lanes(a, b, 28);
  return (
    <Art id={id}>
      <LaneGradient id={`${id}-lane`} x1={a.x} x2={b.x} />
      <Bundle {...upper} stroke={`url(#${id}-lane)`} strands={6} spread={0.04} opacity={0.55} seed={21} />
      <Bundle {...lower} tone="warm" strands={5} spread={0.04} opacity={0.4} seed={22} />
      <Bundle from={{ x: a.x, y: a.y + 28 }} to={{ x: locked.x, y: locked.y - 14 }} tone="violet" strands={3} spread={0.1} opacity={0.35} seed={23} />
      <Bundle from={{ x: b.x, y: b.y + 28 }} to={{ x: minted.x, y: minted.y - 10 }} tone="pink" strands={3} spread={0.1} opacity={0.35} seed={24} />
      <MiniLedger id={id} tone="violet" x={a.x} y={a.y} r={26} seed={5} />
      <MiniLedger id={id} tone="pink" x={b.x} y={b.y} r={26} seed={6} />
      {/* The escrow: the locked asset sits in a dashed hold until the response settles it. */}
      <rect x={locked.x - 14} y={locked.y - 14} width={28} height={28} rx={7} stroke="var(--fg)" strokeOpacity={0.3} strokeWidth={1} strokeDasharray="2.5 2.5" />
      <Asset tone="violet" x={locked.x} y={locked.y} />
      <Pulse x={locked.x} y={locked.y} motion="prop-ring" delay={RETURNS} rest={0}>
        <circle r={16} stroke={TONES.warm} strokeWidth={1.4} />
      </Pulse>
      <Pulse x={minted.x} y={minted.y} motion="prop-bead" delay={ARRIVES}>
        <Asset tone="pink" />
      </Pulse>
      <Mover path={fibre(upper.from, upper.to, upper.bow)} motion="prop-message" at={55}>
        <Message id={id} />
      </Mover>
      <Mover path={fibre(lower.from, lower.to, lower.bow)} motion="prop-response" at={35}>
        <Response />
      </Mover>
      <Label x={locked.x + 28} y={locked.y + 4} anchor="start">{labels.locked}</Label>
      <Label x={minted.x - 20} y={minted.y + 4} anchor="end">{labels.minted}</Label>
    </Art>
  );
}

function SwapArt() {
  const id = "pattern-swap";
  // The top ledger runs the two-phase commit; the others answer ready, and all commit at once.
  const lead = { x: 160, y: 38, tone: "violet" as const };
  const others = [
    { x: 58, y: 108, tone: "pink" as const },
    { x: 262, y: 108, tone: "mist" as const },
  ];
  const r = 22;
  const toward = (from: Point, to: Point, by: number) => {
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    return { x: from.x + ((to.x - from.x) / length) * by, y: from.y + ((to.y - from.y) / length) * by };
  };
  const legs = others.map((other) => ({ from: toward(lead, other, r + 4), to: toward(other, lead, r + 4) }));
  return (
    <Art id={id}>
      <Bundle from={toward(others[0], others[1], r + 4)} to={toward(others[1], others[0], r + 4)} tone="mist" strands={4} spread={0.05} opacity={0.3} seed={31} />
      {legs.map((leg, k) => (
        <g key={k}>
          <Bundle {...leg} bow={k ? -0.08 : 0.08} tone="violet" strands={5} spread={0.06} opacity={0.5} seed={32 + k} />
          <Bundle from={leg.to} to={leg.from} bow={k ? -0.08 : 0.08} tone="warm" strands={4} spread={0.06} opacity={0.35} seed={34 + k} />
        </g>
      ))}
      <MiniLedger id={id} tone={lead.tone} x={lead.x} y={lead.y} r={r} seed={7} />
      {others.map((other, k) => (
        <MiniLedger key={k} id={id} tone={other.tone} x={other.x} y={other.y} r={r} seed={8 + k} />
      ))}
      {[lead, ...others].map((ledger, k) => (
        <Pulse key={k} x={ledger.x} y={ledger.y} motion="prop-ring" delay={RETURNS} rest={0}>
          <circle r={r + 7} stroke={TONES.warm} strokeWidth={1.4} />
        </Pulse>
      ))}
      {legs.map((leg, k) => (
        <g key={k}>
          <Mover path={fibre(leg.from, leg.to, k ? -0.08 : 0.08)} motion="prop-message" at={50}>
            <Message id={id} />
          </Mover>
          <Mover path={fibre(leg.to, leg.from, k ? -0.08 : 0.08)} motion="prop-response" hidden={k !== 0} at={50}>
            <Response />
          </Mover>
        </g>
      ))}
      <Label x={160} y={158}>{labels.together}</Label>
    </Art>
  );
}

function HieroArt() {
  const id = "pattern-hiero";
  const a = { x: 52, y: 78 };
  const b = { x: 268, y: 78 };
  const { upper, lower } = lanes(a, b, 30);
  return (
    <Art id={id}>
      {/* Dashed: the design names this pattern in one sentence and does not yet specify it. */}
      <path d={fibre(upper.from, upper.to, upper.bow)} stroke={TONES.violet} strokeOpacity={0.55} strokeWidth={1} strokeDasharray="3 4" />
      <path d={fibre(lower.from, lower.to, lower.bow)} stroke={TONES.warm} strokeOpacity={0.45} strokeWidth={1} strokeDasharray="3 4" />
      <MiniLedger id={id} tone="violet" x={a.x} y={a.y} r={28} seed={9} />
      <MiniLedger id={id} tone="violet" x={b.x} y={b.y} r={28} seed={10} />
      <Mover path={fibre(upper.from, upper.to, upper.bow)} motion="prop-message" at={55}>
        <Asset tone="violet" />
      </Mover>
      <Mover path={fibre(lower.from, lower.to, lower.bow)} motion="prop-response" at={35}>
        <Response />
      </Mover>
      <Label x={160} y={24}>{labels.outlined}</Label>
      <Label x={a.x} y={140}>{labels.hiero}</Label>
      <Label x={b.x} y={140}>{labels.hiero}</Label>
    </Art>
  );
}

/** One diagram per pattern, in the order of `useCases.patterns`. */
export const USE_CASE_ART = [CallArt, EscrowArt, SwapArt, HieroArt];
