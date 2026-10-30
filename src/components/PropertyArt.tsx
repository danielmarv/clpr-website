import type { ReactNode } from "react";

import { Bundle, fibre, Glows, LaneGradient, MiniLedger, Mover, Pulse, round, Star, timing, TONES } from "@/components/fibreSvg";
import { guarantees } from "@/content/site";

// Decorative diagrams for the protocol properties; the motion is the prop-* CSS and only runs without reduced motion.

type Visual = Extract<(typeof guarantees.items)[number], { visual: string }>["visual"];
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
    case "speed":
      return <Responsive phone={<SpeedArt compact />} wider={<SpeedArt compact={false} />} />;
  }
}
