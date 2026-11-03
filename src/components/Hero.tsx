import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { HeroMesh } from "@/components/HeroMesh";
import { Button } from "@/components/ui/button";
import { hero, links, origins } from "@/content/site";

export function Hero() {
  return (
    <section data-scene="hero" aria-labelledby="hero-title" className="relative flex min-h-svh flex-col overflow-x-clip">
      <div className="shell grid flex-1 content-center items-center gap-6 pb-12 pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-4 lg:pb-14 lg:pt-24">
        <div className="relative z-10 max-w-[40rem] max-lg:order-2">
          <p
            data-hero-reveal
            className="inline-flex items-center gap-2 rounded-full border border-fg/10 bg-fg/[0.03] py-1 pl-2.5 pr-3.5 text-[0.8125rem] text-muted-foreground"
          >
            <span className="size-1.5 rounded-full bg-signal-glow" aria-hidden="true" />
            {hero.eyebrow}
          </p>
          <h1
            id="hero-title"
            data-hero-reveal
            className="text-headline mt-7 text-[clamp(2.5rem,5.2vw,4.25rem)] font-light leading-[1.05] tracking-[-0.04em] text-balance"
          >
            {hero.title}
          </h1>
          <p data-hero-reveal className="mt-6 max-w-[52ch] text-[1.0625rem] leading-[1.7] text-muted-foreground sm:text-lg">
            {hero.lead}
          </p>

          <div data-hero-reveal className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href={hero.primaryCta.href}>
                {hero.primaryCta.label}
                <ArrowRight aria-hidden="true" />
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href={hero.secondaryCta.href} target="_blank" rel="noreferrer">
                {hero.secondaryCta.label}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>

        <HeroMesh className="mx-auto aspect-square w-[min(86vw,40svh)] max-lg:order-1 lg:mx-0 lg:-mr-4 lg:w-[min(calc(100%_+_1rem),80svh)] lg:justify-self-end xl:-mr-8 xl:w-[min(calc(100%_+_2rem),80svh)] min-[85rem]:-mr-20 min-[85rem]:w-[min(calc(100%_+_5rem),80svh)]" />
      </div>

      <div className="shell pb-10">
        <div data-hero-reveal className="flex flex-col gap-5 border-t border-fg/[0.07] pt-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-md text-[0.8125rem] leading-relaxed text-faint">{origins.label}</p>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-4" aria-label="Organizations behind CLPR">
            {origins.logos.map((logo) => (
              <li key={logo.name}>
                <a
                  href={logo.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-11 items-center opacity-50 transition-opacity hover:opacity-100 focus-visible:opacity-100"
                >
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    width={logo.width}
                    height={logo.height}
                    className={`${logo.className} brightness-0 dark:invert`}
                  />
                </a>
              </li>
            ))}
            <li>
              <a
                href={links.lfdt}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center opacity-50 transition-opacity hover:opacity-100 focus-visible:opacity-100"
              >
                <Image
                  src="/logos/lfdt-horizontal-white.svg"
                  alt="LF Decentralized Trust"
                  width={698.7}
                  height={39.1}
                  className="h-3.5 w-auto brightness-0 dark:brightness-100"
                />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
