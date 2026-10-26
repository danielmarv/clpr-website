"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { BadgeCheck, CircleSlash } from "lucide-react";

import { SectionHeading } from "@/components/SectionHeading";
import { comparison } from "@/content/site";
import { cn } from "@/lib/utils";

export function Comparison() {
  const [active, setActive] = useState(0);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const row = comparison.rows[active];

  const select = (index: number) => {
    const next = (index + comparison.rows.length) % comparison.rows.length;
    setActive(next);
    tabsRef.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      select(active + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      select(active - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      select(0);
    } else if (event.key === "End") {
      event.preventDefault();
      select(comparison.rows.length - 1);
    }
  };

  return (
    <section aria-labelledby={comparison.id} data-form="bridge" className="shell py-20 lg:py-28">
      <SectionHeading
        id={comparison.id}
        eyebrow={comparison.eyebrow}
        title={comparison.title}
        lead={comparison.lead}
        illustrated
      />

      <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5 lg:mt-20">
        <p className="shrink-0 text-[0.8125rem] text-faint">{comparison.aspectsLabel}</p>
        <div
          role="tablist"
          aria-label={comparison.caption}
          onKeyDown={onKeyDown}
          className="-mx-5 flex gap-1 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:rounded-full sm:border sm:border-white/8 sm:bg-white/2 sm:p-1"
        >
          {comparison.rows.map((item, index) => (
            <button
              key={item.aspect}
              ref={(element) => {
                tabsRef.current[index] = element;
              }}
              id={`${baseId}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-controls={`${baseId}-panel`}
              tabIndex={index === active ? 0 : -1}
              onClick={() => setActive(index)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-[0.875rem] transition-colors",
                index === active
                  ? "bg-white text-night"
                  : "border border-white/10 text-white/65 hover:text-white sm:border-transparent",
              )}
            >
              {item.aspect}
            </button>
          ))}
        </div>
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        className="mt-6 grid gap-3 md:grid-cols-2"
      >
        {/* Typical bridge */}
        <article className="panel flex flex-col p-6 sm:p-8">
          <header className="flex items-center justify-between gap-4">
            <h3 className="text-[0.9375rem] font-medium text-white/60">{comparison.columns.bridge}</h3>
            <CircleSlash className="size-5 text-white/35" aria-hidden="true" />
          </header>
          <BridgeDiagram className="mt-8 w-full" />
          <p className="mt-5 text-[0.9375rem] text-faint">{comparison.diagrams.bridge.caption}</p>
          <div className="mt-8 border-t border-white/7 pt-6">
            <p className="text-[0.8125rem] text-faint">{row.aspect}</p>
            <p key={`bridge-${active}`} className="fade-up mt-2 text-[1.5rem] leading-snug tracking-[-0.02em] text-white/55">
              {row.bridge}
            </p>
          </div>
        </article>

        {/* CLPR */}
        <article className="relative isolate flex flex-col overflow-hidden rounded-panel border border-signal-glow/25 bg-[linear-gradient(160deg,rgb(40_26_102/0.75),rgb(13_11_26/0.9)_55%,rgb(54_16_50/0.75))] p-6 shadow-[0_30px_90px_-40px_rgb(157_139_255/0.5),inset_0_1px_0_rgb(255_255_255/0.08)] sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 -z-10 size-80 rounded-full bg-violet/35 blur-[90px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 -left-16 -z-10 size-72 rounded-full bg-magenta/25 blur-[90px]"
          />
          <header className="flex items-center justify-between gap-4">
            <h3 className="text-[0.9375rem] font-medium text-white">{comparison.columns.clpr}</h3>
            <BadgeCheck className="size-5 text-proof-glow" aria-hidden="true" />
          </header>
          <ClprDiagram className="mt-8 w-full" />
          <p className="mt-5 text-[0.9375rem] text-night-text">{comparison.diagrams.clpr.caption}</p>
          <div className="mt-8 border-t border-white/15 pt-6">
            <p className="text-[0.8125rem] text-white/55">{row.aspect}</p>
            <p key={`clpr-${active}`} className="fade-up mt-2 text-[1.5rem] leading-snug tracking-[-0.02em] text-white">
              {row.clpr}
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}

function LedgerNode({ x, label, fill, stroke, text }: { x: number; label: string; fill: string; stroke?: string; text: string }) {
  return (
    <g>
      <circle cx={x} cy="66" r="26" fill={fill} stroke={stroke} strokeWidth={stroke ? 1.5 : 0} />
      <text x={x} y="71" textAnchor="middle" fontSize="15" fill={text}>
        {label.slice(-1)}
      </text>
      <text x={x} y="118" textAnchor="middle" fontSize="11.5" fill={text} opacity="0.7">
        {label}
      </text>
    </g>
  );
}

function BridgeDiagram({ className }: { className?: string }) {
  const { diagrams } = comparison;
  return (
    <svg viewBox="0 0 400 132" fill="none" aria-hidden="true" className={className}>
      <defs>
        <marker id="bridge-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 8 4 0 8z" fill="var(--ink-faint)" />
        </marker>
      </defs>
      <line x1="76" y1="66" x2="136" y2="66" stroke="var(--ink-faint)" strokeWidth="1.5" markerEnd="url(#bridge-arrow)" />
      <line x1="264" y1="66" x2="322" y2="66" stroke="var(--ink-faint)" strokeWidth="1.5" markerEnd="url(#bridge-arrow)" />

      <rect x="140" y="24" width="120" height="84" rx="14" fill="var(--surface-2)" stroke="var(--ink-faint)" strokeDasharray="4 4" />
      <text x="200" y="54" textAnchor="middle" fontSize="15" fill="var(--ink)">
        {diagrams.bridge.middle}
      </text>
      <text x="200" y="72" textAnchor="middle" fontSize="9.5" fill="var(--ink-soft)">
        {diagrams.bridge.middleNote}
      </text>
      {[0, 1, 2, 3, 4].map((index) => (
        <circle key={index} cx={172 + index * 14} cy="90" r="4" fill="var(--ink-soft)" opacity={0.35 + index * 0.12} />
      ))}

      <LedgerNode x={48} label={diagrams.ledgerA} fill="var(--surface-2)" stroke="var(--line-strong)" text="var(--ink)" />
      <LedgerNode x={352} label={diagrams.ledgerB} fill="var(--surface-2)" stroke="var(--line-strong)" text="var(--ink)" />
    </svg>
  );
}

function ClprDiagram({ className }: { className?: string }) {
  const { diagrams } = comparison;
  return (
    <svg viewBox="0 0 400 132" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="clpr-ledger-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--signal-glow)" />
          <stop offset="1" stopColor="var(--violet)" />
        </linearGradient>
        <linearGradient id="clpr-ledger-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--proof-glow)" />
          <stop offset="1" stopColor="var(--plum)" />
        </linearGradient>
      </defs>

      <line
        x1="80"
        y1="66"
        x2="320"
        y2="66"
        stroke="var(--signal-glow)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="0.01 9"
      />

      {/* The proof travels straight from ledger to ledger. */}
      <g className="proof-travel">
        <rect x="152" y="53" width="96" height="26" rx="13" fill="#140f24" stroke="var(--proof-glow)" strokeWidth="1.5" />
        <text x="200" y="70" textAnchor="middle" fontSize="11" fill="var(--proof-glow)">
          {diagrams.clpr.proof}
        </text>
      </g>

      <LedgerNode x={48} label={diagrams.ledgerA} fill="url(#clpr-ledger-a)" text="white" />
      <LedgerNode x={352} label={diagrams.ledgerB} fill="url(#clpr-ledger-b)" text="white" />
    </svg>
  );
}
