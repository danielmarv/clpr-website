import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionHeading } from "@/components/SectionHeading";
import { voices } from "@/content/site";

export function Voices() {
  return (
    <section aria-labelledby={voices.id} className="shell py-24 lg:py-32">
      <SectionHeading id={voices.id} eyebrow={voices.eyebrow} title={voices.title} lead={voices.lead} />

      <ul className="mt-14 grid gap-4 lg:mt-20 lg:grid-cols-2">
        {voices.quotes.map((quote) => (
          <li key={quote.name} data-motion-reveal>
            <figure className="panel flex h-full flex-col p-7 sm:p-9">
              <span aria-hidden="true" className="font-serif text-[3.5rem] leading-[0.6] text-signal-glow/60">
                “
              </span>
              <blockquote className="mt-4 flex-1 text-[1.125rem] leading-[1.7] text-fg/90">{quote.text}</blockquote>
              <figcaption className="mt-8 border-t border-fg/[0.07] pt-5">
                <span className="block text-[0.9375rem] font-medium text-fg">{quote.name}</span>
                <span className="mt-1 block text-[0.8125rem] leading-relaxed text-muted-foreground">{quote.role}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <Link
        href={voices.source.href}
        data-motion-reveal
        className="group mt-8 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-signal-ink transition-colors hover:text-fg"
      >
        {voices.source.label}
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
      </Link>
    </section>
  );
}
