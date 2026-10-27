"use client";

import type { CSSProperties, ReactNode } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

import type { Point } from "@/components/fibres";
import { Bundle, Endpoint, fibre, Glows, LaneGradient, Mover, Star, TONES } from "@/components/fibreSvg";
import { extensibility } from "@/content/site";
import { cn, format } from "@/lib/utils";
import { useStepper } from "@/lib/useStepper";

// The drawing shows the state after the selected step; what that step added rings once.

const STEP_MS = 5000;
const WIDTH = 600;
const HEIGHT = 330;
const NEW = { x: 150, y: 160, r: 112 };
const HIERO = { x: 450, y: 160, r: 112 };
const copy = extensibility.onboarding;

const SERVICE = { new: { x: 124, y: 160 }, hiero: { x: 476, y: 160 } };
const ENDPOINTS = {
  new: [
    { x: 254, y: 118 },
    { x: 254, y: 202 },
  ],
  hiero: [
    { x: 346, y: 118 },
    { x: 346, y: 202 },
  ],
};
const APPS = { new: { x: 96, y: 92 }, hiero: { x: 504, y: 92 } };
// Where the Verifier Contracts wait once built, and where they end up.
const VERIFIER = {
  forHiero: { built: { x: 222, y: 266 }, deployed: { x: 150, y: 238 } },
  forNew: { built: { x: 378, y: 266 }, deployed: { x: 450, y: 238 } },
};

function Label({
  x,
  y,
  anchor = "middle",
  strong,
  quiet,
  children,
}: {
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
  strong?: boolean;
  /** Hidden on phones, where the drawing is too small for every label. */
  quiet?: boolean;
  children: ReactNode;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      className={cn(
        "text-[13px] transition-[fill] duration-500 max-sm:text-[18px]",
        strong ? "fill-white" : "fill-white/50",
        quiet && "max-sm:hidden",
      )}
    >
      {children}
    </text>
  );
}

function Diamond({ tone }: { tone: "violet" | "pink" }) {
  return <path d="M0 -11L11 0L0 11L-11 0Z" fill="#0b0a13" stroke={TONES[tone]} strokeWidth={1.5} />;
}

function Ping({ at, step }: { at: Point; step: number }) {
  return (
    <g transform={`translate(${at.x} ${at.y})`}>
      <circle key={step} className="journey-ping" style={{ animationDelay: "0.2s" }} r={20} stroke={TONES.mist} strokeWidth={1.3} />
    </g>
  );
}

function Diagram({ step }: { step: number }) {
  const id = "onboarding";
  const has = (from: number) => step >= from;
  const show = (from: number): CSSProperties => ({ opacity: has(from) ? 1 : 0, transition: "opacity 0.7s ease" });
  const deployed = has(3);
  const lane = fibre({ x: SERVICE.new.x + 16, y: SERVICE.new.y }, { x: SERVICE.hiero.x - 16, y: SERVICE.hiero.y }, 0);
  const laneBack = fibre({ x: SERVICE.hiero.x - 16, y: SERVICE.hiero.y + 4 }, { x: SERVICE.new.x + 16, y: SERVICE.new.y + 4 }, 0);
  const verifier = (which: "forHiero" | "forNew"): CSSProperties => {
    const place = VERIFIER[which][deployed ? "deployed" : "built"];
    return {
      transform: `translate(${place.x}px, ${place.y}px)`,
      opacity: has(which === "forHiero" ? 1 : 2) ? 1 : 0,
      transition: "transform 1.2s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.7s ease",
    };
  };

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} fill="none" aria-hidden="true" className="size-full overflow-visible">
      <Glows id={id} />
      <LaneGradient id={`${id}-lane`} x1={SERVICE.new.x} x2={SERVICE.hiero.x} />

      {[
        { ledger: NEW, tone: "violet" as const, name: copy.newLedger },
        { ledger: HIERO, tone: "pink" as const, name: copy.hiero },
      ].map(({ ledger, tone, name }) => (
        <g key={name}>
          <circle
            cx={ledger.x}
            cy={ledger.y}
            r={ledger.r}
            fill={`url(#${id}-${tone}-membrane)`}
            stroke={TONES[tone]}
            strokeOpacity={0.35}
            strokeWidth={1}
          />
          <Label x={ledger.x} y={ledger.y - ledger.r - 14} strong>
            {name}
          </Label>
        </g>
      ))}

      {/* Step 5: the Channel between the two Services. */}
      <g style={show(4)}>
        <Bundle from={{ x: SERVICE.new.x + 16, y: SERVICE.new.y }} to={{ x: SERVICE.hiero.x - 16, y: SERVICE.hiero.y }} stroke={`url(#${id}-lane)`} strands={9} spread={0.03} opacity={0.6} seed={1} />
        <Label x={300} y={138} strong={step === 4}>
          {copy.channel}
        </Label>
      </g>

      {/* Step 6: each network's Endpoints known to the other. */}
      <g style={show(5)}>
        {ENDPOINTS.new.map((point, k) => (
          <Bundle key={k} from={point} to={ENDPOINTS.hiero[k]} tone="warm" strands={3} spread={0.06} bow={k ? 0.12 : -0.12} opacity={0.45} seed={2 + k} />
        ))}
      </g>

      {/* Hiero: CLPR is native, so its Service and Endpoints are there from the start. */}
      {ENDPOINTS.hiero.map((point, k) => (
        <Bundle key={k} from={SERVICE.hiero} to={point} tone="pink" strands={3} spread={0.08} opacity={0.35} seed={4 + k} />
      ))}
      <Star id={id} tone="pink" r={18} x={SERVICE.hiero.x} y={SERVICE.hiero.y} />
      {ENDPOINTS.hiero.map((point, k) => (
        <Endpoint key={k} x={point.x} y={point.y} tone="pink" />
      ))}
      <Label x={SERVICE.hiero.x} y={SERVICE.hiero.y + 34}>
        {copy.service}
      </Label>
      <Label x={ENDPOINTS.hiero[0].x} y={ENDPOINTS.hiero[0].y - 18} quiet>
        {copy.endpoints}
      </Label>

      {/* Step 1: the new ledger's Service and Endpoints. */}
      <g style={show(0)}>
        {ENDPOINTS.new.map((point, k) => (
          <Bundle key={k} from={SERVICE.new} to={point} strands={3} spread={0.08} opacity={0.35} seed={6 + k} />
        ))}
        <Star id={id} tone="violet" r={18} x={SERVICE.new.x} y={SERVICE.new.y} />
        {ENDPOINTS.new.map((point, k) => (
          <Endpoint key={k} x={point.x} y={point.y} tone="violet" />
        ))}
        <Label x={SERVICE.new.x} y={SERVICE.new.y + 34} strong={step === 0}>
          {copy.service}
        </Label>
        <Label x={ENDPOINTS.new[0].x} y={ENDPOINTS.new[0].y - 18} strong={step === 0} quiet>
          {copy.endpoints}
        </Label>
      </g>

      {/* Steps 2–4: the Verifier Contracts, built, then deployed to the opposite network. */}
      <g style={{ opacity: has(1) && !deployed ? 1 : 0, transition: "opacity 0.7s ease" }}>
        <Label x={300} y={324}>
          {copy.built}
        </Label>
      </g>
      <g style={verifier("forHiero")}>
        <Diamond tone="pink" />
        <text y={28} textAnchor="middle" className={cn("text-[12px] max-sm:text-[16px]", step === 1 || step === 3 ? "fill-white" : "fill-white/50")}>
          {copy.verifierForHiero}
        </text>
      </g>
      <g style={verifier("forNew")}>
        <Diamond tone="violet" />
        <text y={28} textAnchor="middle" className={cn("text-[12px] max-sm:text-[16px]", step === 2 || step === 3 ? "fill-white" : "fill-white/50")}>
          {copy.verifierForNew}
        </text>
      </g>

      {/* Step 7: a Connector bonded to the Channel. */}
      <g style={show(6)}>
        <g transform="translate(300 160)">
          <circle r={10} fill="#0b0a13" stroke={TONES.warm} strokeWidth={1.6} />
          <circle r={3.5} fill={TONES.warm} />
        </g>
        <Label x={300} y={190} strong={step === 6}>
          {copy.connector}
        </Label>
      </g>

      {/* Step 8: applications on both ledgers, and messages on the Channel. */}
      <g style={show(7)}>
        <Bundle from={APPS.new} to={SERVICE.new} strands={3} spread={0.08} opacity={0.4} seed={8} />
        <Bundle from={APPS.hiero} to={SERVICE.hiero} tone="pink" strands={3} spread={0.08} opacity={0.4} seed={9} />
        <Star id={id} tone="violet" r={12} x={APPS.new.x} y={APPS.new.y} />
        <Star id={id} tone="pink" r={12} x={APPS.hiero.x} y={APPS.hiero.y} />
        <Label x={APPS.new.x} y={APPS.new.y - 20} strong={step === 7} quiet>
          {copy.applications}
        </Label>
        <Label x={APPS.hiero.x} y={APPS.hiero.y - 20} strong={step === 7} quiet>
          {copy.applications}
        </Label>
        {step === 7 && (
          <>
            <Mover path={lane} motion="prop-pass" at={35}>
              <Star id={id} tone="violet" r={10} />
            </Mover>
            <Mover path={laneBack} motion="prop-pass" at={70} delay={2.4}>
              <Star id={id} tone="warm" r={9} />
            </Mover>
          </>
        )}
      </g>

      {step === 0 && <Ping at={SERVICE.new} step={step} />}
      {step === 3 && <Ping at={VERIFIER.forNew.deployed} step={step} />}
      {step === 4 && <Ping at={{ x: 300, y: 160 }} step={step} />}
      {step === 6 && <Ping at={{ x: 300, y: 160 }} step={step} />}
    </svg>
  );
}

export function LedgerOnboarding() {
  const steps = extensibility.steps;
  const { root, index, isPlaying, running, reducedMotion, goTo, togglePlay, onStepKeyDown } = useStepper(steps.length, STEP_MS);
  const position = format(copy.position, { step: index + 1, total: steps.length });

  return (
    <section ref={root} aria-label={extensibility.stepsTitle} className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:order-2 lg:col-span-7">
        <div className="aspect-[600/330] w-full">
          <Diagram step={index} />
        </div>
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-[0.8125rem] text-signal-ink" aria-hidden="true">
            {position}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label={copy.previous}
              className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors hover:bg-white/10"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? copy.pause : copy.play}
              aria-pressed={isPlaying}
              className="flex size-10 items-center justify-center rounded-full bg-white text-night transition-colors hover:bg-white/85"
            >
              {isPlaying ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label={copy.next}
              className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors hover:bg-white/10"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <ol aria-label={copy.stepsLabel} onKeyDown={onStepKeyDown} className="flex flex-col gap-1 lg:order-1 lg:col-span-5">
        {steps.map((step, k) => {
          const active = k === index;
          const done = k < index;
          return (
            <li key={step}>
              <button
                type="button"
                data-step-index={k}
                onClick={() => goTo(k)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "relative flex w-full items-baseline gap-4 overflow-hidden rounded-xl px-4 py-3 text-left transition-colors",
                  active ? "bg-white/[0.06]" : "hover:bg-white/[0.03]",
                )}
              >
                <span className={cn("font-mono text-[0.75rem]", active ? "text-signal-ink" : done ? "text-white/45" : "text-white/30")}>
                  {String(k + 1).padStart(2, "0")}
                </span>
                <span className={cn("text-[0.9375rem] leading-snug", active ? "text-white" : done ? "text-white/70" : "text-white/50")}>
                  {step}
                </span>
                {active && running && !reducedMotion && (
                  <span
                    key={index}
                    aria-hidden="true"
                    className="step-progress absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-signal-glow to-proof-glow"
                    style={{ animationDuration: `${STEP_MS}ms` }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>
      <p className="sr-only" aria-live={isPlaying ? "off" : "polite"} aria-atomic="true">
        {position}: {steps[index]}
      </p>
    </section>
  );
}
