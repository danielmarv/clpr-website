import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { GitHubMark } from "@/components/GitHubMark";
import { SpiralRibbon } from "@/components/SpiralRibbon";
import { Button } from "@/components/ui/button";
import { involvement, origins } from "@/content/site";
import { isExternal } from "@/lib/utils";

export function GetInvolved() {
  const { actions } = involvement;
  return (
    <section data-scene="outro" aria-labelledby={involvement.id} className="shell py-24 lg:py-32">
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-6">
        <div data-motion-reveal className="max-w-xl">
          <p className="mb-4 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-signal-ink">{involvement.eyebrow}</p>
          <h2
            id={involvement.id}
            className="text-headline text-[clamp(2.25rem,4.6vw,3.5rem)] font-light leading-[1.08] tracking-[-0.035em] text-balance"
          >
            {involvement.title}
          </h2>
          <p className="mt-6 text-[1.0625rem] leading-[1.7] text-muted-foreground">{involvement.lead}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={actions.primary.href}>
                {actions.primary.label}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href={actions.secondary.href} target="_blank" rel="noreferrer">
                <GitHubMark />
                {actions.secondary.label}
              </a>
            </Button>
          </div>
        </div>
        <SpiralRibbon className="mx-auto aspect-3/2 w-full max-w-[34rem] max-lg:order-first lg:mx-0 lg:max-w-none lg:justify-self-end" />
      </div>

      <ul className="mt-16 grid gap-px overflow-hidden rounded-panel border border-fg/[0.07] bg-fg/[0.07] md:grid-cols-3 lg:mt-20">
        {involvement.paths.map((path) => {
          const external = isExternal(path.href);
          return (
            <li key={path.name} data-motion-reveal className="bg-background">
              <a
                href={path.href}
                {...(external && { target: "_blank", rel: "noreferrer" })}
                className="group flex h-full flex-col p-6 transition-colors duration-300 hover:bg-fg/[0.03] sm:p-7"
              >
                <h3 className="text-[1.125rem] font-medium tracking-[-0.015em]">{path.name}</h3>
                <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted-foreground">{path.body}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-signal-ink transition-colors group-hover:text-fg">
                  {path.cta}
                  {external ? (
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  ) : (
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                  )}
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      <p data-motion-reveal className="mt-8 max-w-[72ch] text-[0.875rem] leading-relaxed text-faint">
        {origins.text}
      </p>
    </section>
  );
}
