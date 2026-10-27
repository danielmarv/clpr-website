import type { ReactNode } from "react";

import { Bundle, Endpoint, fibre, Glows, LaneGradient, Mover, Pulse, Star, TONES } from "@/components/fibreSvg";

// What lives on each plate of the architecture stack, drawn flat so it tilts with the plate.

const WIDTH = 280;
const HEIGHT = 200;

function Plate({ id, children }: { id: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} fill="none" aria-hidden="true" className="size-full">
      <Glows id={id} />
      {children}
    </svg>
  );
}

function ApplicationPlate() {
  const id = "layer-application";
  const a = { x: 70, y: 96 };
  const b = { x: 210, y: 96 };
  const out = { from: { x: a.x + 12, y: a.y - 6 }, to: { x: b.x - 12, y: b.y - 6 }, bow: -0.28 };
  const back = { from: { x: b.x - 12, y: b.y + 6 }, to: { x: a.x + 12, y: a.y + 6 }, bow: -0.28 };
  return (
    <Plate id={id}>
      <Bundle {...out} strands={5} spread={0.04} seed={1} />
      <Bundle {...back} tone="warm" strands={5} spread={0.04} opacity={0.4} seed={2} />
      <Star id={id} tone="violet" r={20} x={a.x} y={a.y} />
      <Star id={id} tone="pink" r={20} x={b.x} y={b.y} />
      <Mover path={fibre(out.from, out.to, out.bow)} motion="prop-message" at={55}>
        <Star id={id} tone="mist" r={10} />
      </Mover>
      <Mover path={fibre(back.from, back.to, back.bow)} motion="prop-response" at={30}>
        <Star id={id} tone="warm" r={9} />
      </Mover>
    </Plate>
  );
}

function RoutingPlate() {
  const id = "layer-routing";
  const connector = { x: 44, y: 100 };
  const service = { x: 128, y: 100 };
  const apps = [
    { x: 226, y: 52 },
    { x: 240, y: 100 },
    { x: 226, y: 148 },
  ];
  return (
    <Plate id={id}>
      <Bundle from={{ x: connector.x + 10, y: connector.y }} to={{ x: service.x - 12, y: service.y }} tone="warm" strands={4} spread={0.05} opacity={0.45} seed={3} />
      {apps.map((app, k) => (
        <Bundle key={k} from={{ x: service.x + 12, y: service.y }} to={app} bow={(k - 1) * -0.06} strands={4} spread={0.05} opacity={0.4} seed={4 + k} />
      ))}
      <g transform={`translate(${connector.x} ${connector.y})`}>
        <circle r={10} fill="#0b0a13" stroke={TONES.warm} strokeWidth={1.6} />
        <circle r={3.5} fill={TONES.warm} />
      </g>
      <Star id={id} tone="violet" r={18} x={service.x} y={service.y} />
      {apps.map((app, k) => (
        <Star key={k} id={id} tone="pink" r={10} x={app.x} y={app.y} />
      ))}
      <Mover path={fibre({ x: service.x + 12, y: service.y }, apps[0], 0.06)} motion="prop-relay" at={60}>
        <Star id={id} tone="mist" r={9} />
      </Mover>
    </Plate>
  );
}

function MessagingPlate() {
  const id = "layer-messaging";
  const beads = Array.from({ length: 5 }, (_, k) => ({ x: 44 + k * 48, y: 100 }));
  return (
    <Plate id={id}>
      {beads.slice(1).map((bead, k) => (
        <Bundle key={k} from={{ x: beads[k].x + 9, y: bead.y }} to={{ x: bead.x - 9, y: bead.y }} strands={5} spread={0.12} bow={k % 2 ? 0.06 : -0.06} seed={10 + k} />
      ))}
      {beads.map((bead, k) => (
        <Pulse key={k} x={bead.x} y={bead.y} motion="prop-bead" delay={k * 0.4}>
          <Star id={id} tone="violet" r={13} />
        </Pulse>
      ))}
      <rect x={beads[1].x - 20} y={72} width={beads[3].x - beads[1].x + 40} height={56} rx={28} stroke={TONES.pink} strokeWidth={1.4} strokeDasharray="4 4" />
    </Plate>
  );
}

function NetworkPlate() {
  const id = "layer-network";
  const a = { x: 52, y: 100 };
  const b = { x: 200, y: 100 };
  const verifier = { x: 246, y: 140 };
  const anchor = { x: 246, y: 56 };
  return (
    <Plate id={id}>
      <LaneGradient id={`${id}-lane`} x1={a.x} x2={b.x} />
      <Bundle from={a} to={b} stroke={`url(#${id}-lane)`} strands={7} spread={0.06} opacity={0.6} seed={20} />
      <Bundle from={b} to={verifier} tone="pink" strands={3} spread={0.08} opacity={0.4} seed={21} />
      <Bundle from={anchor} to={verifier} tone="warm" strands={3} spread={0.08} opacity={0.4} seed={22} />
      <Endpoint x={a.x} y={a.y} tone="violet" />
      <Endpoint x={b.x} y={b.y} tone="pink" />
      <path
        d={`M${verifier.x} ${verifier.y - 10}L${verifier.x + 10} ${verifier.y}L${verifier.x} ${verifier.y + 10}L${verifier.x - 10} ${verifier.y}Z`}
        fill="#0b0a13"
        stroke={TONES.pink}
        strokeWidth={1.4}
      />
      <g transform={`translate(${anchor.x} ${anchor.y})`}>
        <circle r={8} fill="#0b0a13" stroke={TONES.warm} strokeWidth={1.4} />
        <circle r={2.5} fill={TONES.warm} />
      </g>
      <Mover path={fibre(a, b, 0)} motion="prop-pass" at={50}>
        <Star id={id} tone="violet" r={10} />
      </Mover>
    </Plate>
  );
}

/** One drawing per layer, in the order of `layers.items` (top to bottom). */
export const LAYER_ART = [ApplicationPlate, RoutingPlate, MessagingPlate, NetworkPlate];
