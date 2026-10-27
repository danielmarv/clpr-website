import type { ReactNode } from "react";

import { Bundle, Endpoint, fibre, Glows, LaneGradient, MiniLedger, Mover, Pulse, Star, TONES } from "@/components/fibreSvg";
import type { Term } from "@/lib/glossary";

/*
 * The glossary in the site's visual language: a small icon per term (the same
 * star, hexagon, diamond, proof ring and coin the illustrations use) and a
 * small looping diagram for each definition. Pure SVG; the motion is the
 * `prop-*` CSS of globals.css and only runs without reduced motion.
 */

type Name = Term["term"];

/* ------------------------------------------------------------------------ */
/* Icons                                                                      */
/* ------------------------------------------------------------------------ */

const ICONS: Record<Name, ReactNode> = {
  "Peer Ledger": (
    <>
      <circle cx={-3} r={4} stroke={TONES.violet} strokeWidth={1.3} />
      <circle cx={3} r={4} stroke={TONES.pink} strokeWidth={1.3} />
    </>
  ),
  "State Proof": (
    <>
      <circle r={2.4} fill={TONES.violet} />
      <circle r={5.5} stroke={TONES.pink} strokeWidth={1.3} />
    </>
  ),
  "CLPR Endpoint": <path d="M0 -6.5L5.6 -3.25V3.25L0 6.5L-5.6 3.25V-3.25Z" stroke={TONES.violet} strokeWidth={1.4} />,
  "CLPR Service": (
    <>
      <circle r={2.6} fill={TONES.violet} />
      <path d="M-7 0L0 -0.6L7 0L0 0.6ZM0 -7L0.6 0L0 7L-0.6 0Z" fill="#fff" fillOpacity={0.75} />
    </>
  ),
  Channel: (
    <>
      <path d="M-4.5 0H4.5" stroke={TONES.mist} strokeWidth={1.2} />
      <circle cx={-5.5} r={2} fill={TONES.violet} />
      <circle cx={5.5} r={2} fill={TONES.pink} />
    </>
  ),
  Connector: (
    <>
      <circle r={5.5} stroke={TONES.warm} strokeWidth={1.4} />
      <circle r={2} fill={TONES.warm} />
    </>
  ),
  Message: <circle r={3} fill={TONES.violet} />,
  Bundle: (
    <>
      <rect x={-7} y={-3.5} width={14} height={7} rx={3.5} stroke={TONES.pink} strokeWidth={1.1} strokeDasharray="2 1.5" />
      <circle cx={-3.2} r={1.3} fill={TONES.violet} />
      <circle r={1.3} fill={TONES.violet} />
      <circle cx={3.2} r={1.3} fill={TONES.violet} />
    </>
  ),
  "Data Message": (
    <>
      <circle cx={-2} r={3} fill={TONES.violet} />
      <path d="M2.5 -2.5L6 0L2.5 2.5" stroke={TONES.violet} strokeWidth={1.3} />
    </>
  ),
  "Response Message": (
    <>
      <circle cx={2} r={3} fill={TONES.warm} />
      <path d="M-2.5 -2.5L-6 0L-2.5 2.5" stroke={TONES.warm} strokeWidth={1.3} />
    </>
  ),
  "Control Message": (
    <>
      <circle r={2.2} fill={TONES.mist} />
      <circle r={5.5} stroke={TONES.mist} strokeWidth={1.1} strokeDasharray="1.6 1.6" />
    </>
  ),
  Configuration: <path d="M-6 -4H3M-6 0H6M-6 4H0" stroke={TONES.mist} strokeWidth={1.5} strokeLinecap="round" />,
  "Verifier Contract": <path d="M0 -6.5L6.5 0L0 6.5L-6.5 0Z" stroke={TONES.pink} strokeWidth={1.4} />,
  "Trust Anchor": (
    <>
      <circle cy={-1.5} r={4} stroke={TONES.warm} strokeWidth={1.4} />
      <path d="M0 2.5V6.5" stroke={TONES.warm} strokeWidth={1.4} strokeLinecap="round" />
    </>
  ),
};

/** The icon's shapes alone, centered on 0,0 in a 16-unit box, for drawing inside another SVG. */
export function TermShape({ term }: { term: Name }) {
  return <g>{ICONS[term]}</g>;
}

export function TermIcon({ term, className }: { term: Name; className?: string }) {
  return (
    <svg viewBox="-8 -8 16 16" fill="none" aria-hidden="true" className={className ?? "size-4 shrink-0"}>
      {ICONS[term]}
    </svg>
  );
}

/* ------------------------------------------------------------------------ */
/* Diagrams                                                                   */
/* ------------------------------------------------------------------------ */

const WIDTH = 240;
const HEIGHT = 120;
const LEFT = { x: 36, y: 60 };
const RIGHT = { x: 204, y: 60 };

function Art({ id, children }: { id: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} fill="none" aria-hidden="true" className="size-full overflow-visible">
      <Glows id={id} />
      <LaneGradient id={`${id}-lane`} x1={LEFT.x} x2={RIGHT.x} />
      {children}
    </svg>
  );
}

/** Two Endpoints with a Channel between them, the frame most diagrams share. */
function Lane({ id, strands = 8 }: { id: string; strands?: number }) {
  return (
    <>
      <Bundle from={{ x: LEFT.x + 10, y: LEFT.y }} to={{ x: RIGHT.x - 10, y: RIGHT.y }} stroke={`url(#${id}-lane)`} strands={strands} spread={0.04} opacity={0.55} seed={3} />
      <Endpoint x={LEFT.x} y={LEFT.y} tone="violet" />
      <Endpoint x={RIGHT.x} y={RIGHT.y} tone="pink" />
    </>
  );
}

const across = fibre({ x: LEFT.x + 10, y: LEFT.y }, { x: RIGHT.x - 10, y: RIGHT.y }, 0);
const back = fibre({ x: RIGHT.x - 10, y: RIGHT.y + 3 }, { x: LEFT.x + 10, y: LEFT.y + 3 }, 0);

function BundleOfThree({ id }: { id: string }) {
  return (
    <>
      <rect x={-26} y={-13} width={52} height={26} rx={13} fill="#0b0a13" fillOpacity={0.6} stroke={TONES.pink} strokeWidth={1.3} strokeDasharray="3 3" />
      {[-13, 0, 13].map((x) => (
        <Star key={x} id={id} tone="violet" r={8} x={x} />
      ))}
    </>
  );
}

function Diamond({ x, y }: { x: number; y: number }) {
  return <path d={`M${x} ${y - 12}L${x + 12} ${y}L${x} ${y + 12}L${x - 12} ${y}Z`} fill="#0b0a13" stroke={TONES.pink} strokeWidth={1.4} />;
}

function Exchange({ id, respond }: { id: string; respond: boolean }) {
  const out = { from: { x: 62, y: 54 }, to: { x: 178, y: 54 }, bow: -0.3 };
  const ret = { from: { x: 178, y: 66 }, to: { x: 62, y: 66 }, bow: -0.3 };
  return (
    <Art id={id}>
      <Bundle {...out} strands={5} spread={0.05} opacity={respond ? 0.3 : 0.55} seed={4} />
      <Bundle {...ret} tone="warm" strands={5} spread={0.05} opacity={respond ? 0.55 : 0.3} seed={5} />
      <MiniLedger id={id} tone="violet" x={38} y={60} r={24} seed={6} />
      <MiniLedger id={id} tone="pink" x={202} y={60} r={24} seed={7} />
      <Mover path={fibre(out.from, out.to, out.bow)} motion="prop-message" at={55}>
        <Star id={id} tone={respond ? "mist" : "violet"} r={respond ? 8 : 11} />
      </Mover>
      <Mover path={fibre(ret.from, ret.to, ret.bow)} motion="prop-response" at={35}>
        <Star id={id} tone="warm" r={respond ? 11 : 8} />
      </Mover>
    </Art>
  );
}

const ART: Record<Name, (props: { id: string }) => ReactNode> = {
  "Peer Ledger": ({ id }) => (
    <Art id={id}>
      <Bundle from={{ x: 66, y: 60 }} to={{ x: 174, y: 60 }} stroke={`url(#${id}-lane)`} strands={8} spread={0.05} opacity={0.5} seed={1} />
      <MiniLedger id={id} tone="violet" x={40} y={60} r={28} seed={2} />
      <MiniLedger id={id} tone="pink" x={200} y={60} r={28} seed={3} />
      <Mover path={fibre({ x: 68, y: 60 }, { x: 172, y: 60 }, 0)} motion="prop-pass" at={50}>
        <Star id={id} tone="violet" r={9} />
      </Mover>
    </Art>
  ),
  "State Proof": ({ id }) => (
    <Art id={id}>
      <Bundle from={{ x: 30, y: 60 }} to={{ x: 186, y: 60 }} strands={6} spread={0.04} seed={2} />
      <Diamond x={200} y={60} />
      <Pulse x={200} y={60} motion="prop-ring" delay={2.02} rest={0}>
        <circle r={20} stroke={TONES.pink} strokeWidth={1.4} />
      </Pulse>
      <Mover path={fibre({ x: 30, y: 60 }, { x: 172, y: 60 }, 0)} motion="prop-message" at={50}>
        <BundleOfThree id={id} />
      </Mover>
    </Art>
  ),
  "CLPR Endpoint": ({ id }) => {
    const up = { from: { x: 50, y: 54 }, to: { x: 190, y: 54 }, bow: -0.22 };
    const down = { from: { x: 190, y: 66 }, to: { x: 50, y: 66 }, bow: -0.22 };
    return (
      <Art id={id}>
        <Bundle {...up} stroke={`url(#${id}-lane)`} strands={6} spread={0.04} opacity={0.55} seed={4} />
        <Bundle {...down} tone="warm" strands={5} spread={0.04} opacity={0.4} seed={5} />
        <Endpoint x={40} y={60} tone="violet" />
        <Endpoint x={200} y={60} tone="pink" />
        <Mover path={fibre(up.from, up.to, up.bow)} motion="prop-message" at={55}>
          <Star id={id} tone="violet" r={10} />
        </Mover>
        <Mover path={fibre(down.from, down.to, down.bow)} motion="prop-response" at={35}>
          <Star id={id} tone="warm" r={9} />
        </Mover>
      </Art>
    );
  },
  "CLPR Service": ({ id }) => {
    const service = { x: 104, y: 60 };
    const apps = [
      { x: 196, y: 26 },
      { x: 208, y: 60 },
      { x: 196, y: 94 },
    ];
    return (
      <Art id={id}>
        <Bundle from={{ x: 24, y: 60 }} to={{ x: service.x - 12, y: 60 }} strands={5} spread={0.04} seed={6} />
        {apps.map((app, k) => (
          <Bundle key={k} from={{ x: service.x + 12, y: 60 }} to={app} bow={(k - 1) * -0.06} strands={3} spread={0.05} opacity={0.4} seed={7 + k} />
        ))}
        <Star id={id} tone="violet" r={18} x={service.x} y={service.y} />
        {apps.map((app, k) => (
          <Star key={k} id={id} tone="pink" r={9} x={app.x} y={app.y} />
        ))}
        <Mover path={fibre({ x: 24, y: 60 }, service, 0)} motion="prop-relay" at={50}>
          <Star id={id} tone="violet" r={9} />
        </Mover>
        <Mover path={fibre({ x: service.x + 12, y: 60 }, apps[2], 0.06)} motion="prop-relay" at={60} delay={1.4}>
          <Star id={id} tone="violet" r={9} />
        </Mover>
      </Art>
    );
  },
  Channel: ({ id }) => (
    <Art id={id}>
      <Lane id={id} strands={10} />
      <Mover path={across} motion="prop-pass" at={35}>
        <Star id={id} tone="violet" r={9} />
      </Mover>
      <Mover path={back} motion="prop-pass" at={70} delay={2.4}>
        <Star id={id} tone="warm" r={8} />
      </Mover>
    </Art>
  ),
  Connector: ({ id }) => (
    <Art id={id}>
      <Lane id={id} />
      {/* The Connector pays as each message passes. */}
      <Pulse x={120} y={60} motion="prop-bead" delay={2.4}>
        <circle r={11} fill="#0b0a13" stroke={TONES.warm} strokeWidth={1.6} />
        <circle r={4} fill={TONES.warm} />
      </Pulse>
      <Mover path={across} motion="prop-pass" at={30}>
        <Star id={id} tone="violet" r={9} />
      </Mover>
    </Art>
  ),
  Message: ({ id }) => (
    <Art id={id}>
      <Bundle from={{ x: 24, y: 60 }} to={{ x: 216, y: 60 }} strands={6} spread={0.04} seed={8} />
      <Mover path={fibre({ x: 24, y: 60 }, { x: 216, y: 60 }, 0)} motion="prop-pass" at={50}>
        <Star id={id} tone="violet" r={12} />
      </Mover>
    </Art>
  ),
  Bundle: ({ id }) => (
    <Art id={id}>
      <Lane id={id} />
      <Mover path={across} motion="prop-pass" at={50} duration={6}>
        <BundleOfThree id={id} />
      </Mover>
    </Art>
  ),
  "Data Message": ({ id }) => <Exchange id={id} respond={false} />,
  "Response Message": ({ id }) => <Exchange id={id} respond />,
  "Control Message": ({ id }) => (
    <Art id={id}>
      <Lane id={id} />
      <Pulse x={RIGHT.x} y={RIGHT.y} motion="prop-ring" delay={4.5} rest={0}>
        <circle r={18} stroke={TONES.mist} strokeWidth={1.3} />
      </Pulse>
      <Mover path={across} motion="prop-pass" at={50}>
        <circle r={4} fill={TONES.mist} />
        <circle r={10} stroke={TONES.mist} strokeWidth={1.2} strokeDasharray="2.5 2.5" />
      </Mover>
    </Art>
  ),
  Configuration: ({ id }) => (
    <Art id={id}>
      <Bundle from={{ x: 60, y: 60 }} to={{ x: RIGHT.x - 10, y: 60 }} strands={5} spread={0.04} opacity={0.4} seed={9} />
      <Star id={id} tone="violet" r={16} x={44} y={60} />
      <Endpoint x={RIGHT.x} y={RIGHT.y} tone="pink" />
      {/* ChainID, protocol version and throttle parameters, published to the peer. */}
      <Mover path={fibre({ x: 60, y: 60 }, { x: RIGHT.x - 10, y: 60 }, 0)} motion="prop-pass" at={50}>
        <path d="M-9 -6H5M-9 0H9M-9 6H1" stroke={TONES.mist} strokeWidth={2} strokeLinecap="round" />
      </Mover>
    </Art>
  ),
  "Verifier Contract": ({ id }) => (
    <Art id={id}>
      <Bundle from={{ x: 24, y: 60 }} to={{ x: 108, y: 60 }} strands={5} spread={0.04} seed={10} />
      <Bundle from={{ x: 132, y: 60 }} to={{ x: 216, y: 60 }} tone="pink" strands={5} spread={0.04} seed={11} />
      <Diamond x={120} y={60} />
      <Pulse x={120} y={60} motion="prop-ring" delay={2.02} rest={0}>
        <circle r={20} stroke={TONES.pink} strokeWidth={1.4} />
      </Pulse>
      <Mover path={fibre({ x: 24, y: 60 }, { x: 108, y: 60 }, 0)} motion="prop-message" at={60}>
        <Star id={id} tone="violet" r={9} />
        <circle r={9} stroke={TONES.pink} strokeWidth={1.2} />
      </Mover>
      {/* Decoded into the local data format. */}
      <Mover path={fibre({ x: 132, y: 60 }, { x: 216, y: 60 }, 0)} motion="prop-response" at={50}>
        <rect x={-5} y={-5} width={10} height={10} rx={2} fill={TONES.pink} />
      </Mover>
    </Art>
  ),
  "Trust Anchor": ({ id }) => (
    <Art id={id}>
      <Bundle from={{ x: 24, y: 76 }} to={{ x: 108, y: 76 }} strands={5} spread={0.04} seed={12} />
      <Bundle from={{ x: 120, y: 34 }} to={{ x: 120, y: 64 }} tone="warm" strands={4} spread={0.1} opacity={0.5} seed={13} />
      <Diamond x={120} y={76} />
      <Pulse x={120} y={24} motion="prop-bead" delay={2.02}>
        <circle r={10} fill="#0b0a13" stroke={TONES.warm} strokeWidth={1.6} />
        <circle r={3.5} fill={TONES.warm} />
      </Pulse>
      <Pulse x={120} y={76} motion="prop-ring" delay={2.02} rest={0}>
        <circle r={20} stroke={TONES.pink} strokeWidth={1.4} />
      </Pulse>
      <Mover path={fibre({ x: 24, y: 76 }, { x: 108, y: 76 }, 0)} motion="prop-message" at={60}>
        <Star id={id} tone="violet" r={9} />
        <circle r={9} stroke={TONES.pink} strokeWidth={1.2} />
      </Mover>
    </Art>
  ),
};

/** `variant` keeps the gradient ids unique when a term is drawn twice (the phone and desktop layouts). */
export function TermArt({ term, variant }: { term: Name; variant: string }) {
  const Diagram = ART[term];
  return <Diagram id={`term-${variant}-${term.toLowerCase().replace(/\s+/g, "-")}`} />;
}
