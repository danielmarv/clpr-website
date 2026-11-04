import { ArrowRight } from "lucide-react";

import { SectionHeading } from "@/components/SectionHeading";
import { USE_CASE_ART } from "@/components/UseCaseArt";
import { useCases } from "@/content/site";

function ExplainerLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-2 text-[0.9375rem] font-medium text-signal-ink transition-colors hover:text-fg"
    >
      {label}
      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
    </a>
  );
}

export function UseCases() {
  const { limits } = useCases;
  return (
    <section aria-labelledby={useCases.id} className="shell py-24 lg:py-32">
      <SectionHeading id={useCases.id} eyebrow={useCases.eyebrow} title={useCases.title} lead={useCases.lead} split />

      <ol className="mt-14 grid gap-4 md:grid-cols-2 lg:mt-20">
        {useCases.patterns.map((pattern, index) => {
          const Diagram = USE_CASE_ART[index];
          return (
            <li key={pattern.name} data-motion-reveal className="panel flex flex-col overflow-hidden">
              <div
                aria-hidden="true"
                className="h-48 border-b border-fg/[0.06] bg-[radial-gradient(60%_70%_at_50%_50%,rgb(139_123_255/0.08),transparent_75%)] px-5 pt-5"
              >
                {Diagram && <Diagram />}
              </div>
              <div className="p-6 sm:p-7">
                <h3 className="flex items-baseline gap-3 text-[1.125rem] font-medium tracking-[-0.015em]">
                  <span className="font-mono text-[0.75rem] font-normal text-signal-ink">{String(index + 1).padStart(2, "0")}</span>
                  {pattern.name}
                </h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{pattern.body}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div data-motion-reveal className="mt-6">
        <ExplainerLink {...useCases.explainer} />
      </div>

      <div data-motion-reveal className="mt-16 border-t border-fg/[0.07] pt-10 lg:mt-20">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
          <h3 className="text-[1.25rem] font-medium tracking-[-0.02em]">{limits.title}</h3>
          <ExplainerLink {...limits.explainer} />
        </div>
        <dl className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
          {limits.items.map((limit) => (
            <div key={limit.name} className="border-l border-proof-glow/50 pl-4">
              <dt className="text-[1rem] font-medium tracking-[-0.01em]">{limit.name}</dt>
              <dd className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{limit.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
