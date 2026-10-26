import type { ReactNode } from "react";

import { SectionHeading } from "@/components/SectionHeading";
import { guarantees } from "@/content/site";

type Visual = (typeof guarantees.items)[number]["visual"];

export function Guarantees() {
  return (
    <section aria-labelledby={guarantees.id} data-form="chain" className="shell py-20 lg:py-28">
      <SectionHeading
        id={guarantees.id}
        eyebrow={guarantees.eyebrow}
        title={guarantees.title}
        lead={guarantees.lead}
        illustrated
      />

      <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
        {guarantees.items.map((item) => (
          <li key={item.name} data-motion-reveal data-spotlight className="panel flex flex-col overflow-hidden">
            <div className="bg-dots relative h-40 border-b border-white/6" aria-hidden="true">
              <div className="absolute inset-0 bg-linear-to-b from-transparent to-[#0b0a13]/70" />
              <div className="relative flex h-full items-center justify-center px-6">{visuals[item.visual]}</div>
            </div>
            <div className="p-6">
              <h3 className="text-[1.0625rem] font-medium tracking-[-0.01em] text-white">{item.name}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* Small diagrams, one per guarantee. Decorative: the text carries the meaning. */

const mono = "font-mono text-[0.625rem]";

const visuals: Record<Visual, ReactNode> = {
  order: (
    <div className="flex items-center">
      {["9f3a", "41be", "c07e"].map((hash, index) => (
        <div key={hash} className="flex items-center">
          {index > 0 && (
            <svg width="28" height="8" viewBox="0 0 28 8" className="text-signal-glow">
              <line x1="0" y1="4" x2="28" y2="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" className="dash-flow" />
            </svg>
          )}
          <div className="rounded-lg border border-signal-glow/30 bg-signal-glow/7 px-2.5 py-2 text-center">
            <p className={`${mono} text-white/85`}>#{1041 + index}</p>
            <p className={`${mono} mt-0.5 text-signal-ink/70`}>{hash}…</p>
          </div>
        </div>
      ))}
    </div>
  ),
  response: (
    <svg viewBox="0 0 240 96" className="h-28 w-full max-w-[15rem]" fill="none">
      <circle cx="28" cy="48" r="18" stroke="rgb(157 139 255 / 0.5)" />
      <text x="28" y="52" textAnchor="middle" className="fill-white/80 font-mono text-[11px]">A</text>
      <circle cx="212" cy="48" r="18" stroke="rgb(242 127 189 / 0.5)" />
      <text x="212" y="52" textAnchor="middle" className="fill-white/80 font-mono text-[11px]">B</text>
      <path d="M50 38 C 100 14, 140 14, 190 38" stroke="var(--signal-glow)" strokeWidth="1.5" strokeDasharray="4 4" className="dash-flow" />
      <path d="M190 58 C 140 82, 100 82, 50 58" stroke="var(--proof-glow)" strokeWidth="1.5" strokeDasharray="4 4" className="dash-flow" />
      <rect x="99" y="35" width="42" height="26" rx="13" fill="#0b0a13" stroke="rgb(255 255 255 / 0.15)" />
      <text x="120" y="52" textAnchor="middle" className="fill-white font-mono text-[11px]">1 : 1</text>
    </svg>
  ),
  custody: (
    <div className="flex items-center gap-4">
      <div className="flex size-20 flex-col items-center justify-center rounded-2xl border border-dashed border-white/20">
        <span className="text-[2rem] font-light leading-none text-white">0</span>
        <span className={`${mono} mt-1 text-white/45`}>held</span>
      </div>
      <div className="space-y-1.5">
        {["No pooled assets", "No multisig keys", "No lock-up"].map((line) => (
          <p key={line} className="flex items-center gap-2 text-[0.75rem] text-white/60">
            <span className="size-1 rounded-full bg-proof-glow" />
            {line}
          </p>
        ))}
      </div>
    </div>
  ),
  delivery: (
    <svg viewBox="0 0 240 96" className="h-28 w-full max-w-[15rem]" fill="none">
      <rect x="8" y="10" width="78" height="28" rx="8" stroke="rgb(255 255 255 / 0.12)" strokeDasharray="3 3" />
      <text x="47" y="28" textAnchor="middle" className="fill-white/35 text-[10px]">Endpoint offline</text>
      <rect x="8" y="58" width="78" height="28" rx="8" stroke="var(--signal-glow)" fill="rgb(157 139 255 / 0.08)" />
      <text x="47" y="76" textAnchor="middle" className="fill-white text-[10px]">Anyone</text>
      <path d="M90 72 C 130 72, 140 48, 172 48" stroke="var(--signal-glow)" strokeWidth="1.5" strokeDasharray="4 4" className="dash-flow" />
      <path d="M90 24 L 120 24" stroke="rgb(255 255 255 / 0.12)" />
      <circle cx="200" cy="48" r="22" stroke="rgb(242 127 189 / 0.5)" />
      <text x="200" y="52" textAnchor="middle" className="fill-white/80 font-mono text-[11px]">B</text>
    </svg>
  ),
  payload: (
    <div className="flex max-w-[16rem] flex-wrap justify-center gap-1.5">
      {["data", "oracle feed", "contract call", "asset transfer", "0x7f…e3", "any bytes"].map((chip, index) => (
        <span
          key={chip}
          className={`rounded-full border px-2.5 py-1 text-[0.6875rem] ${
            index % 3 === 0
              ? "border-signal-glow/30 bg-signal-glow/7 text-signal-ink"
              : index % 3 === 1
                ? "border-white/10 bg-white/3 text-white/70"
                : "border-proof-glow/25 bg-proof-glow/6 text-proof-ink"
          }`}
        >
          {chip}
        </span>
      ))}
    </div>
  ),
  speed: (
    <div className="w-full max-w-[15rem] space-y-2.5">
      {[
        { label: "Bridge", segments: ["A", "bridge", "bridge", "B"] },
        { label: "CLPR", segments: ["A", "B"] },
      ].map((row) => (
        <div key={row.label}>
          <p className={`${mono} mb-1 ${row.label === "CLPR" ? "text-white/80" : "text-white/40"}`}>{row.label}</p>
          <div className="flex gap-1">
            {row.segments.map((segment, index) => (
              <span
                key={index}
                className={`h-2 rounded-full ${
                  segment === "bridge"
                    ? "w-14 bg-white/10"
                    : segment === "A"
                      ? "w-12 bg-signal-glow/70"
                      : "w-12 bg-proof-glow/70"
                }`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};
