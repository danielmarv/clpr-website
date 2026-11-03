import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";

import { IssueList } from "@/components/IssueList";
import { Chips, PageIntro, PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { footer, issueExplorer as page } from "@/content/site";
import { getOpenIssues } from "@/lib/github";
import { format } from "@/lib/utils";

export const metadata: Metadata = { title: page.metaTitle, description: page.description };

function refreshedAt(iso: string): string {
  const time = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(iso));
  return format(page.refreshed, { time: `${time} UTC` });
}

export default async function IssuesPage() {
  const data = await getOpenIssues();
  const covered: readonly string[] = page.repositories;
  const issues = data?.issues.filter((issue) => covered.includes(issue.repository)) ?? null;

  return (
    <PageShell>
      <PageIntro kicker={page.kicker} title={page.title} lead={page.lead}>
        <Chips items={[page.chips.open, page.chips.unassigned, format(page.chips.repositories, { count: covered.length })]} />
        <p className="mt-6 text-[0.875rem] text-faint">
          {issues && data ? (
            <>
              <span className="font-medium text-fg">
                {issues.length === 1 ? page.counterOne : format(page.counter, { count: issues.length })}
              </span>
              {" · "}
              {refreshedAt(data.fetchedAt)}
            </>
          ) : (
            page.unavailable
          )}
        </p>
      </PageIntro>

      <section aria-label={page.title} className="shell pb-20 lg:pb-28">
        {issues && <IssueList issues={issues} />}

        <div data-motion-reveal className="mt-16 grid gap-6 border-t border-fg/[0.07] pt-10 md:grid-cols-2 md:items-end md:gap-12">
          <div>
            <h2 className="text-[1.25rem] font-medium tracking-[-0.02em]">{page.closing.title}</h2>
            <p className="mt-3 max-w-[56ch] text-[0.9375rem] leading-relaxed text-muted-foreground">{page.closing.body}</p>
            <p className="mt-3 max-w-[56ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
              {page.contributing.text}{" "}
              <a
                href={page.contributing.link.href}
                target="_blank"
                rel="noreferrer"
                className="text-signal-ink underline decoration-signal-ink/30 underline-offset-2 transition-colors hover:text-fg hover:decoration-current"
              >
                {page.contributing.link.label}
                <span className="sr-only"> ({footer.newTab})</span>
              </a>
            </p>
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
