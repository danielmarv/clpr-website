import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { Chips, PageIntro, PageShell } from "@/components/PageShell";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { footer, governancePage as page } from "@/content/site";

export const metadata: Metadata = { title: page.metaTitle, description: page.description };

function Person({ handle, name }: { handle: string; name: string | null }) {
  return (
    <li>
      <a
        href={`https://github.com/${handle}`}
        target="_blank"
        rel="noreferrer"
        className="panel group flex items-center gap-4 p-4 transition-colors duration-300 hover:border-fg/15 hover:bg-fg/[0.04]"
      >
        <Image
          src={`https://avatars.githubusercontent.com/${handle}`}
          alt=""
          width={48}
          height={48}
          className="size-12 shrink-0 rounded-full border border-fg/10 bg-fg/5"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.9375rem] font-medium text-fg">{name ?? handle}</span>
          <span className="block truncate font-mono text-[0.8125rem] text-faint">@{handle}</span>
        </span>
        <ArrowUpRight
          className="size-4 shrink-0 text-fg/35 transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
          aria-hidden="true"
        />
        <span className="sr-only">
          ({page.profileLabel}, {footer.newTab})
        </span>
      </a>
    </li>
  );
}

export default function GovernancePage() {
  return (
    <PageShell>
      <PageIntro kicker={page.kicker} title={page.title} lead={page.lead}>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <a href={page.actions.primary.href} target="_blank" rel="noreferrer">
              {page.actions.primary.label}
              <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href={page.actions.secondary.href} target="_blank" rel="noreferrer">
              {page.actions.secondary.label}
              <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
        </div>
      </PageIntro>

      <section aria-labelledby="how-the-lab-is-run" className="band py-20 lg:py-28">
        <div className="shell">
          <div data-motion-reveal className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <h2 id="how-the-lab-is-run" className="text-headline text-[clamp(1.75rem,3vw,2.25rem)] font-normal leading-[1.15] tracking-[-0.03em]">
                {page.about.title}
              </h2>
              <Chips items={page.about.chips} className="mt-6" />
            </div>
            <div className="space-y-4 text-[1.0625rem] leading-[1.7] text-muted-foreground lg:col-span-7">
              {page.about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {page.roles.map((role) => (
              <li key={role.name} data-motion-reveal className="panel p-6 sm:p-7">
                <h3 className="text-[1.125rem] font-medium tracking-[-0.015em]">{role.name}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{role.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="maintainers" className="shell py-20 lg:py-28">
        <SectionHeading id="maintainers" title={page.maintainersTitle} lead={page.maintainersLead} />
        <ul data-motion-reveal className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {page.maintainers.map((person) => (
            <Person key={person.handle} {...person} />
          ))}
        </ul>

        <div className="mt-20">
          <SectionHeading id="committers" title={page.committersTitle} lead={page.committersLead} />
          {page.committers.map((team) => (
            <div key={team.repository} data-motion-reveal className="mt-10">
              <h3 className="font-mono text-[0.9375rem] font-medium text-fg">{team.repository}</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {team.members.map((person) => (
                  <Person key={person.handle} {...person} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="sources" className="band py-20 lg:py-28">
        <div className="shell">
          <SectionHeading id="sources" title={page.sourcesTitle} lead={page.sourcesLead} />
          <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {page.sources.map((source) => (
              <li key={source.name} data-motion-reveal>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="panel group flex h-full flex-col p-6 transition-colors duration-300 hover:border-fg/15 hover:bg-fg/[0.04]"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-[1.0625rem] font-medium tracking-[-0.015em] text-fg">{source.name}</span>
                    <ArrowUpRight
                      className="size-5 shrink-0 text-fg/35 transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{source.body}</span>
                  <span className="sr-only">({footer.newTab})</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
