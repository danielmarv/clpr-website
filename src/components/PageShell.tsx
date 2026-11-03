import type { ReactNode } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteMotion } from "@/components/SiteMotion";
import { cn } from "@/lib/utils";

/** The frame of every page but the home page: header, content and footer, without the WebGL background. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <SiteMotion>
      <SiteHeader />
      <main id="main" className="relative z-10 overflow-x-clip pt-16">
        {children}
      </main>
      <SiteFooter />
    </SiteMotion>
  );
}

/** A page's opening, in the hero's type: the kicker pill, the title, the lead, then actions or chips. */
export function PageIntro({ kicker, title, lead, children }: { kicker: string; title: string; lead: string; children?: ReactNode }) {
  return (
    <section aria-labelledby="page-title" className="shell pb-14 pt-16 lg:pb-20 lg:pt-24">
      <p
        data-hero-reveal
        className="inline-flex items-center gap-2 rounded-full border border-fg/10 bg-fg/[0.03] py-1 pl-2.5 pr-3.5 text-[0.8125rem] text-muted-foreground"
      >
        <span className="size-1.5 rounded-full bg-signal-glow" aria-hidden="true" />
        {kicker}
      </p>
      <h1
        id="page-title"
        data-hero-reveal
        className="text-headline mt-6 max-w-[22ch] text-[clamp(2.25rem,4.6vw,3.75rem)] font-light leading-[1.06] tracking-[-0.04em] text-balance"
      >
        {title}
      </h1>
      <p data-hero-reveal className="mt-6 max-w-[60ch] text-[1.0625rem] leading-[1.7] text-muted-foreground sm:text-lg">
        {lead}
      </p>
      {children && (
        <div data-hero-reveal className="mt-8">
          {children}
        </div>
      )}
    </section>
  );
}

export function Chips({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <li key={item} className="rounded-full border border-fg/10 bg-fg/[0.03] px-3 py-1 text-[0.8125rem] text-fg/70">
          {item}
        </li>
      ))}
    </ul>
  );
}
