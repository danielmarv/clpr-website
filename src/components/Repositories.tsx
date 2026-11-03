import { ArrowUpRight } from "lucide-react";

import { CopyCommand } from "@/components/CopyCommand";
import { GitHubMark } from "@/components/GitHubMark";
import { SectionHeading } from "@/components/SectionHeading";
import { repositories } from "@/content/site";

function repoPath(href: string): string {
  return href.replace(/^https:\/\/(github\.com\/)?/, "");
}

export function Repositories() {
  const { spec, implementations, governance } = repositories;

  return (
    <section aria-labelledby={repositories.id} className="band py-24 lg:py-32">
      <div className="shell">
        <SectionHeading id={repositories.id} eyebrow={repositories.eyebrow} title={repositories.title} lead={repositories.lead} split />

        {/* The specification is the entry point, so it spans the row above its implementations. */}
        <article
          data-motion-reveal
          className="relative mt-14 overflow-hidden rounded-panel border border-signal-glow/25 bg-[linear-gradient(160deg,rgb(63_34_215/0.16),transparent_60%)] p-6 sm:p-8 lg:mt-20 lg:p-10"
        >
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
                className="group mt-6 inline-flex items-baseline gap-2 font-mono text-[1.625rem] font-medium"
              >
                {spec.name}
                <ArrowUpRight
                  className="size-5 translate-y-0.5 text-white/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                  aria-hidden="true"
                />
                <span className="sr-only">({repositories.openLabel})</span>
              </a>
              <p className="mt-4 max-w-[58ch] text-[1rem] leading-relaxed text-night-text">{spec.body}</p>
            </div>
            <CopyCommand
              command={repositories.clone.command}
              label={repositories.clone.label}
              copyLabel={repositories.clone.copy}
              copiedLabel={repositories.clone.copied}
              className="lg:col-span-6"
            />
          </div>
        </article>

        <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {implementations.map((repo) => (
            <li key={repo.name} data-motion-reveal>
              <a
                href={repo.href}
                target="_blank"
                rel="noreferrer"
                className="panel group flex h-full flex-col p-6 transition-colors duration-300 hover:border-white/15 hover:bg-white/[0.04] sm:p-7"
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

                <dl className="mt-6 grid gap-2 border-t border-white/[0.07] pt-5 text-[0.8125rem]">
                  <div className="flex gap-2">
                    <dt className="shrink-0 text-faint">{repositories.implementsLabel}</dt>
                    <dd className="text-white/80">{repo.implements.map((component) => repositories.components[component]).join(", ")}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="shrink-0 text-faint">{repositories.runsOnLabel}</dt>
                    <dd className="text-white/80">{repo.runsOn}</dd>
                  </div>
                </dl>
                <p className="mt-5 truncate font-mono text-[0.75rem] text-faint">{repoPath(repo.href)}</p>
                <span className="sr-only">({repositories.openLabel})</span>
              </a>
            </li>
          ))}
        </ul>

        <div data-motion-reveal className="mt-12 grid gap-8 border-t border-white/[0.07] pt-10 lg:grid-cols-4 lg:gap-10">
          <a href={governance.href} target="_blank" rel="noreferrer" className="group block">
            <span className="text-[0.75rem] text-faint">{repositories.rulesLabel}</span>
            <span className="mt-1.5 flex items-center gap-2 font-mono text-[0.9375rem] font-medium text-white">
              {governance.name}
              <ArrowUpRight
                className="size-4 text-white/40 transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                aria-hidden="true"
              />
            </span>
            <span className="mt-1.5 block text-[0.875rem] leading-relaxed text-muted-foreground">{governance.body}</span>
            <span className="sr-only">({repositories.openLabel})</span>
          </a>
          {repositories.facts.map((fact) => (
            <dl key={fact.term}>
              <dt className="text-[0.75rem] text-faint">{fact.term}</dt>
              <dd className="mt-1.5 text-[0.875rem] leading-relaxed text-white/85">{fact.detail}</dd>
            </dl>
          ))}
        </div>
      </div>
    </section>
  );
}
