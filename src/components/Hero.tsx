import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { hero, links, origins } from "@/content/site";

// The CLPR spiral itself is drawn by the WebGL background (ProtocolField),
// which reads `data-scene="hero"` to know where it is.
export function Hero() {
  const titleStart = hero.title.slice(0, hero.title.length - hero.titleHighlight.length);

  return (
    <section data-scene="hero" aria-labelledby="hero-title" className="relative flex min-h-svh flex-col">
      <div className="shell flex flex-1 flex-col justify-center pb-14 pt-[48svh] sm:pt-[44svh] lg:pb-16 lg:pt-28">
        <div className="max-w-[40rem] lg:max-w-[50%]">
          <a
            data-hero-reveal
            href={hero.pill.href}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/4 py-1 pl-1 pr-3.5 text-[0.8125rem] text-white/80 backdrop-blur-md transition-colors hover:border-white/20 hover:text-white"
          >
            <span className="rounded-full bg-linear-to-r from-signal-glow to-proof-glow px-2 py-0.5 text-[0.6875rem] font-semibold text-night">
              {hero.pill.badge}
            </span>
            <span>{hero.pill.label}</span>
            <span className="h-3.5 w-px bg-white/15 max-sm:hidden" aria-hidden="true" />
            <span className="inline-flex items-center gap-1 text-white">
              <span className="max-sm:sr-only">{hero.pill.cta}</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </a>

          <h1
            id="hero-title"
            data-hero-reveal
            className="text-headline mt-8 text-[clamp(2.75rem,6vw,5rem)] font-medium leading-[1.02] tracking-[-0.045em] text-balance"
          >
            {titleStart}
            <span className="text-brand">{hero.titleHighlight}</span>
          </h1>
          <p data-hero-reveal className="mt-7 max-w-[54ch] text-[1.0625rem] leading-[1.7] text-muted-foreground sm:text-lg">
            {hero.lead}
          </p>

          <div data-hero-reveal className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href={hero.primaryCta.href} target="_blank" rel="noreferrer">
                {hero.primaryCta.label}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href={hero.secondaryCta.href}>{hero.secondaryCta.label}</a>
            </Button>
          </div>

        </div>
      </div>

      <div className="shell pb-8">
        <div data-hero-reveal className="flex flex-col gap-5 border-t border-white/6 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-md text-[0.8125rem] leading-relaxed text-faint">{origins.label}</p>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-4" aria-label="Contributing organizations">
            {origins.logos.map((logo) => (
              <li key={logo.name}>
                <a
                  href={logo.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-11 items-center opacity-55 transition-opacity hover:opacity-100 focus-visible:opacity-100"
                >
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    width={logo.width}
                    height={logo.height}
                    className={`${logo.className} brightness-0 invert`}
                  />
                </a>
              </li>
            ))}
            <li>
              <a
                href={links.lfdt}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center opacity-55 transition-opacity hover:opacity-100 focus-visible:opacity-100"
              >
                <Image
                  src="/logos/lfdt-horizontal-white.svg"
                  alt="LF Decentralized Trust"
                  width={698.7}
                  height={39.1}
                  className="h-3.5 w-auto"
                />
              </a>
            </li>
          </ul>
        </div>
        <a
          href="#story"
          className="mt-6 hidden items-center gap-3 text-[0.75rem] text-faint transition-colors hover:text-white lg:inline-flex"
        >
          <span className="relative h-8 w-px overflow-hidden bg-white/10" aria-hidden="true">
            <span className="scroll-cue absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-transparent via-signal-glow to-transparent" />
          </span>
          {hero.scrollCue}
        </a>
      </div>
    </section>
  );
}
