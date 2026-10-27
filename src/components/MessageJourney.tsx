"use client";

import { animate, createScope } from "animejs";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

import type { Point } from "@/components/fibres";
import { Bundle, Glows, hexagon, LaneGradient, round, Star, TONES } from "@/components/fibreSvg";
import { seeded } from "@/components/sceneGraphs";
import { demo, type DemoNodeId, type DemoStep } from "@/content/site";
import { cn, format } from "@/lib/utils";

/*
 * "How it works": one message on its way across a Channel, in seven steps.
 *
 * The two ledgers are membranes with the seven stops on one continuous route:
 * Application → CLPR Service (its ordered queue) → CLPR Endpoint on Ledger A,
 * the Channel, then Endpoint → Verifier Contract → Service → Application on
 * Ledger B. Three queued messages ride the route as the steps change: they
 * gather into a bundle with a state proof (magenta ring), cross, get verified,
 * are delivered in order, and a bundle of responses travels back. The motion
 * is CSS (offset-path + transitions on offset-distance); the steps play on
 * their own while in view unless the visitor prefers reduced motion.
 */

const STEP_DURATION_MS = 6000;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const ROUTE: DemoNodeId[] = ["a-app", "a-service", "a-endpoint", "b-endpoint", "b-verifier", "b-service", "b-app"];
/** Spacing of the messages in a bundle, in percent of the route. */
const BUNDLE_GAP = 1.4;

type Align = "start" | "middle" | "end";
type Stop = Point & { label: { dx: number; dy: number; align: Align } };
type Layout = {
  id: string;
  width: number;
  height: number;
  ledgers: Record<"a" | "b", Point & { r: number; label: Point }>;
  stops: Record<DemoNodeId, Stop>;
  /** How each leg of the route bows, relative to its length (one per pair of stops). */
  bows: number[];
  channelLabel: Point | null;
};

const LANDSCAPE: Layout = {
  id: "journey-wide",
  width: 1100,
  height: 440,
  ledgers: {
    a: { x: 250, y: 230, r: 185, label: { x: 250, y: 20 } },
    b: { x: 850, y: 230, r: 185, label: { x: 850, y: 20 } },
  },
  stops: {
    "a-app": { x: 150, y: 132, label: { dx: 18, dy: 0, align: "start" } },
    "a-service": { x: 212, y: 236, label: { dx: -18, dy: 0, align: "end" } },
    "a-endpoint": { x: 424, y: 293, label: { dx: -10, dy: 32, align: "end" } },
    "b-endpoint": { x: 676, y: 293, label: { dx: 10, dy: 32, align: "start" } },
    "b-verifier": { x: 772, y: 216, label: { dx: 0, dy: -40, align: "middle" } },
    "b-service": { x: 900, y: 262, label: { dx: 0, dy: 32, align: "middle" } },
    "b-app": { x: 958, y: 146, label: { dx: -18, dy: -8, align: "end" } },
  },
  bows: [0.12, -0.08, 0.14, -0.1, 0.12, 0.1],
  channelLabel: { x: 550, y: 356 },
};

const PORTRAIT: Layout = {
  id: "journey-tall",
  width: 360,
  height: 720,
  ledgers: {
    a: { x: 180, y: 168, r: 132, label: { x: 180, y: 16 } },
    b: { x: 180, y: 552, r: 132, label: { x: 180, y: 704 } },
  },
  stops: {
    "a-app": { x: 104, y: 98, label: { dx: 16, dy: 0, align: "start" } },
    "a-service": { x: 150, y: 178, label: { dx: 16, dy: 0, align: "start" } },
    "a-endpoint": { x: 225, y: 292, label: { dx: -16, dy: 0, align: "end" } },
    "b-endpoint": { x: 225, y: 428, label: { dx: -16, dy: 0, align: "end" } },
    "b-verifier": { x: 150, y: 498, label: { dx: 16, dy: 0, align: "start" } },
    "b-service": { x: 190, y: 588, label: { dx: 16, dy: 0, align: "start" } },
    "b-app": { x: 118, y: 642, label: { dx: 16, dy: 0, align: "start" } },
  },
  bows: [0.12, -0.12, -0.22, 0.14, -0.12, 0.12],
  channelLabel: null,
};

type Cubic = [Point, Point, Point, Point];

function leg(a: Point, b: Point, bow: number): Cubic {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const side = length * bow;
  return [
    a,
    { x: a.x + dx * 0.33 + nx * side, y: a.y + dy * 0.33 + ny * side },
    { x: a.x + dx * 0.67 + nx * side * 0.9, y: a.y + dy * 0.67 + ny * side * 0.9 },
    b,
  ];
}

function cubicLength([p0, p1, p2, p3]: Cubic): number {
  let length = 0;
  let previous = p0;
  for (let i = 1; i <= 48; i++) {
    const t = i / 48;
    const u = 1 - t;
    const point = {
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    };
    length += Math.hypot(point.x - previous.x, point.y - previous.y);
    previous = point;
  }
  return length;
}

/** The route as one SVG path, and where each stop sits along it (percent). */
function buildRoute(layout: Layout) {
  const points = ROUTE.map((id) => layout.stops[id]);
  const legs = points.slice(1).map((point, k) => leg(points[k], point, layout.bows[k]));
  const lengths = legs.map(cubicLength);
  const total = lengths.reduce((sum, value) => sum + value, 0);
  const at = {} as Record<DemoNodeId, number>;
  let run = 0;
  ROUTE.forEach((id, k) => {
    at[id] = (run / total) * 100;
    run += lengths[k] ?? 0;
  });
  const path =
    `M${round(points[0].x)} ${round(points[0].y)}` +
    legs.map(([, c1, c2, end]) => `C${round(c1.x)} ${round(c1.y)} ${round(c2.x)} ${round(c2.y)} ${round(end.x)} ${round(end.y)}`).join("");
  return { path, at, points };
}

/** Faint validators in each ledger's membrane, clear of the stops and their labels, each tied to its nearest neighbour. */
function buildValidators(layout: Layout, side: "a" | "b"): { points: Point[]; links: [Point, Point][] } {
  const random = seeded(side === "a" ? 71 : 73);
  const ledger = layout.ledgers[side];
  const stops = ROUTE.filter((id) => id.startsWith(side)).map((id) => layout.stops[id]);
  const keepClear = stops.flatMap((stop) => [
    { point: stop, room: 48 },
    { point: { x: stop.x + stop.label.dx, y: stop.y + stop.label.dy }, room: 72 },
  ]);
  const points: Point[] = [];
  for (let tries = 0; points.length < 7 && tries < 400; tries++) {
    const angle = random() * Math.PI * 2;
    const distance = ledger.r * (0.2 + random() * 0.7);
    const point = { x: ledger.x + Math.cos(angle) * distance, y: ledger.y + Math.sin(angle) * distance };
    const clear =
      keepClear.every(({ point: other, room }) => Math.hypot(other.x - point.x, other.y - point.y) > room) &&
      points.every((other) => Math.hypot(other.x - point.x, other.y - point.y) > 40);
    if (clear) points.push(point);
  }
  const links: [Point, Point][] = [];
  points.forEach((point) => {
    const neighbour = points
      .filter((other) => other !== point)
      .reduce((best, other) =>
        Math.hypot(other.x - point.x, other.y - point.y) < Math.hypot(best.x - point.x, best.y - point.y) ? other : best,
      );
    if (!links.some(([p, q]) => (p === neighbour && q === point) || (p === point && q === neighbour))) links.push([point, neighbour]);
  });
  return { points, links };
}

type Placement = { at: number; shown: boolean };

/** Where the three messages, the proof ring and the three responses are at a step. */
function placements(index: number, at: Record<DemoNodeId, number>) {
  const between = (from: DemoNodeId, to: DemoNodeId, t: number) => at[from] + (at[to] - at[from]) * t;
  // Queue slots between the Service and the Endpoint, the oldest message in front.
  const slot = (k: number) => between("a-service", "a-endpoint", 0.8 - k * 0.25);
  const bundle = (stop: DemoNodeId): Placement[] => [0, 1, 2].map((k) => ({ at: at[stop] - k * BUNDLE_GAP, shown: true }));
  const hidden = (value: number): Placement => ({ at: value, shown: false });
  let messages: Placement[];
  switch (index) {
    case 0:
      messages = [
        { at: slot(0), shown: true },
        { at: slot(1), shown: true },
        { at: between("a-app", "a-service", 0.55), shown: true },
      ];
      break;
    case 1:
      messages = [0, 1, 2].map((k) => ({ at: slot(k), shown: true }));
      break;
    case 2:
      messages = bundle("a-endpoint");
      break;
    case 3:
      messages = bundle("b-endpoint");
      break;
    case 4:
      messages = bundle("b-verifier");
      break;
    case 5:
      // Delivered one after the other, in order.
      messages = [at["b-app"], between("b-service", "b-app", 0.5), between("b-service", "b-app", 0.08)].map((value) => ({
        at: value,
        shown: true,
      }));
      break;
    default:
      messages = [0, 1, 2].map(() => hidden(at["b-app"]));
  }
  const responses: Placement[] =
    index === 6
      ? [0, 1, 2].map((k) => ({ at: at["a-service"] + k * BUNDLE_GAP, shown: true }))
      : [0, 1, 2].map(() => hidden(at["b-service"]));
  const ring: Placement = index >= 2 && index <= 4 ? { at: messages[1].at, shown: true } : hidden(messages[1].at);
  return { messages, responses, ring };
}

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function subscribeToVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

export function MessageJourney() {
  const steps: readonly DemoStep[] = demo.steps;
  const root = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const detailId = useId();
  const [stepIndex, setStepIndex] = useState(0);
  // A long jump (wrapping around, or picking a step far away) moves the messages without travelling.
  const [jump, setJump] = useState(false);
  const [inView, setInView] = useState(false);
  // null follows the visitor's motion preference; manual selection pauses playback.
  const [playPreference, setPlayPreference] = useState<boolean | null>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
  const pageVisible = useSyncExternalStore(
    subscribeToVisibility,
    () => !document.hidden,
    () => true,
  );
  const isPlaying = playPreference ?? !reducedMotion;
  const running = isPlaying && inView && pageVisible;

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      const next = (stepIndex + 1) % steps.length;
      setJump(next === 0);
      setStepIndex(next);
    }, STEP_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [running, stepIndex, steps.length]);

  useEffect(() => {
    if (reducedMotion) return;
    const scope = createScope({ root: copy }).add(() => {
      animate("[data-step-copy]", { opacity: [0.45, 1], y: [10, 0], duration: 450, ease: "out(3)" });
    });
    return () => scope.revert();
  }, [stepIndex, reducedMotion]);

  const step = steps[stepIndex];
  const goTo = (index: number) => {
    const next = (index + steps.length) % steps.length;
    setPlayPreference(false);
    setJump(Math.abs(next - stepIndex) > 1);
    setStepIndex(next);
  };
  const onStepKeyDown = (event: KeyboardEvent<HTMLOListElement>) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-step-index]");
    if (!button) return;
    const index = Number(button.dataset.stepIndex);
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % steps.length
        : event.key === "ArrowLeft"
          ? (index - 1 + steps.length) % steps.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? steps.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    goTo(next);
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-step-index="${next}"]`)?.focus();
  };
  // Light runs along the Channel while a bundle crosses it.
  const flowing = running && !reducedMotion ? (stepIndex === 3 ? "forward" : stepIndex === 6 ? "back" : null) : null;
  const position = format(demo.controls.position, { step: stepIndex + 1, total: steps.length });

  return (
    <section ref={root} aria-label={demo.ariaLabel} className="min-w-0">
      <div aria-hidden="true">
        <div className="md:hidden">
          <Stage layout={PORTRAIT} step={step} stepIndex={stepIndex} jump={jump} flowing={flowing} />
        </div>
        <div className="hidden md:block">
          <Stage layout={LANDSCAPE} step={step} stepIndex={stepIndex} jump={jump} flowing={flowing} />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-5 border-t border-white/7 pt-6 lg:mt-10">
        <ol aria-label={demo.controls.steps} onKeyDown={onStepKeyDown} className="grid min-w-0 flex-1 grid-cols-7">
          {steps.map((item, index) => {
            const active = index === stepIndex;
            const done = index < stepIndex;
            return (
              <li key={item.name} className="min-w-0">
                <button
                  type="button"
                  data-step-index={index}
                  onClick={() => goTo(index)}
                  aria-current={active ? "step" : undefined}
                  aria-controls={detailId}
                  className="group flex w-full flex-col gap-2.5 pr-2 text-left"
                >
                  <span className="relative block h-0.5 w-full overflow-hidden rounded-full bg-white/10">
                    {active && running && !reducedMotion ? (
                      <span
                        key={stepIndex}
                        className="step-progress absolute inset-0 rounded-full bg-linear-to-r from-signal-glow to-proof-glow"
                        style={{ animationDuration: `${STEP_DURATION_MS}ms` }}
                      />
                    ) : (
                      <span
                        className={cn(
                          "absolute inset-0 rounded-full bg-linear-to-r from-signal-glow to-proof-glow transition-opacity",
                          active || done ? "opacity-100" : "opacity-0",
                        )}
                      />
                    )}
                  </span>
                  <span className="flex items-baseline gap-1.5">
                    <span className={cn("font-mono text-[0.6875rem]", active ? "text-signal-ink" : "text-white/30")}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "hidden truncate text-[0.8125rem] transition-colors sm:inline",
                        active ? "text-white" : "text-white/50 group-hover:text-white/85",
                      )}
                    >
                      {item.name}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(stepIndex - 1)}
            aria-label={demo.controls.previous}
            className="flex size-11 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors hover:bg-white/10"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setPlayPreference(!isPlaying)}
            aria-label={isPlaying ? demo.controls.pause : demo.controls.play}
            aria-pressed={isPlaying}
            className="flex size-11 items-center justify-center rounded-full bg-white text-night transition-colors hover:bg-white/85"
          >
            {isPlaying ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => goTo(stepIndex + 1)}
            aria-label={demo.controls.next}
            className="flex size-11 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors hover:bg-white/10"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div ref={copy} id={detailId} className="mt-8 grid">
        {/* Overlapping panels reserve the tallest step's space at every width. */}
        {steps.map((item, index) => (
          <div
            key={item.name}
            data-step-copy={index === stepIndex ? "" : undefined}
            aria-hidden={index !== stepIndex}
            className={cn(
              "grid gap-x-12 gap-y-3 [grid-area:1/1] md:grid-cols-12",
              index !== stepIndex && "pointer-events-none invisible",
            )}
          >
            <div className="md:col-span-5">
              <p className="text-[0.8125rem] text-signal-ink">
                {format(demo.controls.position, { step: index + 1, total: steps.length })}
              </p>
              <h3 className="mt-2 max-w-[24ch] text-[1.5rem] font-medium leading-[1.2] tracking-[-0.025em] text-balance sm:text-[1.75rem]">
                {item.title}
              </h3>
            </div>
            <p className="max-w-[60ch] text-[1rem] leading-[1.75] text-muted-foreground md:col-span-7 md:pt-7">
              {item.body}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-6 hidden text-[0.75rem] text-white/35 sm:block">{demo.controls.keyboardHint}</p>
      <p className="sr-only" aria-live={isPlaying ? "off" : "polite"} aria-atomic="true">
        {position}: {step.title}. {step.body}
      </p>
    </section>
  );
}

/** The two ledgers, the route through their stops, and the messages on it. */
function Stage({
  layout,
  step,
  stepIndex,
  jump,
  flowing,
}: {
  layout: Layout;
  step: DemoStep;
  stepIndex: number;
  jump: boolean;
  flowing: "forward" | "back" | null;
}) {
  const route = useMemo(() => buildRoute(layout), [layout]);
  const validators = useMemo(() => ({ a: buildValidators(layout, "a"), b: buildValidators(layout, "b") }), [layout]);
  const { messages, responses, ring } = placements(stepIndex, route.at);
  const { id, width, height, stops } = layout;
  const channel = { from: stops["a-endpoint"], to: stops["b-endpoint"], bow: layout.bows[2] };
  const verified = step.proofVerified;
  const ride = (placement: Placement): CSSProperties => ({
    offsetPath: `path("${route.path}")`,
    offsetDistance: `${placement.at}%`,
    opacity: placement.shown ? 1 : 0,
  });
  const percent = (point: Point) => ({ left: `${(point.x / width) * 100}%`, top: `${(point.y / height) * 100}%` });
  const shift: Record<Align, string> = { start: "0%", middle: "-50%", end: "-100%" };

  return (
    <div className="relative" style={{ aspectRatio: `${width} / ${height}` }} data-jump={jump || undefined}>
      <svg viewBox={`0 0 ${width} ${height}`} fill="none" className="absolute inset-0 size-full overflow-visible">
        <Glows id={id} />
        <LaneGradient id={`${id}-lane`} x1={channel.from.x} x2={channel.to.x} />

        {(["a", "b"] as const).map((side) => {
          const ledger = layout.ledgers[side];
          const tone = side === "a" ? "violet" : "pink";
          const { points, links } = validators[side];
          return (
            <g key={side}>
              <circle
                cx={ledger.x}
                cy={ledger.y}
                r={ledger.r}
                fill={`url(#${id}-${tone}-membrane)`}
                stroke={TONES[tone]}
                strokeOpacity={0.35}
                strokeWidth={1}
              />
              {links.map(([from, to], k) => (
                <Bundle key={k} from={from} to={to} tone={tone} strands={2} spread={0.1} opacity={0.16} seed={k + (side === "a" ? 100 : 200)} />
              ))}
              {points.map((point, k) => (
                <Star key={k} id={id} tone={tone} r={6} x={point.x} y={point.y} />
              ))}
            </g>
          );
        })}

        {/* The route inside each ledger, and the Channel between the Endpoints. */}
        {ROUTE.slice(1).map((stopId, k) => {
          const from = stops[ROUTE[k]];
          const to = stops[stopId];
          if (k === 2) return null;
          return (
            <Bundle key={stopId} from={from} to={to} bow={layout.bows[k]} tone={k < 2 ? "violet" : "pink"} strands={4} spread={0.05} opacity={0.4} seed={300 + k} />
          );
        })}
        <Bundle {...channel} stroke={`url(#${id}-lane)`} strands={10} spread={0.05} opacity={0.55} seed={310} />
        {flowing && (
          <path
            d={legPath(channel.from, channel.to, channel.bow)}
            className="dash-flow"
            stroke="#fff"
            strokeOpacity={0.55}
            strokeWidth={1.4}
            strokeDasharray="3 21"
            style={{ animationDirection: flowing === "back" ? "reverse" : "normal" }}
          />
        )}

        {/* The stops. */}
        {ROUTE.map((stopId) => {
          const stop = stops[stopId];
          const active = step.active.includes(stopId);
          const tone = stopId.startsWith("a") ? "violet" : "pink";
          return (
            <g key={stopId} className="transition-opacity duration-500" opacity={active ? 1 : 0.7}>
              {active && <circle cx={stop.x} cy={stop.y} r={22} stroke={TONES[tone]} strokeOpacity={0.7} strokeWidth={1.2} />}
              {stopId.endsWith("endpoint") ? (
                <path d={hexagon(stop.x, stop.y, 11)} fill="#0b0a13" stroke={TONES[tone]} strokeWidth={1.4} />
              ) : stopId === "b-verifier" ? (
                <path
                  d={`M${stop.x} ${stop.y - 11}L${stop.x + 11} ${stop.y}L${stop.x} ${stop.y + 11}L${stop.x - 11} ${stop.y}Z`}
                  fill={verified ? TONES.pink : "#0b0a13"}
                  fillOpacity={verified ? 0.45 : 1}
                  stroke={TONES.pink}
                  strokeWidth={1.4}
                />
              ) : (
                <Star id={id} tone={tone} r={stopId.endsWith("service") ? 17 : 14} x={stop.x} y={stop.y} />
              )}
            </g>
          );
        })}
        {stepIndex === 4 && (
          <g key={`ping-${stepIndex}`} transform={`translate(${stops["b-verifier"].x} ${stops["b-verifier"].y})`}>
            <circle className="journey-ping" r={20} stroke={TONES.pink} strokeWidth={1.4} />
          </g>
        )}

        {/* The three messages, their state proof, and the responses. */}
        <g className="journey-move" style={ride(ring)}>
          <circle
            r={20}
            stroke={TONES.pink}
            strokeWidth={1.4}
            strokeDasharray={verified ? undefined : "3 3"}
            fill={verified ? TONES.pink : "none"}
            fillOpacity={verified ? 0.12 : 0}
          />
        </g>
        {messages.map((placement, k) => (
          <g key={`message-${k}`} className="journey-move" style={ride(placement)}>
            <Star id={id} tone="violet" r={13} />
            <text
              y={-16}
              textAnchor="middle"
              className={cn("fill-white/70 font-mono text-[11px] transition-opacity duration-500", stepIndex > 1 && "opacity-0")}
            >
              {demo.queue.messages[k].id}
            </text>
          </g>
        ))}
        {responses.map((placement, k) => (
          <g key={`response-${k}`} className="journey-move" style={ride(placement)}>
            <Star id={id} tone="warm" r={12} />
          </g>
        ))}
      </svg>

      {/* Labels as HTML, so they keep their size at every width. */}
      {(["a", "b"] as const).map((side) => {
        const ledger = side === "a" ? demo.ledgerA : demo.ledgerB;
        return (
          <div key={side} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={percent(layout.ledgers[side].label)}>
            <p className="inline-flex items-center gap-2 text-[0.9375rem] font-medium text-white">
              <span className={cn("size-1.5 rounded-full", side === "a" ? "bg-signal-glow" : "bg-proof-glow")} />
              {ledger.name}
            </p>
            <p className="whitespace-nowrap text-[0.75rem] text-faint">{ledger.role}</p>
          </div>
        );
      })}
      {ROUTE.map((stopId) => {
        const stop = stops[stopId];
        const node = demo.nodes[stopId];
        const active = step.active.includes(stopId);
        return (
          <div
            key={stopId}
            className="absolute whitespace-nowrap transition-opacity duration-500"
            style={{
              ...percent({ x: stop.x + stop.label.dx, y: stop.y + stop.label.dy }),
              transform: `translate(${shift[stop.label.align]}, -50%)`,
              textAlign: stop.label.align === "middle" ? "center" : stop.label.align === "end" ? "right" : "left",
              opacity: active ? 1 : 0.75,
            }}
          >
            <p className={cn("text-[0.8125rem] font-medium leading-tight", active ? "text-white" : "text-white/80")}>{node.name}</p>
            <p className="text-[0.6875rem] leading-tight text-faint">{node.note}</p>
          </div>
        );
      })}
      {layout.channelLabel && (
        <p
          className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[0.75rem] text-faint"
          style={percent(layout.channelLabel)}
        >
          {demo.channel.label}
        </p>
      )}
    </div>
  );
}

function legPath(a: Point, b: Point, bow: number): string {
  const [p0, c1, c2, p3] = leg(a, b, bow);
  return `M${round(p0.x)} ${round(p0.y)}C${round(c1.x)} ${round(c1.y)} ${round(c2.x)} ${round(c2.y)} ${round(p3.x)} ${round(p3.y)}`;
}
