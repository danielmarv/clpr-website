import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";

import { IssueBoard } from "@/components/IssueBoard";
import { Chips, PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { footer, issueExplorer as page } from "@/content/site";
import { getOpenIssues } from "@/lib/github";
import { format } from "@/lib/utils";

export const metadata: Metadata = { title: page.metaTitle, description: page.description };

function refreshedAt(iso: string): string {
  const time = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(iso));
  return format(page.refreshed, { time: `${time} UTC` });
}

// The structure of hiero.org/issues: the header with what the board holds, the board, then where else to
// look. Here the steps to pick an issue up come between the board and the closing.
export default async function IssuesPage() {
  const data = await getOpenIssues();
  const covered: readonly string[] = page.repositories.map((repository) => repository.name);
  const issues = data?.issues.filter((issue) => covered.includes(issue.repository)) ?? null;

  return (
    <PageShell>
      <section aria-labelledby="page-title" className="shell pb-10 pt-16 lg:pb-14 lg:pt-24">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <p
              data-hero-reveal
              className="inline-flex items-center gap-2 rounded-full border border-fg/10 bg-fg/[0.03] py-1 pl-2.5 pr-3.5 text-[0.8125rem] text-muted-foreground"
            >
              <span className="size-1.5 rounded-full bg-signal-glow" aria-hidden="true" />
              {page.kicker}
            </p>
            <h1 id="page-title" data-hero-reveal className="text-headline mt-6 text-[clamp(2.75rem,6.4vw,5rem)] font-light leading-[1] tracking-[-0.045em]">
              {page.title}
            </h1>
          </div>
          <div data-hero-reveal className="lg:col-span-5 lg:pb-2">
            <p className="text-[1.0625rem] leading-[1.7] text-muted-foreground sm:text-lg">{page.lead}</p>
            <Chips items={[page.chips.open, page.chips.unassigned, format(page.chips.repositories, { count: covered.length })]} className="mt-5" />
          </div>
        </div>
        <p data-hero-reveal className="mt-10 flex flex-wrap gap-x-4 gap-y-1 border-t border-fg/[0.07] pt-5 font-mono text-[0.75rem] uppercase tracking-[0.08em] text-faint">
          {issues && data ? (
            <>
              <span className="text-fg">{issues.length === 1 ? page.counterOne : format(page.counter, { count: issues.length })}</span>
              <span>{refreshedAt(data.fetchedAt)}</span>
            </>
          ) : (
            <span className="normal-case tracking-normal">{page.unavailable}</span>
          )}
        </p>
      </section>

      <section aria-label={page.title} className="shell pb-20 lg:pb-28">
        <IssueBoard issues={issues} fetchedAt={data?.fetchedAt ?? null} />
      </section>

      <section aria-labelledby="pick-up-title" className="band py-20 lg:py-24">
        <div className="shell">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="pick-up-title" className="text-headline text-[clamp(1.75rem,3vw,2.25rem)] font-normal tracking-[-0.03em]">
              {page.steps.title}
            </h2>
            <a
              href={page.contributing.href}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 text-[0.9375rem] font-medium text-signal-ink transition-colors hover:text-fg"
            >
              {page.contributing.label}
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              <span className="sr-only"> ({footer.newTab})</span>
            </a>
          </div>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {page.steps.items.map((step, index) => (
              <li key={step.name} data-motion-reveal className="panel p-6">
                <span className="font-mono text-[0.75rem] text-signal-ink">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-[1.0625rem] font-medium tracking-[-0.015em]">{step.name}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="further-title" className="shell py-20 lg:py-24">
        <div data-motion-reveal className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-12">
          <div>
            <h2 id="further-title" className="text-[1.25rem] font-medium tracking-[-0.02em]">
              {page.closing.title}
            </h2>
            <p className="mt-3 max-w-[60ch] text-[0.9375rem] leading-relaxed text-muted-foreground">{page.closing.body}</p>
          </div>
          <Button asChild size="lg" variant="secondary" className="md:justify-self-end">
            <a href={page.closing.cta.href} target="_blank" rel="noreferrer">
              {page.closing.cta.label}
              <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
