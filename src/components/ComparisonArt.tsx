import type { ReactNode } from "react";

import { Bundle, Endpoint, fibre, Glows, LaneGradient, MiniLedger, Mover, Pulse, Star, TONES } from "@/components/fibreSvg";
import { comparison } from "@/content/site";
import { cn } from "@/lib/utils";

// Both sides of each pair run on the same clock, so the difference reads at a glance.

type Visual = (typeof comparison.rows)[number]["visual"];

const WIDTH = 520;
const HEIGHT = 200;
const A = { x: 62, y: 92 };
const B = { x: 458, y: 92 };
const RADIUS = 46;
const A_RIM = { x: A.x + RADIUS, y: A.y };
const B_RIM = { x: B.x - RADIUS, y: B.y };
const HUB = { x: 260, y: 92, width: 104, height: 88 };
const ACROSS = `M${A_RIM.x} ${A_RIM.y}L${B_RIM.x} ${B_RIM.y}`;
const RED = "#ff6b5e";

const { diagrams } = comparison;
const labels = diagrams.labels;

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

function Coin() {
  return (
    <g>
      <circle r={6.5} fill="#0b0a13" stroke={TONES.mist} strokeOpacity={0.8} strokeWidth={1.4} />
      <circle r={2.4} fill={TONES.mist} fillOpacity={0.7} />
    </g>
  );
}

export function BridgeArt({ visual }: { visual: Visual }) {
  const id = `bridge-${visual}`;
  const offline = visual === "offline";
  const validators = [
    { x: HUB.x - 16, y: HUB.y + 4 },
    { x: HUB.x + 16, y: HUB.y + 4 },
    { x: HUB.x - 16, y: HUB.y + 24 },
    { x: HUB.x + 16, y: HUB.y + 24 },
  ];
  return (
    <Art id={id}>
      <Bundle from={A_RIM} to={{ x: HUB.x - HUB.width / 2, y: HUB.y }} tone="mist" strands={5} spread={0.05} opacity={0.35} seed={1} />
      <Bundle
        from={{ x: HUB.x + HUB.width / 2, y: HUB.y }}
        to={B_RIM}
        tone="mist"
        strands={5}
        spread={0.05}
        opacity={offline ? 0.1 : 0.35}
        seed={2}
      />
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
        strokeOpacity={offline ? 0.16 : 0.35}
        strokeDasharray="4 4"
      />
      <text x={HUB.x} y={HUB.y - 20} textAnchor="middle" className={cn("text-[14px] max-sm:text-[19px]", offline ? "fill-white/30" : "fill-white/75")}>
        {diagrams.bridge.middle}
      </text>
      {visual !== "custody" &&
        validators.map((point, k) =>
          visual === "trust" ? (
            <Pulse key={k} x={point.x} y={point.y} motion="prop-bead" delay={k * 0.4}>
              <Star id={id} tone="mist" r={9} />
            </Pulse>
          ) : (
            <circle key={k} cx={point.x} cy={point.y} r={3} fill={TONES.mist} fillOpacity={offline ? 0.15 : 0.45} />
          ),
        )}

      {visual === "trust" && (
        <>
          <Pulse x={HUB.x} y={HUB.y} motion="prop-ring" delay={1} rest={0}>
            <circle r={64} stroke={TONES.mist} strokeOpacity={0.7} strokeWidth={1.2} />
          </Pulse>
          <Mover path={ACROSS} motion="prop-pass" at={30}>
            <Star id={id} tone="mist" r={11} />
          </Mover>
          <Caption>{diagrams.bridge.middleNote}</Caption>
        </>
      )}

      {visual === "custody" && (
        <>
          {[-24, -8, 8, 24, -16, 0, 16].map((dx, k) => (
            <g key={k} transform={`translate(${HUB.x + dx} ${HUB.y + (k < 4 ? 26 : 12)})`}>
              <Coin />
            </g>
          ))}
          <Pulse x={HUB.x} y={HUB.y} motion="prop-ring" delay={2} rest={0}>
            <circle r={66} stroke={RED} strokeOpacity={0.8} strokeWidth={1.4} />
          </Pulse>
          <Mover path={`M${A_RIM.x} ${A_RIM.y}L${HUB.x} ${HUB.y}`} motion="prop-message" at={60}>
            <Coin />
          </Mover>
          <Caption className="fill-[#ff8a7f]/80">{labels.pooled}</Caption>
        </>
      )}

      {offline && (
        <>
          <Mover path={`M${A_RIM.x} ${A_RIM.y}L${HUB.x - HUB.width / 2 - 8} ${HUB.y}`} motion="prop-relay" at={100} duration={3.2}>
            <Star id={id} tone="mist" r={10} />
          </Mover>
          <Caption>{labels.operatorOffline}</Caption>
        </>
      )}

      {visual === "speed" && (
        <>
          <g transform={`translate(${HUB.x} ${HUB.y + 12})`}>
            <circle className="prop-spin" r={18} stroke="#fff" strokeOpacity={0.4} strokeDasharray="3 4" />
          </g>
          <Pulse x={B.x} y={B.y} motion="prop-ring" duration={6} delay={4.8} rest={0}>
            <circle r={54} stroke={TONES.mist} strokeOpacity={0.8} strokeWidth={1.2} />
          </Pulse>
          <Mover path={ACROSS} motion="prop-wait" at={50} duration={6}>
            <Star id={id} tone="mist" r={11} />
          </Mover>
          <Caption>{labels.waiting}</Caption>
        </>
      )}

      {visual === "payload" && (
        <>
          {[0, 1, 2].map((k) => (
            <Mover key={k} path={ACROSS} motion="prop-pass" at={20 + k * 30} delay={k * 1.6}>
              <Coin />
            </Mover>
          ))}
          <Caption>{labels.tokens}</Caption>
        </>
      )}
    </Art>
  );
}

export function ClprArt({ visual }: { visual: Visual }) {
  const id = `clpr-${visual}`;
  const offline = visual === "offline";
  const verifier = { x: B.x - 16, y: B.y + 24 };
  const anyone = { x: 200, y: 156 };
  return (
    <Art id={id}>
      <LaneGradient id={`${id}-lane`} x1={A_RIM.x} x2={B_RIM.x} />
      <Bundle from={A_RIM} to={B_RIM} stroke={`url(#${id}-lane)`} strands={9} spread={0.05} opacity={0.6} seed={5} />
      <MiniLedger id={id} tone="violet" x={A.x} y={A.y} r={RADIUS} seed={7} />
      <MiniLedger id={id} tone="pink" x={B.x} y={B.y} r={RADIUS} seed={9} />
      <Endpoint x={A_RIM.x} y={A_RIM.y} tone="violet" offline={offline} />
      <Endpoint x={B_RIM.x} y={B_RIM.y} tone="pink" />
      <path
        d={`M${verifier.x} ${verifier.y - 7}L${verifier.x + 7} ${verifier.y}L${verifier.x} ${verifier.y + 7}L${verifier.x - 7} ${verifier.y}Z`}
        fill="#0b0a13"
        stroke={TONES.pink}
        strokeWidth={1.3}
      />

      {visual === "trust" && (
        <>
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
        </>
      )}

      {visual === "custody" && (
        <>
          {[0, 1].map((k) => (
            <Mover key={k} path={ACROSS} motion="prop-pass" at={30 + k * 45} delay={k * 2.4}>
              <Star id={id} tone="violet" r={11} />
            </Mover>
          ))}
          <Caption className="fill-white/70">{labels.nothingHeld}</Caption>
        </>
      )}

      {offline && (
        <>
          <text x={A_RIM.x + 14} y={A.y - RADIUS + 4} className="fill-white/45 text-[14px] max-sm:text-[19px]">
            {labels.endpointOffline}
          </text>
          <Bundle from={anyone} to={B_RIM} bow={-0.12} strands={4} spread={0.05} opacity={0.4} seed={11} />
          <Pulse x={anyone.x} y={anyone.y} motion="prop-bead">
            <Star id={id} tone="mist" r={10} />
          </Pulse>
          <Pulse x={B.x} y={B.y} motion="prop-ring" delay={2.02} rest={0}>
            <circle r={54} stroke={TONES.pink} strokeOpacity={0.7} strokeWidth={1.2} />
          </Pulse>
          <Mover path={fibre(anyone, B_RIM, -0.12)} motion="prop-message" at={55}>
            <Star id={id} tone="violet" r={11} />
            <circle r={11} stroke={TONES.pink} strokeWidth={1.3} />
          </Mover>
          <text x={anyone.x} y={anyone.y + 30} textAnchor="middle" className="fill-white/55 text-[14px] max-sm:text-[19px]">
            {labels.anyone}
          </text>
        </>
      )}

      {visual === "speed" && (
        <>
          <Pulse x={B.x} y={B.y} motion="prop-ring" duration={6} delay={2.28} rest={0}>
            <circle r={54} stroke={TONES.pink} strokeOpacity={0.8} strokeWidth={1.2} />
          </Pulse>
          <Mover path={ACROSS} motion="prop-clpr" at={100} duration={6}>
            <Star id={id} tone="violet" r={11} />
          </Mover>
          <Caption className="fill-white/70">{labels.direct}</Caption>
        </>
      )}

      {visual === "payload" && (
        <>
          {[
            <rect key="data" x={-5} y={-5} width={10} height={10} rx={2} fill={TONES.violet} />,
            <circle key="feed" r={5.5} stroke={TONES.mist} strokeWidth={1.6} />,
            <path key="call" d="M0 -7L7 0L0 7L-7 0Z" fill={TONES.pink} />,
            <path key="bytes" d="M-6 -4h12M-6 0h12M-6 4h8" stroke={TONES.warm} strokeWidth={1.6} strokeLinecap="round" />,
          ].map((payload, k) => (
            <Mover key={k} path={ACROSS} motion="prop-pass" at={18 + k * 22} duration={6.4} delay={k * 1.6}>
              <circle r={12} fill={`url(#${id}-mist)`} opacity={0.45} />
              {payload}
            </Mover>
          ))}
          <Caption className="fill-white/70">{labels.anyPayload}</Caption>
        </>
      )}
    </Art>
  );
}
