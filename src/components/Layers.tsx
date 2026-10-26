"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { SectionHeading } from "@/components/SectionHeading";
import { layers } from "@/content/site";
import { cn } from "@/lib/utils";

/*
 * The four protocol layers as a stack of plates in CSS 3D. The plates fan out
 * when the section scrolls into view; the list and the plates highlight each
 * other. The plates are decorative; the list carries the content.
 */
export function Layers() {
  const [active, setActive] = useState(0);
  const [collapsed, setCollapsed] = useState(true);
  const stack = useRef<HTMLDivElement>(null);

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

  const count = layers.items.length;

  return (
    <section aria-labelledby={layers.id} data-form="mesh" className="shell py-20 lg:py-28">
      <SectionHeading id={layers.id} eyebrow={layers.eyebrow} title={layers.title} lead={layers.lead} split />

      <div className="mt-14 grid gap-8 lg:mt-20 lg:grid-cols-12 lg:gap-12">
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
                  return (
                    <div
                      key={layer.name}
                      className={cn(
                        "layer-plate rounded-[1.25rem] border backdrop-blur-[2px]",
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
                      onPointerEnter={() => setActive(index)}
                    >
                      <span className="absolute inset-3 rounded-xl border border-white/6 bg-[linear-gradient(rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />
                      <span
                        className={cn(
                          "absolute bottom-3 left-4 text-[0.75rem] font-medium",
                          isActive || isApplication ? "text-white" : "text-white/50",
                        )}
                      >
                        {layer.name}
                      </span>
                      <span className="absolute right-4 top-3 font-mono text-[0.625rem] text-white/40">
                        L{count - index}
                      </span>
                    </div>
                  );
                })}

                {/* The Application API boundary, between the top plate and the rest. */}
                <div
                  className="layer-plate rounded-[1.25rem] border border-dashed border-proof-glow/60"
                  style={{ "--z": count - 1.5 } as CSSProperties}
                >
                  <span className="absolute bottom-2 right-4 whitespace-nowrap text-[0.5625rem] font-medium uppercase tracking-[0.14em] text-proof-glow">
                    {layers.apiNote}
                  </span>
                </div>

                {/* A message drops through the stack. */}
                <div
                  className="layer-plate pointer-events-none"
                  style={{ "--z": 0, transform: "none" } as CSSProperties}
                >
                  <span className="layer-message absolute left-1/2 top-1/2 size-2.5 rounded-full bg-white shadow-[0_0_14px_4px_rgb(157_139_255/0.9)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <ol className="flex flex-col gap-2 lg:col-span-6" aria-label="CLPR protocol layers, from top to bottom">
          {layers.items.map((layer, index) => {
            const isActive = index === active;
            return (
              <li key={layer.name} data-motion-reveal>
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActive(index)}
                  onPointerEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  className={cn(
                    "relative w-full rounded-2xl border px-5 py-5 text-left transition-[background-color,border-color] duration-300 sm:px-6",
                    isActive
                      ? "border-white/12 bg-white/[0.045]"
                      : "border-transparent hover:bg-white/2",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-y-5 left-0 w-px transition-opacity duration-300",
                      index === 0 ? "bg-proof-glow" : "bg-signal-glow",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex items-baseline gap-4">
                    <span className="font-mono text-[0.75rem] text-faint">L{count - index}</span>
                    <span className="flex-1">
                      <span className={cn("block text-[1.125rem] font-medium tracking-[-0.01em]", isActive ? "text-white" : "text-white/70")}>
                        {layer.name}
                      </span>
                      <span className="mt-2 block text-[0.9375rem] leading-relaxed text-muted-foreground">{layer.body}</span>
                      <span className="mt-3 flex flex-wrap gap-1.5">
                        {layer.terms.map((term) => (
                          <span
                            key={term}
                            className={cn(
                              "rounded-full border px-2.5 py-0.5 text-[0.75rem]",
                              isActive ? "border-signal-glow/35 text-signal-ink" : "border-white/10 text-white/55",
                            )}
                          >
                            {term}
                          </span>
                        ))}
                      </span>
                    </span>
                  </span>
                  {index === 0 && (
                    <span className="mt-4 flex items-center gap-2 pl-9 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-proof-glow">
                      <span className="h-px flex-1 border-t border-dashed border-proof-glow/50" aria-hidden="true" />
                      {layers.apiNote}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
