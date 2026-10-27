"use client";

import { useState } from "react";

import type { Point } from "@/components/fibres";
import { fibre, Glows, Mover, Star, TONES } from "@/components/fibreSvg";
import { TermShape } from "@/components/TermArt";
import { RELATED, type Term } from "@/lib/glossary";
import { cn } from "@/lib/utils";

/*
 * The glossary as a map: every term with its icon and name, joined by fibres
 * where one definition mentions another (RELATED in lib/glossary.ts). The
 * selected term and its relations light up in step with the explorer below;
 * hovering a term shows its neighbours, and clicking one selects it. The map
 * repeats what the list offers, so it is decorative for assistive technology.
 */

type Name = Term["term"];

const WIDTH = 560;
const HEIGHT = 400;

// Placed by hand so related terms sit close and links rarely cross.
const PLACES: Record<Name, Point> = {
  "CLPR Service": { x: 150, y: 95 },
  Connector: { x: 44, y: 122 },
  "CLPR Endpoint": { x: 70, y: 232 },
  Message: { x: 200, y: 215 },
  "Data Message": { x: 100, y: 305 },
  "Response Message": { x: 150, y: 372 },
  Configuration: { x: 208, y: 305 },
  "Control Message": { x: 304, y: 330 },
  Channel: { x: 330, y: 90 },
  "Trust Anchor": { x: 452, y: 52 },
  "Peer Ledger": { x: 516, y: 132 },
  "Verifier Contract": { x: 432, y: 190 },
  Bundle: { x: 360, y: 240 },
  "State Proof": { x: 500, y: 262 },
};

const NAMES = Object.keys(PLACES) as Name[];

// Each relation once.
const EDGES: [Name, Name][] = NAMES.flatMap((name) =>
  (RELATED.get(name) ?? []).filter((other) => name < other && other in PLACES).map((other) => [name, other as Name] as [Name, Name]),
);

export function TermMap({ selected, onChoose }: { selected: string | undefined; onChoose: (name: string) => void }) {
  const [hovered, setHovered] = useState<Name | null>(null);
  const focus = (hovered ?? selected) as Name | undefined;
  const neighbours = new Set(focus ? (RELATED.get(focus) ?? []) : []);
  const id = "term-map";

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} fill="none" className="size-full overflow-visible" onPointerLeave={() => setHovered(null)}>
      <Glows id={id} />
      <defs>
        <linearGradient id={`${id}-lit`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={TONES.violet} />
          <stop offset="1" stopColor={TONES.pink} />
        </linearGradient>
      </defs>

      {EDGES.map(([a, b]) => {
        const lit = focus === a || focus === b;
        const from = PLACES[a];
        const to = PLACES[b];
        return (
          <g key={`${a}-${b}`} className="transition-opacity duration-500" opacity={focus ? (lit ? 1 : 0.35) : 0.7}>
            {[-1, 0, 1].map((lane) => (
              <path
                key={lane}
                d={fibre(from, to, 0.04, lane * 0.025)}
                stroke={lit ? `url(#${id}-lit)` : TONES.mist}
                strokeOpacity={lit ? 0.75 : 0.3}
                strokeWidth={lit ? 1.1 : 0.8}
              />
            ))}
            {lit && (
              <Mover key={`${focus}-${a}-${b}`} path={fibre(focus === a ? from : to, focus === a ? to : from, 0.04)} motion="prop-pass" at={50} duration={3.2}>
                <circle r={2.6} fill="#fff" />
              </Mover>
            )}
          </g>
        );
      })}

      {NAMES.map((name) => {
        const place = PLACES[name];
        const isFocus = focus === name;
        const isNeighbour = neighbours.has(name);
        const quiet = focus && !isFocus && !isNeighbour;
        return (
          <g
            key={name}
            transform={`translate(${place.x} ${place.y})`}
            className="cursor-pointer transition-opacity duration-500"
            opacity={quiet ? 0.6 : 1}
            onPointerEnter={() => setHovered(name)}
            onClick={() => onChoose(name)}
          >
            {isFocus && <Star id={id} tone="violet" r={30} />}
            <circle
              r={15}
              fill="#0b0a13"
              stroke={isFocus ? "#fff" : isNeighbour ? TONES.violet : "rgb(255 255 255 / 0.18)"}
              strokeWidth={isFocus ? 1.5 : 1}
            />
            <g transform="scale(1.15)">
              <TermShape term={name} />
            </g>
            <text
              y={33}
              textAnchor="middle"
              className={cn(
                "text-[13.5px] transition-[fill] duration-500 max-sm:hidden",
                isFocus ? "fill-white font-medium" : isNeighbour ? "fill-white/90" : "fill-white/65",
              )}
            >
              {name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
