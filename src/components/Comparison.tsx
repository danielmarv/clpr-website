"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { BadgeCheck, CircleSlash } from "lucide-react";

import { BridgeArt, ClprArt } from "@/components/ComparisonArt";
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
    <section aria-labelledby={comparison.id} className="shell py-20 lg:py-28">
      <SectionHeading id={comparison.id} eyebrow={comparison.eyebrow} title={comparison.title} lead={comparison.lead} split />

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
        {/* Typical bridge: the same two ledgers, joined through a party in the middle. */}
        <article className="panel flex flex-col p-6 sm:p-8">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[0.9375rem] font-medium text-white/60">{comparison.columns.bridge}</h3>
              <p className="mt-1.5 max-w-[42ch] text-[0.8125rem] leading-relaxed text-faint">{comparison.diagrams.bridge.caption}</p>
            </div>
            <CircleSlash className="size-5 shrink-0 text-white/35" aria-hidden="true" />
          </header>
          <div className="mt-6 aspect-[520/200] w-full">
            <BridgeArt key={row.visual} visual={row.visual} />
          </div>
          <div className="mt-6 border-t border-white/7 pt-6">
            <p className="text-[0.8125rem] text-faint">{row.aspect}</p>
            <p key={`bridge-${active}`} className="fade-up mt-2 text-[1.375rem] leading-snug tracking-[-0.02em] text-white/55">
              {row.bridge}
            </p>
          </div>
        </article>

        {/* CLPR: the ledgers joined directly. */}
        <article className="relative isolate flex flex-col overflow-hidden rounded-panel border border-signal-glow/25 bg-[linear-gradient(160deg,rgb(40_26_102/0.75),rgb(13_11_26/0.9)_55%,rgb(54_16_50/0.75))] p-6 shadow-[0_30px_90px_-40px_rgb(157_139_255/0.5),inset_0_1px_0_rgb(255_255_255/0.08)] sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 -z-10 size-80 rounded-full bg-violet/35 blur-[90px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 -left-16 -z-10 size-72 rounded-full bg-magenta/25 blur-[90px]"
          />
          <header className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[0.9375rem] font-medium text-white">{comparison.columns.clpr}</h3>
              <p className="mt-1.5 max-w-[42ch] text-[0.8125rem] leading-relaxed text-night-text">{comparison.diagrams.clpr.caption}</p>
            </div>
            <BadgeCheck className="size-5 shrink-0 text-proof-glow" aria-hidden="true" />
          </header>
          <div className="mt-6 aspect-[520/200] w-full">
            <ClprArt key={row.visual} visual={row.visual} />
          </div>
          <div className="mt-6 border-t border-white/15 pt-6">
            <p className="text-[0.8125rem] text-white/55">{row.aspect}</p>
            <p key={`clpr-${active}`} className="fade-up mt-2 text-[1.375rem] leading-snug tracking-[-0.02em] text-white">
              {row.clpr}
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
