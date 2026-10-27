import type { ReactNode } from "react";

import { Bundle, Endpoint, fibre, Glows, LaneGradient, MiniLedger, Mover, Pulse, round, Star, timing, TONES } from "@/components/fibreSvg";
import { guarantees } from "@/content/site";

/*
 * Small looping diagrams for the protocol properties, in the fibre language of
 * the rest of the site: violet for messages in transit, magenta for proofs and
 * verification, warm for responses. Plain SVG rendered on the server; the
 * motion is CSS (globals.css, "Protocol properties") and only runs when the
 * visitor has not asked for reduced motion. Without it, every moving part rests
 * at a telling point of its path. Decorative: the text next to each diagram
 * carries the meaning.
 */

type Visual = (typeof guarantees.items)[number]["visual"];
const HEIGHT = 176;

function Art({ id, width, children }: { id: string; width: number; children: ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${width} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      aria-hidden="true"
      className="size-full overflow-visible"
    >
      <Glows id={id} />
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------------ */

/** A running-hash chain: each message is linked to the one before. A change shows in every hash after it. */
function OrderArt({ count }: { count: number }) {
  const id = `prop-order-${count}`;
  const beads = Array.from({ length: count }, (_, k) => ({ x: 70 + k * 104, y: 92 }));
  const hashes = ["9f3a", "41be", "c07e", "d2a9", "7b15", "e604"];
  const changed = count > 4 ? 2 : 1;
  const cycle = 9.6;
  const last = count - 1;
  // The light computing the hash reaches message k after k/last of 40% of the cycle.
  const reach = (k: number) => (k / last) * 0.4 * cycle;
  const tamper = { opacity: 0, ...timing(cycle, 0) };
  return (
    <Art id={id} width={beads[last].x + 70}>
      {beads.slice(1).map((bead, k) => (
        <Bundle
          key={k}
          from={{ x: beads[k].x + 12, y: bead.y }}
          to={{ x: bead.x - 12, y: bead.y }}
          strands={7}
          spread={0.14}
          bow={k % 2 ? 0.05 : -0.05}
          seed={11 + k}
        />
      ))}
      <g className="prop-fade prop-tamper" style={tamper}>
        {beads.slice(changed + 1).map((bead, k) => (
          <path
            key={k}
            d={`M${beads[changed + k].x + 12} ${bead.y}L${bead.x - 12} ${bead.y}`}
            stroke={TONES.pink}
            strokeWidth={1.2}
            strokeDasharray="3 4"
          />
        ))}
        <circle cx={beads[changed].x} cy={beads[changed].y} r={17} stroke={TONES.pink} strokeWidth={1.2} />
      </g>
      <Mover path={`M${beads[0].x} 92L${beads[last].x} 92`} motion="prop-pulse" at={0} duration={cycle} hidden>
        <Star id={id} tone="mist" r={24} />
      </Mover>
      {beads.map((bead, k) => (
        <g key={k}>
          <Pulse x={bead.x} y={bead.y} motion="prop-bead" duration={cycle} delay={reach(k)}>
            <Star id={id} tone="violet" r={15} />
          </Pulse>
          <text x={bead.x} y={60} textAnchor="middle" className="fill-white/70 font-mono text-[12px]">
            #{1041 + k}
          </text>
          <text
            x={bead.x}
            y={132}
            textAnchor="middle"
            className={`fill-signal-ink/70 font-mono text-[12px] ${k >= changed ? "prop-fade prop-untamper" : ""}`}
            style={k >= changed ? timing(cycle, 0) : undefined}
          >
            {hashes[k]}…
          </text>
          {k >= changed && (
            <text
              x={bead.x}
              y={132}
              textAnchor="middle"
              className={`prop-fade prop-tamper fill-proof-ink font-mono text-[12px] ${k > changed ? "line-through" : ""}`}
              style={tamper}
            >
              {k === changed ? "e71d" : hashes[k]}…
            </text>
          )}
        </g>
      ))}
    </Art>
  );
}

/** A message crosses to Ledger B; exactly one response comes back. */
function ResponseArt() {
  const id = "prop-response";
  const out = { from: { x: 84, y: 80 }, to: { x: 236, y: 80 }, bow: -0.36 };
  const back = { from: { x: 236, y: 96 }, to: { x: 84, y: 96 }, bow: -0.36 };
  return (
    <Art id={id} width={320}>
      <Bundle {...out} strands={6} spread={0.05} seed={3} />
      <Bundle {...back} tone="warm" strands={6} spread={0.05} seed={5} />
      <MiniLedger id={id} tone="violet" x={52} y={88} r={30} seed={7} />
      <MiniLedger id={id} tone="pink" x={268} y={88} r={30} seed={9} />
      <text x={160} y={92} textAnchor="middle" className="fill-white/55 font-mono text-[12px]">
        1 : 1
      </text>
      <Pulse x={268} y={88} motion="prop-ring" delay={2.02} rest={0}>
        <circle r={34} stroke={TONES.pink} strokeWidth={1.2} />
      </Pulse>
      <Pulse x={52} y={88} motion="prop-ring" delay={4.42} rest={0}>
        <circle r={34} stroke={TONES.warm} strokeWidth={1.2} />
      </Pulse>
      <Mover path={fibre(out.from, out.to, out.bow)} motion="prop-message" at={55}>
        <Star id={id} tone="violet" r={13} />
      </Mover>
      <Mover path={fibre(back.from, back.to, back.bow)} motion="prop-response" at={30}>
        <Star id={id} tone="warm" r={12} />
      </Mover>
    </Art>
  );
}

/** Where a bridge would pool the assets there is nothing: the Channel runs straight through a zero. */
function CustodyArt() {
  const id = "prop-custody";
  const from = { x: 34, y: 86 };
  const to = { x: 286, y: 86 };
  const lane = fibre(from, to, 0);
  return (
    <Art id={id} width={320}>
      <LaneGradient id={`${id}-lane`} x1={from.x} x2={to.x} />
      <defs>
        <linearGradient id={`${id}-zero`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <text
        x={160}
        y={133}
        textAnchor="middle"
        fill={`url(#${id}-zero)`}
        stroke="#fff"
        strokeOpacity={0.16}
        strokeWidth={0.8}
        className="text-[138px] font-extralight"
      >
        0
      </text>
      <Bundle from={from} to={to} stroke={`url(#${id}-lane)`} strands={8} spread={0.035} opacity={0.5} seed={4} />
      <Endpoint x={from.x} y={from.y} tone="violet" />
      <Endpoint x={to.x} y={to.y} tone="pink" />
      <Mover path={lane} motion="prop-pass" at={30}>
        <Star id={id} tone="violet" r={12} />
      </Mover>
      <Mover path={lane} motion="prop-pass" at={78} delay={2.4}>
        <Star id={id} tone="violet" r={12} />
      </Mover>
    </Art>
  );
}

/** The Endpoint is offline, so whoever is around delivers the proof. */
function DeliveryArt() {
  const id = "prop-delivery";
  const ledger = { x: 266, y: 92 };
  const endpoint = { x: 70, y: 56 };
  const entry = { x: 238, y: 98 };
  const anyone = [
    { x: 42, y: 126, bow: -0.12 },
    { x: 92, y: 142, bow: -0.08 },
    { x: 142, y: 124, bow: -0.12 },
  ];
  return (
    <Art id={id} width={320}>
      <path
        d={`M${endpoint.x + 10} ${endpoint.y + 4}L${entry.x} ${entry.y - 10}`}
        stroke="#fff"
        strokeOpacity={0.14}
        strokeDasharray="3 4"
      />
      <Endpoint x={endpoint.x} y={endpoint.y} tone="violet" offline />
      <text x={endpoint.x} y={32} textAnchor="middle" className="fill-white/40 text-[12px]">
        {guarantees.art.offline}
      </text>
      {anyone.map((node, k) => (
        <Bundle key={k} from={node} to={entry} bow={node.bow} strands={4} spread={0.06} opacity={0.35} seed={21 + k} />
      ))}
      <MiniLedger id={id} tone="pink" x={ledger.x} y={ledger.y} r={30} seed={13} />
      <Pulse x={ledger.x} y={ledger.y} motion="prop-ring" duration={1.6} delay={1.44} rest={0}>
        <circle r={34} stroke={TONES.pink} strokeWidth={1.2} />
      </Pulse>
      {anyone.map((node, k) => (
        <Pulse key={k} x={node.x} y={node.y} motion="prop-bead" delay={k * 1.6}>
          <Star id={id} tone="mist" r={9} />
        </Pulse>
      ))}
      <text x={92} y={168} textAnchor="middle" className="fill-white/40 text-[12px]">
        {guarantees.art.anyone}
      </text>
      {anyone.map((node, k) => (
        <Mover key={k} path={fibre(node, entry, node.bow)} motion="prop-relay" at={60} delay={k * 1.6} hidden={k !== 1}>
          <Star id={id} tone="violet" r={11} />
          <circle r={9} stroke={TONES.pink} strokeWidth={1.2} />
        </Mover>
      ))}
    </Art>
  );
}

/** Data, oracle feeds, contract calls or any bytes: all ride the same Channel. */
function PayloadArt() {
  const id = "prop-payload";
  const from = { x: 34, y: 88 };
  const to = { x: 286, y: 88 };
  const lane = fibre(from, to, 0);
  const payloads = [
    <rect key="data" x={-5} y={-5} width={10} height={10} rx={2} fill={TONES.violet} />,
    <circle key="feed" r={5.5} stroke={TONES.mist} strokeWidth={1.6} />,
    <path key="call" d="M0 -7L7 0L0 7L-7 0Z" fill={TONES.pink} />,
    <path key="bytes" d="M-6 -4h12M-6 0h12M-6 4h8" stroke={TONES.warm} strokeWidth={1.6} strokeLinecap="round" />,
  ];
  return (
    <Art id={id} width={320}>
      <LaneGradient id={`${id}-lane`} x1={from.x} x2={to.x} />
      <Bundle from={from} to={to} stroke={`url(#${id}-lane)`} strands={8} spread={0.05} opacity={0.5} seed={6} />
      <Endpoint x={from.x} y={from.y} tone="violet" />
      <Endpoint x={to.x} y={to.y} tone="pink" />
      {payloads.map((payload, k) => (
        <Mover key={k} path={lane} motion="prop-pass" at={18 + k * 22} duration={6.4} delay={k * 1.6}>
          <circle r={12} fill={`url(#${id}-mist)`} opacity={0.45} />
          {payload}
        </Mover>
      ))}
    </Art>
  );
}

/** A bridge waits for its own confirmations at every hop; CLPR is as fast as the two ledgers. */
function SpeedArt({ compact }: { compact: boolean }) {
  const id = compact ? "prop-speed-compact" : "prop-speed";
  const width = compact ? 380 : 760;
  const a = compact ? 96 : 140;
  const b = width - (compact ? 28 : 60);
  const label = compact ? 12 : 24;
  const hops = [a, a + (b - a) / 3, a + ((b - a) * 2) / 3, b];
  const rows = { bridge: 58, clpr: 126 };
  return (
    <Art id={id} width={width}>
      <LaneGradient id={`${id}-lane`} x1={a} x2={b} />
      <text x={label} y={rows.bridge + 4} className="fill-white/45 text-[13px]">
        {guarantees.art.bridge}
      </text>
      <text x={label} y={rows.clpr + 4} className="fill-white/85 text-[13px] font-medium">
        {guarantees.art.clpr}
      </text>
      {hops.slice(1).map((x, k) => (
        <Bundle
          key={k}
          from={{ x: hops[k] + 12, y: rows.bridge }}
          to={{ x: x - 12, y: rows.bridge }}
          tone="mist"
          strands={4}
          spread={0.03}
          opacity={0.25}
          seed={31 + k}
        />
      ))}
      {hops.slice(1, 3).map((x) => (
        <g key={x} transform={`translate(${round(x)} ${rows.bridge})`}>
          <circle className="prop-spin" r={10} stroke="#fff" strokeOpacity={0.35} strokeDasharray="2.5 3" />
        </g>
      ))}
      <Bundle
        from={{ x: a + 12, y: rows.clpr }}
        to={{ x: b - 12, y: rows.clpr }}
        stroke={`url(#${id}-lane)`}
        strands={8}
        spread={0.02}
        opacity={0.55}
        seed={35}
      />
      {Object.values(rows).map((y) => (
        <g key={y}>
          <Star id={id} tone="violet" r={13} x={a} y={y} />
          <Star id={id} tone="pink" r={13} x={b} y={y} />
        </g>
      ))}
      <Pulse x={b} y={rows.clpr} motion="prop-ring" duration={6} delay={2.28} rest={0}>
        <circle r={18} stroke={TONES.pink} strokeWidth={1.2} />
      </Pulse>
      <Pulse x={b} y={rows.bridge} motion="prop-ring" duration={6} delay={4.92} rest={0}>
        <circle r={18} stroke={TONES.pink} strokeWidth={1.2} />
      </Pulse>
      <Mover path={`M${a} ${rows.clpr}L${b} ${rows.clpr}`} motion="prop-clpr" at={100} duration={6}>
        <Star id={id} tone="violet" r={11} />
      </Mover>
      <Mover path={`M${a} ${rows.bridge}L${b} ${rows.bridge}`} motion="prop-bridge" at={50} duration={6}>
        <Star id={id} tone="mist" r={11} />
      </Mover>
    </Art>
  );
}

/** The wide diagrams get a shorter variant on phones, so their labels stay readable. */
function Responsive({ phone, wider }: { phone: ReactNode; wider: ReactNode }) {
  return (
    <>
      <div className="size-full sm:hidden">{phone}</div>
      <div className="hidden size-full sm:block">{wider}</div>
    </>
  );
}

export function PropertyArt({ visual }: { visual: Visual }) {
  switch (visual) {
    case "order":
      return <Responsive phone={<OrderArt count={3} />} wider={<OrderArt count={6} />} />;
    case "response":
      return <ResponseArt />;
    case "custody":
      return <CustodyArt />;
    case "delivery":
      return <DeliveryArt />;
    case "payload":
      return <PayloadArt />;
    case "speed":
      return <Responsive phone={<SpeedArt compact />} wider={<SpeedArt compact={false} />} />;
  }
}
