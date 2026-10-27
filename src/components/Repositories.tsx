import { ArrowUpRight } from "lucide-react";

import { ClprMark } from "@/components/ClprMark";
import { CopyCommand } from "@/components/CopyCommand";
import { fibre, TONES } from "@/components/fibreSvg";
import { GitHubMark } from "@/components/GitHubMark";
import { SectionHeading } from "@/components/SectionHeading";
import { TermIcon } from "@/components/TermArt";
import { repositories } from "@/content/site";

function repoPath(href: string): string {
  return href.replace(/^https:\/\/(github\.com\/)?/, "");
}

// The glossary's icons for the components the implementations cover.
const COMPONENT_TERMS = { service: "CLPR Service", endpoint: "CLPR Endpoint", verifier: "Verifier Contract" } as const;

/** Fibres from the specification down to each of the three implementations. */
function ImplementedBy() {
  const from = { x: 600, y: 0 };
  const ends = [200, 600, 1000].map((x) => ({ x, y: 72 }));
  return (
    <div aria-hidden="true" className="relative hidden h-[4.5rem] lg:block">
      <svg viewBox="0 0 1200 72" preserveAspectRatio="none" fill="none" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id="implemented-by" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={TONES.violet} stopOpacity="0.7" />
            <stop offset="1" stopColor={TONES.pink} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {ends.map((end, k) =>
          [-1, -0.5, 0, 0.5, 1].map((lane) => (
            <path
              key={`${k}-${lane}`}
              d={fibre(from, end, (k - 1) * 0.08, lane * 0.025)}
              stroke="url(#implemented-by)"
              strokeWidth={1}
              strokeOpacity={0.55}
              vectorEffect="non-scaling-stroke"
            />
          )),
        )}
      </svg>
      <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-[#0b0a13] px-3 py-1 text-[0.75rem] text-white/60">
        {repositories.implementedBy}
      </p>
    </div>
  );
}

export function Repositories() {
  const { spec, implementations, governance } = repositories;

  return (
    <section aria-labelledby={repositories.id} data-form="branches" className="shell py-20 lg:py-28">
      <SectionHeading
        id={repositories.id}
        eyebrow={repositories.eyebrow}
        title={repositories.title}
        lead={repositories.lead}
        illustrated
      />

      {/* The specification is the entry point, so it spans the row above its implementations. */}
      <article
        data-motion-reveal
        className="relative isolate mt-12 overflow-hidden rounded-panel border border-signal-glow/25 bg-[linear-gradient(160deg,rgb(40_26_102/0.8),rgb(13_11_26/0.92)_60%)] p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] sm:p-8 lg:mt-16 lg:p-10"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 -z-10 size-72 rounded-full bg-violet/40 blur-[90px]" />
        <ClprMark className="pointer-events-none absolute -bottom-10 right-8 -z-10 h-48 text-white/5" />
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[0.75rem] font-medium text-night">{repositories.featuredLabel}</span>
              <span className="text-[0.8125rem] text-white/60">{spec.kind}</span>
            </div>
            <a
              href={spec.href}
              target="_blank"
              rel="noreferrer"
              className="group mt-6 inline-flex items-baseline gap-2 font-mono text-[1.75rem] font-medium"
            >
              {spec.name}
              <ArrowUpRight
                className="size-5 translate-y-0.5 text-white/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                aria-hidden="true"
              />
              <span className="sr-only">({repositories.openLabel})</span>
            </a>
            <p className="mt-4 max-w-[58ch] text-[1.0625rem] leading-relaxed text-night-text">{spec.body}</p>
          </div>
          <CopyCommand
            command={repositories.clone.command}
            label={repositories.clone.label}
            copyLabel={repositories.clone.copy}
            copiedLabel={repositories.clone.copied}
            className="relative z-10 lg:col-span-6"
          />
        </div>
      </article>

      <ImplementedBy />

      <ul className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3 lg:mt-0">
        {implementations.map((repo) => (
          <li key={repo.name} data-motion-reveal>
            <a
              href={repo.href}
              target="_blank"
              rel="noreferrer"
              data-spotlight
              className="panel group flex h-full flex-col p-6 transition-transform duration-300 hover:-translate-y-0.5 sm:p-7"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[0.8125rem] text-white/60">
                  <GitHubMark className="size-4 text-white/45" />
                  {repo.kind}
                </span>
                <ArrowUpRight
                  className="size-5 text-white/35 transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-6 font-mono text-[1rem] font-medium text-white">{repo.name}</p>
              {repo.status && (
                <span className="mt-2 self-start rounded-full border border-proof-glow/30 bg-proof-glow/8 px-2.5 py-0.5 text-[0.75rem] text-proof-ink">
                  {repo.status}
                </span>
              )}
              <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-muted-foreground">{repo.body}</p>

              <dl className="mt-6 grid gap-3 border-t border-white/7 pt-5 text-[0.8125rem]">
                <div>
                  <dt className="text-faint">{repositories.implementsLabel}</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {repo.implements.map((component) => (
                      <span key={component} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-0.5 text-white/80">
                        <TermIcon term={COMPONENT_TERMS[component]} className="size-3.5 shrink-0" />
                        {repositories.components[component]}
                      </span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-faint">{repositories.runsOnLabel}</dt>
                  <dd className="mt-1 text-white/80">{repo.runsOn}</dd>
                </div>
              </dl>
              <p className="mt-5 truncate font-mono text-[0.75rem] text-faint">{repoPath(repo.href)}</p>
              <span className="sr-only">({repositories.openLabel})</span>
            </a>
          </li>
        ))}
      </ul>

      {/* How the project is run: its governance and the licenses that cover the work. */}
      <div data-motion-reveal className="panel mt-3 grid gap-6 p-6 sm:p-7 lg:grid-cols-12 lg:items-center lg:gap-10">
        <a href={governance.href} target="_blank" rel="noreferrer" className="group flex items-start gap-4 lg:col-span-6">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-linear-to-b from-white/8 to-white/2">
            <GitHubMark className="size-4 text-white/70" />
          </span>
          <span>
            <span className="text-[0.8125rem] text-faint">{repositories.rulesLabel}</span>
            <span className="mt-1 flex items-center gap-2 font-mono text-[1rem] font-medium text-white">
              {governance.name}
              <ArrowUpRight
                className="size-4 text-white/40 transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                aria-hidden="true"
              />
            </span>
            <span className="mt-1.5 block text-[0.9375rem] leading-relaxed text-muted-foreground">{governance.body}</span>
            <span className="sr-only">({repositories.openLabel})</span>
          </span>
        </a>
        <dl className="grid gap-px overflow-hidden rounded-xl border border-white/7 bg-white/7 sm:grid-cols-2 lg:col-span-6">
          {repositories.facts.map((fact) => (
            <div key={fact.term} className="bg-[#0b0a13]/90 px-5 py-4">
              <dt className="text-[0.75rem] text-faint">{fact.term}</dt>
              <dd className="mt-1 text-[0.9375rem] text-white/90">{fact.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
