"use client";

import { useState } from "react";

import type { Point } from "@/components/fibres";
import { fibre, Mover } from "@/components/fibreSvg";
import { TermShape } from "@/components/TermArt";
import { RELATED, type Term } from "@/lib/glossary";
import { cn } from "@/lib/utils";

// The map repeats what the list offers, so it is hidden from assistive technology.
// It sits on the light band: ink links, with the dark term badges of the list beside it.

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

const INK = "#120f2c";
const VIOLET = "#8b7bff";
const MAGENTA = "#f0559f";

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
      <defs>
        <linearGradient id={`${id}-lit`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={VIOLET} />
          <stop offset="1" stopColor={MAGENTA} />
        </linearGradient>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0.5" stopColor={VIOLET} stopOpacity="0.32" />
          <stop offset="1" stopColor={VIOLET} stopOpacity="0" />
        </radialGradient>
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
                stroke={lit ? `url(#${id}-lit)` : INK}
                strokeOpacity={lit ? 0.85 : 0.14}
                strokeWidth={lit ? 1.2 : 0.8}
              />
            ))}
            {lit && (
              <Mover key={`${focus}-${a}-${b}`} path={fibre(focus === a ? from : to, focus === a ? to : from, 0.04)} motion="prop-pass" at={50} duration={3.2}>
                <circle r={3} fill={VIOLET} stroke="#fff" strokeWidth={1} />
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
            opacity={quiet ? 0.8 : 1}
            onPointerEnter={() => setHovered(name)}
            onClick={() => onChoose(name)}
          >
            {isFocus && (
              <>
                <circle r={32} fill={`url(#${id}-halo)`} />
                <circle r={19.5} stroke={VIOLET} strokeWidth={1.4} />
              </>
            )}
            <circle r={15} fill={INK} stroke={isNeighbour ? VIOLET : "none"} strokeWidth={1.2} />
            <g transform="scale(1.15)">
              <TermShape term={name} />
            </g>
            {/* A paper outline keeps labels legible where links pass behind them. */}
            <text
              y={33}
              textAnchor="middle"
              strokeWidth={4}
              strokeLinejoin="round"
              className={cn(
                "stroke-(--paper) text-[13.5px] transition-[fill] duration-500 [paint-order:stroke] max-sm:hidden",
                isFocus ? "fill-foreground font-medium" : isNeighbour ? "fill-foreground/85" : "fill-muted-foreground",
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
