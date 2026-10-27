import type { ReactNode } from "react";

import { Bundle, Endpoint, fibre, Glows, LaneGradient, Mover, Pulse, Star, TONES } from "@/components/fibreSvg";
import { extensibility } from "@/content/site";

/*
 * Small looping diagrams for the three components a new ledger type needs
 * (Chain-agnostic): the CLPR Service with its ordered queue routing to
 * applications, two Endpoints syncing bundles and trust-anchor updates, and a
 * Verifier Contract checking a state proof against its trust anchor before it
 * hands the bundle on in the local format. Same fibre language and `prop-*`
 * motion as PropertyArt; decorative, the text carries the meaning.
 */

const WIDTH = 320;
const HEIGHT = 168;
const labels = extensibility.art;

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
    <text x={x} y={y} textAnchor={anchor} className="fill-white/45 text-[12px]">
      {children}
    </text>
  );
}

/** The Service takes messages from its ordered queue and routes each to its application. */
function ServiceArt() {
  const id = "component-service";
  const service = { x: 132, y: 84 };
  const queue = { x: 22, y: 84 };
  const apps = [
    { x: 268, y: 40 },
    { x: 282, y: 84 },
    { x: 268, y: 128 },
  ];
  return (
    <Art id={id}>
      <Bundle from={queue} to={{ x: service.x - 14, y: service.y }} strands={6} spread={0.04} seed={1} />
      {apps.map((app, k) => (
        <Bundle key={k} from={{ x: service.x + 14, y: service.y }} to={app} bow={(k - 1) * -0.06} strands={4} spread={0.05} opacity={0.4} seed={2 + k} />
      ))}
      <Star id={id} tone="violet" r={22} x={service.x} y={service.y} />
      {apps.map((app, k) => (
        <Pulse key={k} x={app.x} y={app.y} motion="prop-bead" delay={1.9 + k * 1.6}>
          <Star id={id} tone="pink" r={12} />
        </Pulse>
      ))}
      {/* One message after the other: in from the queue, out to its application. */}
      {[0, 1, 2].map((k) => (
        <Mover key={`in-${k}`} path={fibre(queue, service, 0)} motion="prop-relay" at={35 + k * 25} delay={k * 1.6}>
          <Star id={id} tone="violet" r={10} />
        </Mover>
      ))}
      {apps.map((app, k) => (
        <Mover
          key={`out-${k}`}
          path={fibre({ x: service.x + 14, y: service.y }, app, (k - 1) * -0.06)}
          motion="prop-relay"
          at={60}
          delay={0.55 + k * 1.6}
          hidden={k !== 1}
        >
          <Star id={id} tone="violet" r={10} />
        </Mover>
      ))}
      <Label x={queue.x} y={60} anchor="start">
        {labels.queue}
      </Label>
      <Label x={282} y={160} anchor="end">
        {labels.applications}
      </Label>
    </Art>
  );
}

/** Endpoints sync bundles to their peer, and keep the peer's view of their trust anchor current. */
function EndpointsArt() {
  const id = "component-endpoints";
  const a = { x: 50, y: 84 };
  const b = { x: 270, y: 84 };
  const upper = { from: { x: a.x + 10, y: a.y - 4 }, to: { x: b.x - 10, y: b.y - 4 }, bow: -0.16 };
  const lower = { from: { x: b.x - 10, y: b.y + 4 }, to: { x: a.x + 10, y: a.y + 4 }, bow: -0.16 };
  return (
    <Art id={id}>
      <LaneGradient id={`${id}-lane`} x1={a.x} x2={b.x} />
      <Bundle {...upper} stroke={`url(#${id}-lane)`} strands={6} spread={0.04} opacity={0.55} seed={4} />
      <Bundle {...lower} tone="warm" strands={5} spread={0.04} opacity={0.4} seed={5} />
      <Endpoint x={a.x} y={a.y} tone="violet" />
      <Endpoint x={b.x} y={b.y} tone="pink" />
      <Mover path={fibre(upper.from, upper.to, upper.bow)} motion="prop-message" at={55}>
        <Star id={id} tone="violet" r={11} />
        <circle r={10} stroke={TONES.pink} strokeWidth={1.2} />
      </Mover>
      <Mover path={fibre(lower.from, lower.to, lower.bow)} motion="prop-response" at={35}>
        <rect x={-5} y={-5} width={10} height={10} rx={2} transform="rotate(45)" fill="#0b0a13" stroke={TONES.warm} strokeWidth={1.4} />
      </Mover>
      <Label x={160} y={30}>{labels.bundles}</Label>
      <Label x={160} y={148}>{labels.anchor}</Label>
    </Art>
  );
}

/** The Verifier checks the proof against its trust anchor, then hands the bundle on in the local format. */
function VerifierArt() {
  const id = "component-verifier";
  const verifier = { x: 160, y: 96 };
  const anchor = { x: 160, y: 34 };
  const inbound = { from: { x: 24, y: 96 }, to: { x: verifier.x - 14, y: verifier.y } };
  const outbound = { from: { x: verifier.x + 14, y: verifier.y }, to: { x: 296, y: 96 } };
  return (
    <Art id={id}>
      <Bundle {...inbound} strands={6} spread={0.04} seed={7} />
      <Bundle {...outbound} tone="pink" strands={6} spread={0.04} seed={8} />
      <Bundle from={{ x: anchor.x, y: anchor.y + 10 }} to={{ x: verifier.x, y: verifier.y - 14 }} tone="warm" strands={4} spread={0.08} opacity={0.4} seed={9} />
      <path
        d={`M${verifier.x} ${verifier.y - 14}L${verifier.x + 14} ${verifier.y}L${verifier.x} ${verifier.y + 14}L${verifier.x - 14} ${verifier.y}Z`}
        fill="#0b0a13"
        stroke={TONES.pink}
        strokeWidth={1.4}
      />
      <g transform={`translate(${anchor.x} ${anchor.y})`}>
        <circle r={8} fill="#0b0a13" stroke={TONES.warm} strokeWidth={1.4} />
        <circle r={2.5} fill={TONES.warm} />
      </g>
      <Pulse x={verifier.x} y={verifier.y} motion="prop-ring" delay={2.02} rest={0}>
        <circle r={22} stroke={TONES.pink} strokeWidth={1.4} />
      </Pulse>
      <Mover path={fibre(inbound.from, inbound.to, 0)} motion="prop-message" at={60}>
        <Star id={id} tone="violet" r={11} />
        <circle r={10} stroke={TONES.pink} strokeWidth={1.2} />
      </Mover>
      <Mover path={fibre(outbound.from, outbound.to, 0)} motion="prop-response" at={55}>
        <rect x={-5} y={-5} width={10} height={10} rx={2} fill={TONES.pink} />
      </Mover>
      <Label x={24} y={128} anchor="start">
        {labels.proof}
      </Label>
      <Label x={anchor.x + 16} y={anchor.y + 4} anchor="start">
        {labels.trustAnchor}
      </Label>
      <Label x={296} y={128} anchor="end">
        {labels.local}
      </Label>
    </Art>
  );
}

/** One diagram per component, in the order of `extensibility.components`. */
export const COMPONENT_ART = [ServiceArt, EndpointsArt, VerifierArt];
