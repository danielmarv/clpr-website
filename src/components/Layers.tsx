"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";

import { LAYER_ART } from "@/components/LayerArt";
import { SectionHeading } from "@/components/SectionHeading";
import { layers } from "@/content/site";
import { showTerm, TERM_BY_NAME } from "@/lib/glossary";
import { cn } from "@/lib/utils";

// The plates are decorative; the list beside them carries the content.
export function Layers() {
  const [active, setActive] = useState(0);
  const [collapsed, setCollapsed] = useState(true);
  const stack = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const element = stack.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setCollapsed(false);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // The layer crossing a line just above the middle of the screen is the one being read.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const reading = entries.find((entry) => entry.isIntersecting);
        if (!reading) return;
        const index = items.current.indexOf(reading.target as HTMLLIElement);
        if (index >= 0) setActive(index);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    items.current.forEach((item) => item && observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const count = layers.items.length;
  const read = (index: number) => {
    setActive(index);
    items.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section aria-labelledby={layers.id} data-form="mesh" className="shell py-20 lg:py-28">
      <SectionHeading id={layers.id} eyebrow={layers.eyebrow} title={layers.title} lead={layers.lead} split />

      <div className="mt-14 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
        <div data-form-slot className="lg:sticky lg:top-24 lg:col-span-6 lg:self-start">
          <div
            ref={stack}
            data-collapsed={collapsed}
            aria-hidden="true"
            className="layer-stack relative mx-auto aspect-[1/0.9] w-full max-w-[36rem] [--spread:44px] sm:[--spread:64px]"
          >
            <div className="absolute inset-[24%_20%_28%]">
              <div className="layer-stack-inner size-full">
                {layers.items.map((layer, index) => {
                  const z = count - 1 - index;
                  const isActive = index === active;
                  const isApplication = index === 0;
                  const Art = LAYER_ART[index];
                  return (
                    <div
                      key={layer.name}
                      className={cn(
                        "layer-plate cursor-pointer rounded-[1.25rem] border backdrop-blur-[2px]",
                        index < active && "opacity-25",
                        isApplication
                          ? "border-white/30 bg-[linear-gradient(135deg,rgb(99_70_255/0.55),rgb(117_34_112/0.5)_60%,rgb(200_42_128/0.55))]"
                          : "border-white/20 bg-[linear-gradient(135deg,rgb(60_52_110/0.45),rgb(22_20_40/0.6))]",
                        isActive &&
                          (isApplication
                            ? "border-white/60 shadow-[0_0_70px_-10px_rgb(200_42_128/0.85)]"
                            : "border-signal-glow/80 bg-[linear-gradient(135deg,rgb(99_80_230/0.55),rgb(40_30_92/0.6))] shadow-[0_0_60px_-12px_rgb(157_139_255/0.95)]"),
                      )}
                      style={{ "--z": z } as CSSProperties}
                      data-active={isActive}
                      onClick={() => read(index)}
                    >
                      <span className="absolute inset-3 rounded-xl border border-white/6 bg-[linear-gradient(rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />
                      {Art && (
                        <span
                          className={cn(
                            "absolute inset-[10%_8%_14%] transition-opacity duration-500",
                            isActive ? "opacity-100" : "opacity-30",
                          )}
                        >
                          <Art />
                        </span>
                      )}
                      <span
                        className={cn(
                          "absolute bottom-3 left-4 text-[0.75rem] font-medium",
                          isActive || isApplication ? "text-white" : "text-white/50",
                        )}
                      >
                        {layer.name}
                      </span>
                      <span className="absolute right-4 top-3 font-mono text-[0.625rem] text-white/40">L{count - index}</span>
                    </div>
                  );
                })}

                {/* The Application API boundary, between the top plate and the rest. */}
                <div
                  className="layer-plate rounded-[1.25rem] border border-dashed border-proof-glow/60"
                  style={{ "--z": count - 1.5 } as CSSProperties}
                >
                  <span className="absolute bottom-2 right-4 whitespace-nowrap text-[0.6875rem] font-medium text-proof-glow">
                    {layers.apiNote}
                  </span>
                </div>

                <div className="layer-plate pointer-events-none" style={{ "--z": 0, transform: "none" } as CSSProperties}>
                  <span className="layer-message absolute left-1/2 top-1/2 size-2.5 rounded-full bg-white shadow-[0_0_14px_4px_rgb(157_139_255/0.9)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <ol className="flex flex-col gap-2 lg:col-span-6 lg:pb-[18svh]" aria-label={layers.listLabel}>
          {layers.items.map((layer, index) => {
            const isActive = index === active;
            return (
              <li
                key={layer.name}
                ref={(element) => {
                  items.current[index] = element;
                }}
                className="lg:flex lg:min-h-[44svh] lg:flex-col lg:justify-center"
              >
                <article
                  data-motion-reveal
                  className={cn(
                    "relative rounded-2xl border px-5 py-6 transition-[background-color,border-color,opacity] duration-500 sm:px-7",
                    isActive ? "border-white/12 bg-white/[0.045]" : "border-transparent lg:opacity-45",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-y-6 left-0 w-px transition-opacity duration-500",
                      index === 0 ? "bg-proof-glow" : "bg-signal-glow",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <p className="font-mono text-[0.75rem] text-faint">L{count - index}</p>
                  <h3 className="mt-2 text-[1.5rem] font-medium tracking-[-0.02em] text-white">{layer.name}</h3>
                  <p className="mt-3 max-w-[52ch] text-[1rem] leading-relaxed text-muted-foreground">{layer.body}</p>
                  <ul className="mt-5 flex flex-wrap gap-1.5" aria-label={layers.termsLabel}>
                    {layer.terms.map((term) => {
                      const defined = TERM_BY_NAME.has(term.toLowerCase());
                      const chip = cn(
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[0.8125rem] transition-colors",
                        isActive ? "border-signal-glow/35 text-signal-ink" : "border-white/10 text-white/60",
                      );
                      return (
                        <li key={term}>
                          {defined ? (
                            <a
                              href={`#${layers.glossaryId}`}
                              onClick={(event) => {
                                event.preventDefault();
                                showTerm(term);
                              }}
                              className={cn(chip, "hover:border-signal-glow/60 hover:text-white")}
                            >
                              {term}
                              <ArrowUpRight className="size-3 opacity-60" aria-hidden="true" />
                            </a>
                          ) : (
                            <span className={chip}>{term}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {index === 0 && (
                    <p className="mt-6 flex items-center gap-3 text-[0.8125rem] font-medium text-proof-glow">
                      <span className="h-px flex-1 border-t border-dashed border-proof-glow/50" aria-hidden="true" />
                      {layers.apiNote}
                    </p>
                  )}
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
