import type { ReactNode } from "react";
import { BadgeCheck, KeyRound, Layers3, RadioTower } from "lucide-react";

import { SectionHeading } from "@/components/SectionHeading";
import { extensibility } from "@/content/site";

// One illustration per component, in the order they appear in the content.
const illustrations: ReactNode[] = [
  // CLPR Service: an ordered queue that routes to applications.
  <div key="service" className="w-full max-w-[14rem] space-y-1.5">
    {["#1041", "#1042", "#1043"].map((id, index) => (
      <div
        key={id}
        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/3 px-3 py-1.5"
        style={{ opacity: 1 - index * 0.22 }}
      >
        <span className="font-mono text-[0.625rem] text-white/75">{id}</span>
        <span className="h-1 w-12 rounded-full bg-linear-to-r from-signal-glow/70 to-signal-glow/10" />
        <Layers3 className="size-3 text-signal-ink" aria-hidden="true" />
      </div>
    ))}
  </div>,
  // CLPR Endpoints: two peers syncing bundles.
  <svg key="endpoints" viewBox="0 0 240 96" className="h-28 w-full max-w-[15rem]" fill="none" aria-hidden="true">
    <rect x="8" y="28" width="64" height="40" rx="10" stroke="rgb(157 139 255 / 0.5)" fill="rgb(157 139 255 / 0.06)" />
    <text x="40" y="52" textAnchor="middle" className="fill-white/80 text-[10px]">Endpoint</text>
    <rect x="168" y="28" width="64" height="40" rx="10" stroke="rgb(242 127 189 / 0.5)" fill="rgb(242 127 189 / 0.06)" />
    <text x="200" y="52" textAnchor="middle" className="fill-white/80 text-[10px]">Endpoint</text>
    <path d="M76 40 H 164" stroke="var(--signal-glow)" strokeWidth="1.5" strokeDasharray="4 4" className="dash-flow" />
    <path d="M164 56 H 76" stroke="var(--proof-glow)" strokeWidth="1.5" strokeDasharray="4 4" className="dash-flow" />
    <text x="120" y="22" textAnchor="middle" className="fill-white/40 font-mono text-[9px]">bundle sync</text>
    <text x="120" y="82" textAnchor="middle" className="fill-white/40 font-mono text-[9px]">trust-anchor updates</text>
  </svg>,
  // Verifier Contracts: a proof checked against a trust anchor.
  <div key="verifier" className="flex items-center gap-3">
    <span className="flex items-center gap-1.5 rounded-full border border-proof-glow/35 bg-proof-glow/8 px-3 py-1.5 text-[0.6875rem] text-proof-ink">
      <BadgeCheck className="size-3.5" aria-hidden="true" />
      State proof
    </span>
    <svg width="34" height="8" viewBox="0 0 34 8" aria-hidden="true">
      <line x1="0" y1="4" x2="34" y2="4" stroke="var(--proof-glow)" strokeWidth="1.5" strokeDasharray="3 3" className="dash-flow" />
    </svg>
    <span className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/4 px-3 py-1.5 text-[0.6875rem] text-white/75">
      <KeyRound className="size-3.5 text-signal-ink" aria-hidden="true" />
      Trust anchor
    </span>
  </div>,
];

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
        {extensibility.components.map((component, index) => (
          <li key={component.name} data-motion-reveal data-spotlight className="panel flex flex-col overflow-hidden">
            <div className="bg-dots flex h-40 items-center justify-center border-b border-white/6 px-6" aria-hidden="true">
              {illustrations[index]}
            </div>
            <div className="p-6 sm:p-7">
              <h3 className="text-[1.25rem] font-medium tracking-[-0.015em]">{component.name}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{component.body}</p>
            </div>
          </li>
        ))}
      </ul>

      <div data-motion-reveal className="panel mt-3 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="flex items-center gap-3 text-[1.25rem] font-medium tracking-[-0.015em]">
            <span className="flex size-9 items-center justify-center rounded-xl border border-signal-glow/30 bg-signal-glow/10 text-signal-ink">
              <RadioTower className="size-4" aria-hidden="true" />
            </span>
            {extensibility.stepsTitle}
          </h3>
          <p className="font-mono text-[0.75rem] text-faint">{extensibility.steps.length} steps</p>
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
