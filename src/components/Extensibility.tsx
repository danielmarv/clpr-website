import { ArrowRight } from "lucide-react";

import { COMPONENT_ART } from "@/components/ComponentArt";
import { SectionHeading } from "@/components/SectionHeading";
import { extensibility } from "@/content/site";

export function Extensibility() {
  return (
    <section aria-labelledby={extensibility.id} className="shell py-24 lg:py-32">
      <SectionHeading id={extensibility.id} eyebrow={extensibility.eyebrow} title={extensibility.title} lead={extensibility.lead} split />

      <ul className="mt-14 grid gap-4 md:grid-cols-3 lg:mt-20">
        {extensibility.components.map((component, index) => {
          const Diagram = COMPONENT_ART[index];
          return (
            <li key={component.name} data-motion-reveal className="panel flex flex-col overflow-hidden">
              <div
                aria-hidden="true"
                className="h-48 border-b border-white/[0.06] bg-[radial-gradient(60%_70%_at_50%_50%,rgb(139_123_255/0.08),transparent_75%)] px-5 pt-5"
              >
                {Diagram && <Diagram />}
              </div>
              <div className="p-6 sm:p-7">
                <h3 className="text-[1.125rem] font-medium tracking-[-0.015em]">{component.name}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{component.body}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <div data-motion-reveal className="mt-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-12">
        <p className="max-w-[64ch] border-l border-proof-glow/50 pl-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
          {extensibility.footnote}
        </p>
        <a
          href={extensibility.explainer.href}
          className="group inline-flex shrink-0 items-center gap-2 text-[0.9375rem] font-medium text-signal-ink transition-colors hover:text-white"
        >
          {extensibility.explainer.label}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
