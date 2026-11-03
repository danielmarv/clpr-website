"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";

import { SectionHeading } from "@/components/SectionHeading";
import { voices } from "@/content/site";
import { cn, format } from "@/lib/utils";

/** As long as a quote stays before the next one comes, on hiero.org. */
const AUTO_ADVANCE_MS = 10_000;

// Community voices after the Hiero website's (src/components/QuotesCarousel there): one quote at a time on
// the brand's colours, the speaker's organization beside it, moving on by itself every ten seconds unless
// it is paused or the pointer or focus is on it.
export function Voices() {
  const { quotes, carousel } = voices;
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "previous">("next");
  const [playing, setPlaying] = useState(true);
  const [held, setHeld] = useState(false);
  const quote = quotes[index];

  useEffect(() => {
    if (!playing || held || quotes.length < 2) return;
    const timer = window.setTimeout(() => {
      setDirection("next");
      setIndex((current) => (current + 1) % quotes.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [index, playing, held, quotes.length]);

  const step = (by: 1 | -1) => {
    setDirection(by === 1 ? "next" : "previous");
    setIndex((current) => (current + by + quotes.length) % quotes.length);
  };

  return (
    <section aria-labelledby={voices.id} className="shell py-24 lg:py-32">
      <SectionHeading id={voices.id} eyebrow={voices.eyebrow} title={voices.title} lead={voices.lead} split />

      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={carousel.label}
        data-motion-reveal
        className="mt-14 lg:mt-20"
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
        onFocusCapture={() => setHeld(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHeld(false);
        }}
      >
        {/* Announced only while the reader drives it, not on every automatic turn. */}
        <div aria-live={playing && !held ? "off" : "polite"} aria-atomic="true">
          <article
            key={quote.name}
            aria-roledescription="slide"
            data-direction={direction}
            className="voices-slide relative isolate grid overflow-hidden rounded-[clamp(1.5rem,3vw,2.25rem)] bg-[#211271] text-white shadow-[0_28px_70px_rgb(18_15_44/0.18)] lg:grid-cols-[minmax(13rem,0.32fr)_minmax(0,0.68fr)]"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[radial-gradient(38rem_30rem_at_92%_8%,rgb(255_255_255/0.12),transparent_70%),radial-gradient(circle_at_18%_110%,rgb(200_42_128/0.55),transparent_50%),linear-gradient(115deg,#0d0b1f_0%,#211271_55%,#4a1a6e_100%)]"
            />
            {/* A partial ring gives the field depth without another image beside the logo. */}
            <span aria-hidden="true" className="pointer-events-none absolute -right-28 -top-36 -z-10 size-80 rounded-full border border-white/12" />

            <div className="flex min-h-44 flex-col justify-between gap-10 border-b border-white/15 bg-black/15 p-[clamp(1.75rem,4vw,3.5rem)] lg:min-h-[30rem] lg:border-b-0 lg:border-r">
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-white/75">{carousel.logoLabel}</span>
              <Image
                src={quote.logo.src}
                alt={quote.logo.name}
                width={quote.logo.width}
                height={quote.logo.height}
                className={cn("w-auto max-w-[12rem] object-contain object-left", quote.logo.className)}
              />
            </div>

            <blockquote className="relative m-0 max-w-[62rem] p-[clamp(1.75rem,5vw,4.75rem)]">
              <span aria-hidden="true" className="block font-serif text-[5rem] leading-[0.6] text-white/70">
                “
              </span>
              <p className="mt-6 text-pretty text-[clamp(1.0625rem,1.55vw,1.5rem)] leading-[1.55] tracking-[-0.022em] text-white">
                {quote.text}
              </p>
              <footer className="mt-[clamp(1.75rem,3vw,2.5rem)] max-w-[48rem] text-[0.9375rem] leading-[1.55] text-white/85">
                <span className="font-medium text-white">{quote.name}</span>, {quote.role}
              </footer>
            </blockquote>
          </article>
        </div>

        {quotes.length > 1 && (
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-faint">{carousel.perspectives}</p>
              <p role="status" aria-live="polite" className="sr-only">
                {format(carousel.status, { index: index + 1, total: quotes.length })}
              </p>
              <div aria-hidden="true" className="flex items-center gap-1.5">
                {quotes.map((item, position) => (
                  <span
                    key={item.name}
                    className={cn(
                      "h-1 rounded-full transition-[background-color,width] duration-300 ease-out motion-reduce:transition-none",
                      position === index ? "w-9 bg-signal-glow" : "w-4 bg-fg/15",
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Control
                label={playing ? carousel.pauseLabel : carousel.playLabel}
                pressed={!playing}
                onClick={() => setPlaying((value) => !value)}
              >
                {playing ? <Pause className="size-3.5" aria-hidden="true" /> : <Play className="size-3.5" aria-hidden="true" />}
                {playing ? carousel.pause : carousel.play}
              </Control>
              <Control label={carousel.previousLabel} onClick={() => step(-1)}>
                <ArrowLeft className="size-4" aria-hidden="true" />
                {carousel.previous}
              </Control>
              <Control label={carousel.nextLabel} onClick={() => step(1)} primary>
                {carousel.next}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Control>
            </div>
          </div>
        )}
      </div>

      <Link
        href={voices.source.href}
        className="group mt-10 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-signal-ink transition-colors hover:text-fg"
      >
        {voices.source.label}
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
      </Link>
    </section>
  );
}

function Control({
  label,
  pressed,
  primary = false,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  primary?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center gap-2.5 rounded-full border px-5 text-[0.875rem] font-medium transition-colors duration-200 motion-reduce:transition-none",
        primary
          ? "border-fg bg-fg text-background hover:bg-fg/85"
          : "border-fg/20 text-fg hover:border-fg/40 hover:bg-fg/[0.05]",
      )}
    >
      {children}
    </button>
  );
}
