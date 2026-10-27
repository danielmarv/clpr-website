import { ArrowRight, ArrowUpRight, Code2, FileText, Network, type LucideIcon } from "lucide-react";

import { GitHubMark } from "@/components/GitHubMark";
import { SectionHeading } from "@/components/SectionHeading";
import { SpiralRibbon } from "@/components/SpiralRibbon";
import { Button } from "@/components/ui/button";
import { involvement, origins } from "@/content/site";

// One icon per path, in the order they appear in the content.
const pathIcons: LucideIcon[] = [FileText, Code2, Network];

export function GetInvolved() {
  return (
    <>
      <section aria-labelledby={involvement.id} data-form="community" className="shell py-20 lg:py-28">
        <SectionHeading
          id={involvement.id}
          eyebrow={involvement.eyebrow}
          title={involvement.title}
          lead={involvement.lead}
          illustrated
        />

        <ul className="mt-14 grid gap-3 md:grid-cols-3 lg:mt-20">
          {involvement.paths.map((path, index) => {
            const Icon = pathIcons[index] ?? FileText;
            return (
              <li data-motion-reveal key={path.name}>
                <a
                  href={path.href}
                  target="_blank"
                  rel="noreferrer"
                  data-spotlight
                  className="panel group flex h-full flex-col p-6 transition-transform duration-300 hover:-translate-y-0.5 sm:p-7"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-linear-to-b from-white/8 to-white/2 text-white">
                    <Icon className="size-[1.125rem]" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <h3 className="mt-8 text-[1.25rem] font-medium tracking-[-0.015em]">{path.name}</h3>
                  <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted-foreground">{path.body}</p>
                  <span className="mt-8 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-white">
                    {path.cta}
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        <p data-motion-reveal className="mt-10 max-w-[72ch] text-[0.9375rem] leading-relaxed text-faint">
          {origins.text}
        </p>
      </section>

      {/* Closing call to action, beside the CLPR spiral drawn as a ribbon of light. */}
      <section
        data-scene="outro"
        aria-labelledby="closing-title"
        className="shell grid min-h-[92svh] content-center items-center gap-8 pb-20 pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-6 lg:pb-24 lg:pt-24"
      >
        <SpiralRibbon className="mx-auto aspect-3/2 w-full max-w-[34rem] lg:order-2 lg:mx-0 lg:max-w-none lg:justify-self-end" />
        <div data-motion-reveal className="max-w-xl">
          <h2
            id="closing-title"
            className="text-headline text-[clamp(2.5rem,5.6vw,4.5rem)] font-medium leading-[1.04] tracking-[-0.045em] text-balance"
          >
            {involvement.closing.title}
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">{involvement.closing.body}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href={involvement.closing.primary.href} target="_blank" rel="noreferrer">
                {involvement.closing.primary.label}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href={involvement.closing.secondary.href} target="_blank" rel="noreferrer">
                <GitHubMark />
                {involvement.closing.secondary.label}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
