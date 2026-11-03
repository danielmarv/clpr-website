import { ArrowRight, BadgeCheck, CircleSlash, Info } from "lucide-react";

import { BridgeArt, ClprArt } from "@/components/ComparisonArt";
import { SectionHeading } from "@/components/SectionHeading";
import { comparison } from "@/content/site";
import { cn } from "@/lib/utils";

// Both cards share the parent's rows (subgrid), so each aspect lines up across the two columns.
const CARD = "grid grid-rows-subgrid row-span-8 p-6 sm:p-8";
const ROWS = "grid grid-rows-subgrid row-span-5 mt-6";

export function Comparison() {
  const { columns, diagrams, rows } = comparison;

  return (
    <section aria-labelledby={comparison.id} className="band py-24 lg:py-32">
      <div className="shell">
        <SectionHeading id={comparison.id} eyebrow={comparison.eyebrow} title={comparison.title} lead={comparison.lead} split />

        <div data-motion-reveal role="group" aria-label={comparison.caption} className="mt-14 grid gap-x-4 md:grid-cols-2 lg:mt-20">
          {/* Many bridges: the same two ledgers, joined through a party in the middle. */}
          <article className={cn(CARD, "panel")}>
            <header className="flex items-start justify-between gap-4">
              <h3 className="text-[0.9375rem] font-medium text-white/60">{columns.bridge}</h3>
              <CircleSlash className="size-5 shrink-0 text-white/30" aria-hidden="true" />
            </header>
            <div className="mt-6 aspect-[520/200] w-full">
              <BridgeArt />
            </div>
            <p className="mt-6 max-w-[48ch] text-[0.8125rem] leading-relaxed text-faint">{diagrams.bridge.caption}</p>
            <dl className={ROWS}>
              {rows.map((row) => (
                <div key={row.aspect} className="border-t border-white/[0.07] py-5">
                  <dt className="text-[0.8125rem] text-faint">{row.aspect}</dt>
                  <dd className="mt-1.5 text-[1rem] leading-relaxed text-white/55">{row.bridge}</dd>
                </div>
              ))}
            </dl>
          </article>

          {/* CLPR: the ledgers joined directly. */}
          <article
            className={cn(
              CARD,
              "rounded-panel border border-signal-glow/25 bg-[linear-gradient(160deg,rgb(63_34_215/0.18),rgb(255_255_255/0.02)_55%,rgb(200_42_128/0.1))] max-md:mt-4",
            )}
          >
            <header className="flex items-start justify-between gap-4">
              <h3 className="text-[0.9375rem] font-medium text-white">{columns.clpr}</h3>
              <BadgeCheck className="size-5 shrink-0 text-proof-glow" aria-hidden="true" />
            </header>
            <div className="mt-6 aspect-[520/200] w-full">
              <ClprArt />
            </div>
            <p className="mt-6 max-w-[48ch] text-[0.8125rem] leading-relaxed text-night-text">{diagrams.clpr.caption}</p>
            <dl className={ROWS}>
              {rows.map((row) => (
                <div key={row.aspect} className="border-t border-white/12 py-5">
                  <dt className="text-[0.8125rem] text-white/55">{row.aspect}</dt>
                  <dd className="mt-1.5 text-[1rem] leading-relaxed text-white">{row.clpr}</dd>
                </div>
              ))}
            </dl>
          </article>
        </div>

        <div data-motion-reveal className="mt-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-12">
          <p className="flex max-w-[64ch] gap-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
            <Info className="mt-1 size-4 shrink-0 text-signal-ink" aria-hidden="true" />
            {comparison.caveat}
          </p>
          <a
            href={comparison.explainer.href}
            className="group inline-flex shrink-0 items-center gap-2 text-[0.9375rem] font-medium text-signal-ink transition-colors hover:text-white"
          >
            {comparison.explainer.label}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
