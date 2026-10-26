import { ArrowUpRight } from "lucide-react";

import { ClprMark } from "@/components/ClprMark";
import { CopyCommand } from "@/components/CopyCommand";
import { GitHubMark } from "@/components/GitHubMark";
import { SectionHeading } from "@/components/SectionHeading";
import { repositories } from "@/content/site";

function repoPath(href: string): string {
  return href.replace(/^https:\/\/github\.com\//, "");
}

export function Repositories() {
  const [featured, ...rest] = repositories.items;

  return (
    <section aria-labelledby={repositories.id} data-form="branches" className="shell py-20 lg:py-28">
      <SectionHeading
        id={repositories.id}
        eyebrow={repositories.eyebrow}
        title={repositories.title}
        lead={repositories.lead}
        illustrated
      />

      <dl data-motion-reveal className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/7 bg-white/7 sm:grid-cols-3 lg:mt-16">
        {repositories.facts.map((fact) => (
          <div key={fact.term} className="bg-[#0b0a13]/90 px-5 py-4">
            <dt className="text-[0.75rem] text-faint">{fact.term}</dt>
            <dd className="mt-1 text-[0.9375rem] text-white/90">{fact.detail}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {/* The specification is the entry point, so it gets the large card. */}
        <li
          data-motion-reveal
          className="relative isolate overflow-hidden rounded-panel border border-signal-glow/25 bg-[linear-gradient(160deg,rgb(40_26_102/0.8),rgb(13_11_26/0.92)_60%)] p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] sm:p-8 md:col-span-2 lg:col-span-1 lg:row-span-2"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 -z-10 size-72 rounded-full bg-violet/40 blur-[90px]"
          />
          <ClprMark className="pointer-events-none absolute -bottom-8 -right-10 -z-10 h-44 text-white/5" />
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[0.75rem] font-medium text-night">
                {repositories.featuredLabel}
              </span>
              <span className="text-[0.8125rem] text-white/60">{featured.kind}</span>
            </div>
            <a
              href={featured.href}
              target="_blank"
              rel="noreferrer"
              className="group mt-8 inline-flex items-baseline gap-2 font-mono text-2xl font-medium after:absolute after:inset-0 after:content-['']"
            >
              {featured.name}
              <ArrowUpRight
                className="size-5 translate-y-0.5 text-white/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                aria-hidden="true"
              />
              <span className="sr-only">({repositories.openLabel})</span>
            </a>
            <p className="mt-4 text-night-text">{featured.body}</p>
            <CopyCommand
              command={repositories.clone.command}
              label={repositories.clone.label}
              copyLabel={repositories.clone.copy}
              copiedLabel={repositories.clone.copied}
              className="relative z-10 mt-8 lg:mt-auto"
            />
          </div>
        </li>

        {rest.map((repo) => (
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
              <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted-foreground">{repo.body}</p>
              <p className="mt-6 truncate font-mono text-[0.75rem] text-faint">github.com/{repoPath(repo.href)}</p>
              <span className="sr-only">({repositories.openLabel})</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
