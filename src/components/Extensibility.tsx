import { RadioTower } from "lucide-react";

import { COMPONENT_ART } from "@/components/ComponentArt";
import { SectionHeading } from "@/components/SectionHeading";
import { extensibility } from "@/content/site";

export function Extensibility() {
  return (
    <section aria-labelledby={extensibility.id} data-form="globe" className="shell py-20 lg:py-28">
      <SectionHeading
        id={extensibility.id}
        eyebrow={extensibility.eyebrow}
        title={extensibility.title}
        lead={extensibility.lead}
        illustrated
      />

      <ul className="mt-14 grid gap-3 md:grid-cols-3 lg:mt-20">
        {extensibility.components.map((component, index) => {
          const Diagram = COMPONENT_ART[index];
          return (
            <li key={component.name} data-motion-reveal data-spotlight className="panel flex flex-col overflow-hidden">
              <div
                aria-hidden="true"
                className="h-48 bg-[radial-gradient(60%_70%_at_50%_50%,rgb(139_123_255/0.09),transparent_75%)] px-5 pt-5"
              >
                {Diagram && <Diagram />}
              </div>
              <div className="p-6 sm:p-7">
                <h3 className="text-[1.25rem] font-medium tracking-[-0.015em]">{component.name}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{component.body}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <div data-motion-reveal className="panel mt-3 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="flex items-center gap-3 text-[1.25rem] font-medium tracking-[-0.015em]">
            <span className="flex size-9 items-center justify-center rounded-xl border border-signal-glow/30 bg-signal-glow/10 text-signal-ink">
              <RadioTower className="size-4" aria-hidden="true" />
            </span>
            {extensibility.stepsTitle}
          </h3>
        </div>
        <ol className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/7 bg-white/7 sm:grid-cols-2 lg:grid-cols-4">
          {extensibility.steps.map((step, index) => (
            <li key={step} className="flex flex-col gap-3 bg-[#0c0b15] p-5">
              <span className="font-mono text-[0.75rem] text-signal-ink">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-[0.9375rem] leading-snug text-white/85">{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-[70ch] border-l border-proof-glow/60 pl-4 text-[0.9375rem] text-muted-foreground">
          {extensibility.footnote}
        </p>
      </div>
    </section>
  );
}
