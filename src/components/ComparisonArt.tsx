import type { ReactNode } from "react";

import { Bundle, Endpoint, Glows, LaneGradient, MiniLedger, Mover, Pulse, Star, TONES } from "@/components/fibreSvg";
import { comparison } from "@/content/site";
import { cn } from "@/lib/utils";

// Where trust lives, drawn both ways. Both sides run on the same clock, so the difference reads at a glance.

const WIDTH = 520;
const HEIGHT = 200;
const A = { x: 62, y: 92 };
const B = { x: 458, y: 92 };
const RADIUS = 46;
const A_RIM = { x: A.x + RADIUS, y: A.y };
const B_RIM = { x: B.x - RADIUS, y: B.y };
const HUB = { x: 260, y: 92, width: 104, height: 88 };
const ACROSS = `M${A_RIM.x} ${A_RIM.y}L${B_RIM.x} ${B_RIM.y}`;

const { diagrams } = comparison;

function Art({ id, children }: { id: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} fill="none" aria-hidden="true" className="size-full overflow-visible">
      <Glows id={id} />
      {children}
    </svg>
  );
}

function Caption({ y = 172, children, className }: { y?: number; children: ReactNode; className?: string }) {
  return (
    <text x={WIDTH / 2} y={y} textAnchor="middle" className={cn("text-[15px] max-sm:text-[21px]", className ?? "fill-white/45")}>
      {children}
    </text>
  );
}

export function BridgeArt() {
  const id = "bridge-trust";
  const validators = [
    { x: HUB.x - 16, y: HUB.y + 4 },
    { x: HUB.x + 16, y: HUB.y + 4 },
    { x: HUB.x - 16, y: HUB.y + 24 },
    { x: HUB.x + 16, y: HUB.y + 24 },
  ];
  return (
    <Art id={id}>
      <Bundle from={A_RIM} to={{ x: HUB.x - HUB.width / 2, y: HUB.y }} tone="mist" strands={5} spread={0.05} opacity={0.35} seed={1} />
      <Bundle from={{ x: HUB.x + HUB.width / 2, y: HUB.y }} to={B_RIM} tone="mist" strands={5} spread={0.05} opacity={0.35} seed={2} />
      <MiniLedger id={id} tone="mist" x={A.x} y={A.y} r={RADIUS} seed={3} />
      <MiniLedger id={id} tone="mist" x={B.x} y={B.y} r={RADIUS} seed={4} />

      <rect
        x={HUB.x - HUB.width / 2}
        y={HUB.y - HUB.height / 2}
        width={HUB.width}
        height={HUB.height}
        rx={18}
        fill="#0b0a13"
        fillOpacity={0.75}
        stroke="#fff"
        strokeOpacity={0.35}
        strokeDasharray="4 4"
      />
      <text x={HUB.x} y={HUB.y - 20} textAnchor="middle" className="fill-white/75 text-[14px] max-sm:text-[19px]">
        {diagrams.bridge.middle}
      </text>
      {validators.map((point, k) => (
        <Pulse key={k} x={point.x} y={point.y} motion="prop-bead" delay={k * 0.4}>
          <Star id={id} tone="mist" r={9} />
        </Pulse>
      ))}
      <Pulse x={HUB.x} y={HUB.y} motion="prop-ring" delay={1} rest={0}>
        <circle r={64} stroke={TONES.mist} strokeOpacity={0.7} strokeWidth={1.2} />
      </Pulse>
      <Mover path={ACROSS} motion="prop-pass" at={30}>
        <Star id={id} tone="mist" r={11} />
      </Mover>
      <Caption>{diagrams.bridge.middleNote}</Caption>
    </Art>
  );
}

export function ClprArt() {
  const id = "clpr-trust";
  const verifier = { x: B.x - 16, y: B.y + 24 };
  return (
    <Art id={id}>
      <LaneGradient id={`${id}-lane`} x1={A_RIM.x} x2={B_RIM.x} />
      <Bundle from={A_RIM} to={B_RIM} stroke={`url(#${id}-lane)`} strands={9} spread={0.05} opacity={0.6} seed={5} />
      <MiniLedger id={id} tone="violet" x={A.x} y={A.y} r={RADIUS} seed={7} />
      <MiniLedger id={id} tone="pink" x={B.x} y={B.y} r={RADIUS} seed={9} />
      <Endpoint x={A_RIM.x} y={A_RIM.y} tone="violet" />
      <Endpoint x={B_RIM.x} y={B_RIM.y} tone="pink" />
      <path
        d={`M${verifier.x} ${verifier.y - 7}L${verifier.x + 7} ${verifier.y}L${verifier.x} ${verifier.y + 7}L${verifier.x - 7} ${verifier.y}Z`}
        fill="#0b0a13"
        stroke={TONES.pink}
        strokeWidth={1.3}
      />
      <Pulse x={verifier.x} y={verifier.y} motion="prop-ring" delay={2.02} rest={0}>
        <circle r={16} stroke={TONES.pink} strokeWidth={1.4} />
      </Pulse>
      <Pulse x={B.x} y={B.y} motion="prop-ring" delay={2.1} rest={0}>
        <circle r={54} stroke={TONES.pink} strokeOpacity={0.7} strokeWidth={1.2} />
      </Pulse>
      <Mover path={ACROSS} motion="prop-message" at={55}>
        <Star id={id} tone="violet" r={11} />
        <circle r={11} stroke={TONES.pink} strokeWidth={1.3} />
      </Mover>
      <Caption className="fill-proof-ink/75">{diagrams.clpr.proof}</Caption>
    </Art>
  );
}
