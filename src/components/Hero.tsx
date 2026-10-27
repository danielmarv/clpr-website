import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { HeroMesh } from "@/components/HeroMesh";
import { Button } from "@/components/ui/button";
import { hero, links, origins } from "@/content/site";

export function Hero() {
  return (
    <section data-scene="hero" aria-labelledby="hero-title" className="relative flex min-h-svh flex-col overflow-x-clip">
      <div className="shell grid flex-1 content-center items-center gap-6 pb-12 pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-4 lg:pb-14 lg:pt-24">
        <div className="relative z-10 max-w-[40rem] max-lg:order-2">
          <h1
            id="hero-title"
            data-hero-reveal
            className="text-headline text-[clamp(2.5rem,5vw,4.5rem)] font-light leading-[1.06] tracking-[-0.04em] text-balance"
          >
            {hero.title}
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

        <HeroMesh className="mx-auto aspect-square w-[min(86vw,40svh)] max-lg:order-1 lg:mx-0 lg:-mr-4 lg:w-[min(calc(100%_+_1rem),80svh)] lg:justify-self-end xl:-mr-8 xl:w-[min(calc(100%_+_2rem),80svh)] min-[85rem]:-mr-20 min-[85rem]:w-[min(calc(100%_+_5rem),80svh)]" />
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
