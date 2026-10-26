"use client";

import { animate, createScope } from "animejs";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  ArrowLeftRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  CornerDownLeft,
  Inbox,
  Layers3,
  Package,
  Pause,
  Play,
  Send,
  ShieldCheck,
  Stamp,
  Waypoints,
  type LucideIcon,
} from "lucide-react";

import { ClprMark } from "@/components/ClprMark";
import { demo, type DemoNodeId, type DemoStep } from "@/content/site";
import { cn } from "@/lib/utils";

const STEP_DURATION_MS = 6000;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const stepIcons = [
  Send,
  Layers3,
  Package,
  ArrowLeftRight,
  ShieldCheck,
  Inbox,
  CornerDownLeft,
];
const nodeIcons: Record<DemoNodeId, LucideIcon> = {
  "a-app": Code2,
  "a-service": Layers3,
  "a-endpoint": Waypoints,
  "b-endpoint": Waypoints,
  "b-verifier": ShieldCheck,
  "b-service": Layers3,
  "b-app": Code2,
};

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function subscribeToVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

export function ChannelDemo() {
  const steps: readonly DemoStep[] = demo.steps;
  const root = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const detailId = useId();
  const [stepIndex, setStepIndex] = useState(0);
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
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => setStepIndex((current) => (current + 1) % steps.length),
      STEP_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [running, stepIndex, steps.length]);

  useEffect(() => {
    if (reducedMotion) return;
    const scope = createScope({ root: copy }).add(() => {
      animate("[data-step-copy]", {
        opacity: [0.45, 1],
        y: [10, 0],
        duration: 450,
        ease: "out(3)",
      });
    });
    return () => scope.revert();
  }, [stepIndex, reducedMotion]);

  const step = steps[stepIndex];
  const Icon = stepIcons[stepIndex];
  const isActive = (id: DemoNodeId) => step.active.includes(id);
  const goTo = (index: number) => {
    setPlayPreference(false);
    setStepIndex((index + steps.length) % steps.length);
  };
  const onStepKeyDown = (event: KeyboardEvent<HTMLOListElement>) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-step-index]",
    );
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
    event.currentTarget
      .querySelector<HTMLButtonElement>(`[data-step-index="${next}"]`)
      ?.focus();
  };
  const flowing =
    running && !reducedMotion
      ? step.bundle === 1 && !step.proofVerified
        ? "forward"
        : step.response !== null
          ? "backward"
          : "none"
      : "none";

  return (
    <section ref={root} aria-label={demo.ariaLabel} className="min-w-0">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[0.75rem] font-medium tracking-[0.12em] text-white/65 uppercase">
          <span
            className="size-1.5 rounded-full bg-signal-glow"
            aria-hidden="true"
          />
          The message journey
        </p>
        <p className="rounded-full border border-white/10 px-3 py-1 font-mono text-[0.68rem] text-white/50">
          7 steps · 2 ledgers · 1 channel
        </p>
      </div>

      <ol
        aria-label="Walkthrough steps"
        onKeyDown={onStepKeyDown}
        className="grid grid-cols-4 gap-2 sm:grid-cols-7"
      >
        {steps.map((item, index) => {
          const active = index === stepIndex;
          const StepIcon = stepIcons[index];
          return (
            <li key={item.name} className="min-w-0">
              <button
                type="button"
                data-step-index={index}
                onClick={() => goTo(index)}
                aria-current={active ? "step" : undefined}
                aria-controls={detailId}
                className={cn(
                  "group relative flex min-h-20 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border px-1.5 py-3 text-center transition-colors focus-visible:outline-white sm:min-h-24",
                  active
                    ? "border-signal-glow/60 bg-signal-glow/15 text-white shadow-[0_4px_24px_-12px_var(--signal-glow)]"
                    : "border-white/10 bg-white/[0.025] text-white/50 hover:border-white/25 hover:bg-white/[0.06] hover:text-white",
                )}
              >
                <StepIcon
                  className={cn("size-[18px]", active && "text-signal-glow")}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
                <span className="flex items-center gap-1.5 text-[0.66rem] font-medium sm:text-[0.76rem]">
                  <span
                    className={cn(
                      "hidden font-mono text-[0.6rem] sm:inline",
                      active ? "text-signal-glow" : "text-white/30",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item.name}
                </span>
                {active && (
                  <span
                    className="absolute inset-x-3 bottom-0 h-px bg-signal-glow"
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,2.15fr)] xl:gap-8">
        <div className="flex min-w-0 flex-col rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl border border-signal-glow/25 bg-signal-glow/10 text-signal-glow">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <p className="font-mono text-[0.7rem] text-white/45">
              STEP {String(stepIndex + 1).padStart(2, "0")} / 07
            </p>
          </div>
          <div
            ref={copy}
            id={detailId}
            className="grid min-h-[12rem] xl:min-h-[17rem]"
          >
            {/* Overlapping panels reserve the tallest step's space at every width. */}
            {steps.map((item, index) => (
              <div
                key={item.name}
                data-step-copy={index === stepIndex ? "" : undefined}
                aria-hidden={index !== stepIndex}
                className={cn(
                  "[grid-area:1/1]",
                  index !== stepIndex && "pointer-events-none invisible",
                )}
              >
                <p className="mb-2 text-[0.72rem] font-medium tracking-[0.14em] text-signal-glow uppercase">
                  {item.name}
                </p>
                <h3 className="max-w-[28ch] text-[1.5rem] font-normal leading-[1.25] tracking-[-0.025em] sm:text-[1.65rem]">
                  {item.title}
                </h3>
                <p className="mt-4 text-[0.92rem] leading-[1.75] text-night-text">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-6">
            <div
              className="mb-5 h-0.5 overflow-hidden rounded-full bg-white/10"
              aria-hidden="true"
            >
              {running && !reducedMotion ? (
                <span
                  key={stepIndex}
                  className="step-progress block h-full rounded-full bg-gradient-to-r from-signal-glow to-proof-glow"
                  style={{ animationDuration: `${STEP_DURATION_MS}ms` }}
                />
              ) : (
                <span
                  className="block h-full bg-signal-glow/60"
                  style={{
                    width: `${((stepIndex + 1) / steps.length) * 100}%`,
                  }}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goTo(stepIndex - 1)}
                aria-label={demo.controls.previous}
                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors hover:bg-white/10 focus-visible:outline-white"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setPlayPreference(!isPlaying)}
                aria-label={
                  isPlaying ? demo.controls.pause : demo.controls.play
                }
                aria-pressed={isPlaying}
                className="flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 text-[0.82rem] font-medium text-night transition-colors hover:bg-white/85 focus-visible:outline-white"
              >
                {isPlaying ? (
                  <Pause className="size-3.5" />
                ) : (
                  <Play className="size-3.5" />
                )}
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                type="button"
                onClick={() => goTo(stepIndex + 1)}
                aria-label={demo.controls.next}
                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors hover:bg-white/10 focus-visible:outline-white"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
            <p className="mt-3 hidden text-center text-[0.68rem] text-white/35 sm:block">
              {demo.controls.keyboardHint}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col">
          <MobileChannelDiagram step={step} />
          <div className="channel-stage bg-dots hidden min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/15 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,1fr)]">
            <LedgerPanel
              name={demo.ledgerA.name}
              role="Source ledger"
              example="Hiero network"
              side="A"
            >
              <DemoNode id="a-app" active={isActive("a-app")} />
              <DemoNode id="a-service" active={isActive("a-service")}>
                <ol
                  className="mt-3 grid grid-cols-3 gap-1"
                  aria-label="Ordered outbound queue"
                >
                  {demo.queue.messages.map((message, index) => (
                    <li
                      key={message.id}
                      className={cn(
                        "rounded border border-white/10 px-1 py-1 text-center font-mono text-[0.6rem] transition-opacity",
                        index < step.queueLength
                          ? "bg-signal-glow/10 text-white/70"
                          : "text-white/25",
                      )}
                      title={`Illustrative hash: ${message.hash}`}
                    >
                      {message.id}
                      <span className="sr-only">
                        {index < step.queueLength ? ", queued" : ", waiting"}
                      </span>
                    </li>
                  ))}
                </ol>
              </DemoNode>
              <DemoNode id="a-endpoint" active={isActive("a-endpoint")} />
            </LedgerPanel>
            <ChannelLane
              bundle={step.bundle}
              response={step.response}
              verified={step.proofVerified}
              flowing={flowing}
            />
            <LedgerPanel
              name={demo.ledgerB.name}
              role="Destination ledger"
              example="Besu network"
              side="B"
            >
              <div className="flex flex-col gap-2.5 md:flex-col-reverse">
                <DemoNode id="b-endpoint" active={isActive("b-endpoint")} />
                <DemoNode
                  id="b-verifier"
                  active={isActive("b-verifier")}
                  verified={step.proofVerified}
                />
                <DemoNode id="b-service" active={isActive("b-service")} />
                <DemoNode id="b-app" active={isActive("b-app")} />
              </div>
            </LedgerPanel>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <ul
              aria-label="Diagram legend"
              className="flex flex-wrap gap-x-4 gap-y-2 text-[0.7rem] text-white/55"
            >
              <li className="flex items-center gap-2">
                <span
                  className="size-1.5 rounded-full bg-signal-glow"
                  aria-hidden="true"
                />
                {demo.legend.message}
              </li>
              <li className="flex items-center gap-2">
                <span
                  className="size-1.5 rounded-full bg-proof-glow"
                  aria-hidden="true"
                />
                {demo.legend.proof}
              </li>
            </ul>
            <span className="flex items-center gap-1.5 text-[0.68rem] text-white/40">
              <ArrowUpRight className="size-3" aria-hidden="true" />
              Illustrative flow
            </span>
          </div>
        </div>
      </div>
      <p
        className="sr-only"
        aria-live={isPlaying ? "off" : "polite"}
        aria-atomic="true"
      >
        {demo.controls.stepPrefix} {stepIndex + 1} {demo.controls.of}{" "}
        {steps.length}: {step.title}. {step.body}
      </p>
    </section>
  );
}

function LedgerPanel({
  name,
  role,
  example,
  side,
  children,
}: {
  name: string;
  role: string;
  example: string;
  side: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col p-4 sm:p-5 md:p-3.5 lg:p-5">
      <div className="mb-5 flex items-center gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 font-mono text-[0.8rem] text-white/75"
          aria-hidden="true"
        >
          {side}
        </span>
        <div className="min-w-0">
          <p className="text-[1rem] font-medium leading-snug">{name}</p>
          <p className="text-[0.68rem] text-white/45">{role}</p>
        </div>
      </div>
      <div className="mt-auto flex flex-col gap-2.5">{children}</div>
      <p className="mt-4 text-[0.65rem] text-white/35">e.g. {example}</p>
    </div>
  );
}

function DemoNode({
  id,
  active,
  verified = false,
  compact = false,
  children,
}: {
  id: DemoNodeId;
  active: boolean;
  verified?: boolean;
  compact?: boolean;
  children?: ReactNode;
}) {
  const node = demo.nodes[id];
  const Icon = nodeIcons[id];
  return (
    <div
      data-node={id}
      data-active={active}
      className={cn(
        "relative min-w-0 rounded-xl border transition-[background-color,border-color,box-shadow] duration-500",
        compact ? "flex min-h-11 items-center px-2 py-2" : "px-3 py-3",
        active
          ? verified
            ? "border-proof-glow/50 bg-proof-glow/10 shadow-[0_0_24px_-12px_var(--proof-glow)]"
            : "border-signal-glow/55 bg-signal-glow/10 shadow-[0_0_24px_-12px_var(--signal-glow)]"
          : verified
            ? "border-proof-glow/25 bg-proof-glow/5"
            : "border-white/10 bg-white/[0.025]",
      )}
    >
      <div className="flex items-start gap-2">
        <Icon
          className={cn(
            "mt-0.5 size-3.5 shrink-0",
            active
              ? verified
                ? "text-proof-glow"
                : "text-signal-glow"
              : "text-white/35",
          )}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-medium leading-snug",
              compact ? "text-[0.68rem]" : "text-[0.8rem]",
            )}
          >
            {node.name}
          </p>
          <p
            className={cn(
              "mt-1 text-[0.68rem] leading-[1.5] text-white/45",
              compact && "sr-only",
            )}
          >
            {node.note}
          </p>
        </div>
        {id === "b-verifier" && (
          <Check
            className={cn("size-3 shrink-0 text-proof-glow", !verified && "invisible")}
            aria-label="Proof verified"
            aria-hidden={!verified}
          />
        )}
      </div>
      {children}
    </div>
  );
}

function ChannelLane({
  bundle,
  response,
  verified,
  flowing,
}: {
  bundle: number | null;
  response: number | null;
  verified: boolean;
  flowing: "forward" | "backward" | "none";
}) {
  const laneStyle = {
    "--row": "calc(100% - 5rem)",
    "--w": "min(10.5rem, 100%)",
    "--h": "3.75rem",
  } as CSSProperties;
  return (
    <div
      className="channel-lane relative h-52 border-y border-white/10 md:h-auto md:min-h-[26rem] md:border-x md:border-y-0"
      style={laneStyle}
    >
      <p className="absolute inset-x-0 top-4 hidden px-2 text-center text-[0.63rem] leading-relaxed text-white/40 md:block">
        {demo.channel.label}
      </p>
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-[1] -translate-y-1/2 px-3 text-center md:top-[43%]">
        <div className="mx-auto max-w-[26ch] bg-[#151226] px-2 py-3 md:bg-transparent">
          <span className="mx-auto mb-3 flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/45">
            <ArrowLeftRight className="size-4" aria-hidden="true" />
          </span>
          <p className="text-[1.1rem] font-light leading-tight tracking-[-0.025em] text-white md:text-[1.25rem]">
            {demo.channel.emptyTitle}
          </p>
          <p className="mt-2 text-[0.68rem] leading-relaxed text-white/40">
            {demo.channel.emptyBody}
          </p>
        </div>
      </div>
      <div
        aria-hidden="true"
        data-flowing={flowing}
        className="channel-line absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 md:inset-x-0 md:bottom-auto md:left-0 md:top-[var(--row)] md:h-px md:w-auto md:translate-x-0"
      />
      <Packet
        position={bundle ?? 0}
        visible={bundle !== null}
        verified={verified}
      >
        <p className="flex items-center gap-1.5 text-[0.67rem] font-medium leading-snug">
          <ClprMark className="h-2 shrink-0 text-signal-glow" />
          {demo.channel.bundleTitle}
        </p>
        <p
          className={cn(
            "mt-1 flex items-center gap-1 text-[0.6rem] leading-snug",
            verified ? "text-proof-glow" : "text-white/55",
          )}
        >
          {verified ? (
            <BadgeCheck className="size-3 shrink-0" aria-hidden="true" />
          ) : (
            <Stamp
              className="size-3 shrink-0 text-proof-glow"
              aria-hidden="true"
            />
          )}
          {verified
            ? demo.channel.bundleProofVerified
            : demo.channel.bundleProof}
        </p>
      </Packet>
      <Packet position={response ?? 1} visible={response !== null} response>
        <p className="flex items-center gap-1.5 text-[0.67rem] font-medium leading-snug">
          <CornerDownLeft
            className="size-3 shrink-0 text-signal-glow"
            aria-hidden="true"
          />
          {demo.channel.responseTitle}
        </p>
      </Packet>
    </div>
  );
}

function Packet({
  position,
  visible,
  verified,
  response,
  children,
}: {
  position: number;
  visible: boolean;
  verified?: boolean;
  response?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "channel-packet z-10 flex h-[var(--h)] w-[var(--w)] max-w-[calc(100%-1rem)] flex-col justify-center rounded-lg border bg-[#19132e] px-2.5 py-2",
        response
          ? "border-dashed border-signal-glow/60"
          : verified
            ? "border-proof-glow/70 shadow-[0_0_20px_-6px_var(--magenta)]"
            : "border-signal-glow/70 shadow-[0_0_20px_-6px_var(--violet)]",
        visible ? "opacity-100" : "opacity-0",
      )}
      style={{ "--p": position } as CSSProperties}
    >
      {children}
    </div>
  );
}

/** Keep both ledgers in view on a phone; the expanded diagram appears on tablets. */
function MobileChannelDiagram({ step }: { step: DemoStep }) {
  const source: DemoNodeId[] = ["a-app", "a-service", "a-endpoint"];
  const destination: DemoNodeId[] = [
    "b-endpoint",
    "b-verifier",
    "b-service",
    "b-app",
  ];
  const hasPacket = step.bundle !== null || step.response !== null;
  const position = step.bundle ?? step.response ?? 0;
  const tone = step.proofVerified ? "text-proof-glow" : "text-signal-glow";
  return (
    <div className="bg-dots overflow-hidden rounded-2xl border border-white/10 bg-black/15 md:hidden">
      <div className="grid grid-cols-2 divide-x divide-white/10">
        {[
          { name: demo.ledgerA.name, role: "Source", nodes: source },
          { name: demo.ledgerB.name, role: "Destination", nodes: destination },
        ].map((ledger) => (
          <div key={ledger.name} className="min-w-0 p-3">
            <p className="text-[0.85rem] font-medium">{ledger.name}</p>
            <p className="mb-4 mt-0.5 text-[0.65rem] text-white/45">
              {ledger.role} ledger
            </p>
            <div className="flex flex-col gap-2">
              {ledger.nodes.map((id) => (
                <DemoNode
                  key={id}
                  id={id}
                  active={step.active.includes(id)}
                  verified={id === "b-verifier" && step.proofVerified}
                  compact
                />
              ))}
            </div>
            {ledger.role === "Source" && (
              <p className="mt-3 font-mono text-[0.6rem] text-white/45">
                {step.queueLength} messages queued
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 px-3 pb-4 pt-3">
        <div className="flex items-center justify-between text-[0.6rem] text-white/45">
          <span>Ledger A</span>
          <span>CLPR Channel</span>
          <span>Ledger B</span>
        </div>
        <div className="relative mt-2 h-16">
          <div
            className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-signal-glow/40 via-signal-glow/20 to-proof-glow/40"
            aria-hidden="true"
          />
          {hasPacket ? (
            <div
              className={cn(
                "channel-packet absolute z-10 flex h-14 w-32 flex-col justify-center rounded-lg border bg-[#19132e] px-2 text-center text-[0.6rem] leading-snug",
                step.proofVerified
                  ? "border-proof-glow/60"
                  : "border-signal-glow/60",
              )}
              style={{
                top: "50%",
                left: `calc(${position} * (100% - 8rem))`,
                transform: "translateY(-50%)",
              }}
            >
              <p className="text-white/85">
                {step.response !== null
                  ? demo.channel.responseTitle
                  : demo.channel.bundleTitle}
              </p>
              <p className={cn("mt-1", tone)}>
                {step.response !== null
                  ? "Returning to Ledger A"
                  : step.proofVerified
                    ? demo.channel.bundleProofVerified
                    : demo.channel.bundleProof}
              </p>
            </div>
          ) : (
            <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
              <span className="rounded-full border border-white/10 bg-[#151226] px-3 py-2 text-[0.68rem] text-white/65">
                {demo.channel.emptyTitle}
              </span>
            </p>
          )}
        </div>
        <p className="mt-2 text-center text-[0.64rem] leading-relaxed text-white/45">
          {demo.channel.emptyBody}
        </p>
      </div>
    </div>
  );
}
