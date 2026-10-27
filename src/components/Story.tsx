"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { StoryStage } from "@/components/StoryStage";
import { story } from "@/content/site";
import { cn } from "@/lib/utils";

// Scroll progress at which each phase starts: statement, ledgers, Channel, proofs. StoryStage reads the same progress.
const PHASE_STARTS = [0, 0.3, 0.54, 0.76];
const REVEAL_END = 0.22;

function progressOf(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  return Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - window.innerHeight)));
}

export function Story() {
  const section = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState(0);
  const words = story.statement.split(" ");

  useEffect(() => {
    const element = section.current;
    if (!element) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const progress = progressOf(element);
      element.style.setProperty("--reveal", String(Math.min(1, progress / REVEAL_END)));
      let next = 0;
      PHASE_STARTS.forEach((start, index) => {
        if (progress >= start) next = index;
      });
      setPhase(next);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const jumpTo = (index: number) => {
    const element = section.current;
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY;
    const travel = element.offsetHeight - window.innerHeight;
    // Land a little inside the phase so its chapter is fully shown.
    window.scrollTo({ top: top + travel * (PHASE_STARTS[index + 1] + 0.06) });
  };

  return (
    <section
      ref={section}
      id={story.id}
      data-scene="story"
      aria-labelledby="story-title"
      className="relative h-[420svh]"
      style={{ "--words": words.length } as CSSProperties}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <StoryStage />

        <h2 id="story-title" className="sr-only">
          {story.label}
        </h2>

        <div
          className="story-chapter shell absolute inset-x-0 top-1/2 -translate-y-1/2"
          data-active={phase === 0}
        >
          <p className="max-w-[20ch] text-[clamp(2rem,5vw,4.25rem)] font-light leading-[1.1] tracking-[-0.035em] text-white">
            {words.map((word, index) => (
              <span key={index} className="story-word" style={{ "--i": index } as CSSProperties}>
                {word}{" "}
              </span>
            ))}
          </p>
        </div>

        {[
          { ledger: story.ledgerA, prefix: "ledger-a", tone: "bg-signal-glow" },
          { ledger: story.ledgerB, prefix: "ledger-b", tone: "bg-proof-glow" },
        ].map(({ ledger, prefix, tone }) => (
          <div
            key={prefix}
            data-ledger-label
            aria-hidden="true"
            className="story-chapter absolute -translate-x-1/2 whitespace-nowrap text-center"
            data-active={phase >= 1}
            style={{
              left: `var(--${prefix}-x, 25%)`,
              top: `calc(var(--${prefix}-y, 40%) + var(--ledger-r, 80px) * 1.18)`,
            }}
          >
            <p className="inline-flex items-center gap-2 text-[0.9375rem] font-medium text-white">
              <span className={cn("size-1.5 rounded-full", tone)} />
              {ledger.name}
            </p>
            <p className="mt-0.5 text-[0.75rem] text-faint">{ledger.role}</p>
          </div>
        ))}

        <div className="shell absolute inset-x-0 bottom-[5svh]">
          <div className="mx-auto grid max-w-2xl text-center">
            {story.chapters.map((chapter, index) => (
              <div
                key={chapter.name}
                className="story-chapter [grid-area:1/1]"
                data-active={phase === index + 1}
              >
                <p className="font-mono text-[0.75rem] text-signal-ink">
                  {chapter.index} <span className="text-faint">/ 03</span>
                </p>
                <h3 className="text-headline mt-3 text-[clamp(1.7rem,3.4vw,2.6rem)] font-light leading-[1.12] tracking-[-0.03em]">
                  {chapter.title}
                </h3>
                <p className="mx-auto mt-4 max-w-[52ch] text-[1rem] leading-[1.7] text-muted-foreground sm:text-[1.0625rem]">
                  {chapter.body}
                </p>
              </div>
            ))}
          </div>

          <ol className="mx-auto mt-8 flex max-w-md items-center gap-2" aria-label={story.label}>
            {story.chapters.map((chapter, index) => {
              const active = phase === index + 1;
              const done = phase > index + 1;
              return (
                <li key={chapter.name} className="flex-1">
                  <button
                    type="button"
                    onClick={() => jumpTo(index)}
                    aria-current={active ? "step" : undefined}
                    className="group flex w-full flex-col gap-2 py-2 text-left"
                  >
                    <span className="block h-0.5 w-full overflow-hidden rounded-full bg-white/10">
                      <span
                        className={cn(
                          "block h-full rounded-full bg-linear-to-r from-signal-glow to-proof-glow transition-transform duration-700 ease-out-expo origin-left",
                          active || done ? "scale-x-100" : "scale-x-0",
                        )}
                      />
                    </span>
                    <span
                      className={cn(
                        "text-[0.75rem] transition-colors",
                        active ? "text-white" : "text-faint group-hover:text-white/80",
                      )}
                    >
                      {chapter.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
