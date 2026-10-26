import { SectionHeading } from "@/components/SectionHeading";
import { roadmap } from "@/content/site";
import { cn } from "@/lib/utils";

export function Roadmap() {
  const currentIndex = Math.max(0, roadmap.phases.findIndex((phase) => phase.current));
  // The track runs a little past the current phase's marker: work in progress.
  const progress = ((currentIndex + 0.35) / roadmap.phases.length) * 100;

  return (
    <section aria-labelledby={roadmap.id} data-form="growth" className="shell py-20 lg:py-28">
      <SectionHeading id={roadmap.id} eyebrow={roadmap.eyebrow} title={roadmap.title} lead={roadmap.lead} illustrated />

      <div className="relative mt-14 lg:mt-20">
        <div aria-hidden="true" className="absolute inset-x-0 top-1.75 hidden h-px bg-white/10 lg:block">
          <div
            className="h-full bg-linear-to-r from-signal-glow via-proof-glow to-proof-glow shadow-[0_0_12px_rgb(242_127_189/0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <ol className="relative grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {roadmap.phases.map((phase, index) => {
            const isCurrent = index === currentIndex;
            const isPast = index < currentIndex;
            return (
              <li data-motion-reveal key={phase.name} className="flex flex-col">
                {/* Marker on the track */}
                <div className="mb-6 hidden h-3.5 items-center lg:flex" aria-hidden="true">
                  {isCurrent ? (
                    <span className="relative flex size-3.5">
                      <span className="absolute inset-0 rounded-full bg-proof-glow/50 motion-safe:animate-ping" />
                      <span className="relative size-full rounded-full border-2 border-[#07060d] bg-proof-glow shadow-[0_0_0_3px_rgb(242_127_189/0.25)]" />
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "size-2.5 rounded-full border",
                        isPast ? "border-signal-glow bg-signal-glow" : "border-white/25 bg-[#07060d]",
                      )}
                    />
                  )}
                </div>

                <article
                  className={cn(
                    "relative isolate flex flex-1 flex-col overflow-hidden rounded-panel p-6 sm:p-7",
                    isCurrent
                      ? "border border-proof-glow/30 bg-[linear-gradient(160deg,rgb(54_16_50/0.85),rgb(13_11_26/0.92)_65%)] shadow-[0_30px_80px_-40px_rgb(200_42_128/0.7),inset_0_1px_0_rgb(255_255_255/0.08)]"
                      : "panel",
                  )}
                >
                  {isCurrent && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-16 -top-20 -z-10 size-60 rounded-full bg-magenta/30 blur-[80px]"
                    />
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-mono text-[0.75rem] text-faint">{phase.period}</span>
                    {isCurrent && (
                      <span className="flex items-center gap-2 rounded-full border border-proof-glow/30 bg-proof-glow/10 px-2.5 py-0.5 text-[0.75rem] text-proof-ink">
                        <span className="soft-pulse size-1.5 rounded-full bg-proof-glow" aria-hidden="true" />
                        {roadmap.currentLabel}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-8 flex items-baseline gap-3 text-[1.375rem] font-medium tracking-[-0.02em]">
                    <span
                      className={cn("text-[0.875rem] tabular-nums", isCurrent ? "text-proof-ink" : "text-white/30")}
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {phase.name}
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {phase.items.map((item) => (
                      <li
                        key={item}
                        className={cn(
                          "flex gap-3 text-[0.9375rem] leading-relaxed",
                          isCurrent ? "text-night-text" : "text-muted-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-[0.6rem] size-1 shrink-0 rounded-full",
                            isCurrent ? "bg-proof-glow" : "bg-white/30",
                          )}
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
