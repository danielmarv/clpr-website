import type { ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { ClprMark } from "@/components/ClprMark";
import { GitHubMark } from "@/components/GitHubMark";
import { HeroMesh } from "@/components/HeroMesh";
import { Chips, PageShell } from "@/components/PageShell";
import { footer, governancePage as page } from "@/content/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: page.metaTitle, description: page.description };

type Member = (typeof page.members.list)[number];

const external = { target: "_blank", rel: "noreferrer" } as const;

// The structure of hiero.org/tsc: the hero on the brand's colours with the charter and the meeting
// calendar, about the governance, who sits on it, and where the work is kept.
export default function GovernancePage() {
  const { about, members, resources } = page;
  const [before, after] = about.body.split("{rules}");
  const listed = [...members.list].sort((a, b) => surname(a.name).localeCompare(surname(b.name)));

  return (
    <PageShell>
      <section aria-labelledby="page-title" className="shell pt-6">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#111116] text-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_18%,rgb(200_42_128/0.45),transparent_36%),radial-gradient(circle_at_16%_78%,rgb(91_69_224/0.55),transparent_44%),linear-gradient(115deg,#0d0b1f_0%,#211271_48%,#5b1a6e_100%)]"
          />
          <HeroMesh className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[64rem] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-30" />
          <div className="mx-auto flex min-h-[34rem] max-w-[44rem] flex-col items-center justify-center px-6 py-20 text-center sm:py-24">
            <p data-hero-reveal className="flex items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.22em] text-white/75">
              <span className="size-2 rounded-full bg-proof-glow" aria-hidden="true" />
              {page.kicker}
            </p>
            <h1
              id="page-title"
              data-hero-reveal
              className="mt-7 text-[clamp(2.5rem,6vw,4.5rem)] font-normal leading-[0.98] tracking-[-0.045em] text-balance"
            >
              {page.title}
            </h1>
            <span data-hero-reveal aria-hidden="true" className="mt-7 h-px w-24 bg-white/80" />
            <p data-hero-reveal className="mt-7 max-w-[38rem] text-[1.125rem] leading-[1.6] text-white/80 sm:text-[1.25rem]">
              {page.lead}
            </p>
            <div data-hero-reveal className="mt-9 flex flex-wrap justify-center gap-3">
              <a
                href={page.actions.primary.href}
                {...external}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[0.9375rem] font-medium text-[#120f2c] transition-colors hover:bg-white/90"
              >
                {page.actions.primary.label}
                <ArrowUpRight className="size-4" aria-hidden="true" />
                <span className="sr-only"> ({footer.newTab})</span>
              </a>
              <a
                href={page.actions.secondary.href}
                {...external}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/70 px-6 text-[0.9375rem] font-medium text-white transition-colors hover:bg-white/10"
              >
                {page.actions.secondary.label}
                <ArrowUpRight className="size-4" aria-hidden="true" />
                <span className="sr-only"> ({footer.newTab})</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="about-title" className="shell py-20 lg:py-28">
        <BandHeader eyebrow={about.eyebrow} title={about.title} id="about-title">
          <p className="text-[1.0625rem] leading-[1.7] text-muted-foreground">
            {before}
            <a
              href={page.actions.primary.href}
              {...external}
              className="text-signal-ink underline decoration-signal-ink/30 underline-offset-2 transition-colors hover:text-fg hover:decoration-current"
            >
              {about.rulesLabel}
              <span className="sr-only"> ({footer.newTab})</span>
            </a>
            {after}
          </p>
          <Chips items={about.chips} className="mt-5" />
        </BandHeader>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {page.roles.map((role, index) => (
            <li key={role.name} data-motion-reveal className="panel p-6 sm:p-7">
              <span className="font-mono text-[0.75rem] text-signal-ink">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-[1.125rem] font-medium tracking-[-0.015em]">{role.name}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{role.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="members-title" className="band py-20 lg:py-28">
        <div className="shell">
          <BandHeader eyebrow={members.eyebrow} title={members.title} id="members-title">
            <p className="text-[1.0625rem] leading-[1.7] text-muted-foreground">{members.body}</p>
            <p className="mt-6 flex items-center gap-4">
              <span className="sr-only">
                {listed.length} {members.countLabel}
              </span>
              <span aria-hidden="true" className="text-headline text-[3.5rem] font-light leading-none tracking-[-0.04em]">
                {String(listed.length).padStart(2, "0")}
              </span>
              <span aria-hidden="true" className="max-w-[8rem] text-[0.8125rem] leading-snug text-faint">
                {members.countLabel}
              </span>
            </p>
          </BandHeader>

          <div
            aria-hidden="true"
            className="mt-12 flex justify-between border-b border-fg/10 pb-3 font-mono text-[0.75rem] uppercase tracking-[0.08em] text-faint"
          >
            <span>{members.board.label}</span>
            <span>{members.board.note}</span>
          </div>

          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listed.length
              ? listed.map((member) => (
                  <li key={member.name} data-motion-reveal>
                    <MemberCard member={member} />
                  </li>
                ))
              : Array.from({ length: members.placeholders }, (_, index) => (
                  <li key={index} data-motion-reveal>
                    <MemberCard />
                  </li>
                ))}
          </ul>

          {listed.length === 0 && (
            <div
              data-motion-reveal
              className="mt-6 flex flex-col gap-4 rounded-panel border border-dashed border-fg/15 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7"
            >
              <div>
                <p className="text-[1rem] font-medium text-fg">{members.empty.title}</p>
                <p className="mt-1 max-w-[60ch] text-[0.9375rem] leading-relaxed text-muted-foreground">{members.empty.body}</p>
              </div>
              <a
                href={members.empty.link.href}
                {...external}
                className="group inline-flex shrink-0 items-center gap-2 text-[0.9375rem] font-medium text-signal-ink transition-colors hover:text-fg"
              >
                {members.empty.link.label}
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                <span className="sr-only"> ({footer.newTab})</span>
              </a>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="resources-title" className="shell py-20 lg:py-28">
        <BandHeader eyebrow={resources.eyebrow} title={resources.title} id="resources-title">
          <p className="text-[1.0625rem] leading-[1.7] text-muted-foreground">{resources.lead}</p>
        </BandHeader>
        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {resources.items.map((resource) => (
            <li key={resource.name} data-motion-reveal>
              <a
                href={resource.href}
                {...external}
                className="panel group flex h-full flex-col p-6 transition-colors duration-300 hover:border-fg/20 hover:bg-fg/[0.03]"
              >
                <span className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-faint">{resource.platform}</span>
                <h3 className="mt-4 text-[1.125rem] font-medium tracking-[-0.015em] text-fg">{resource.name}</h3>
                <span className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted-foreground">{resource.body}</span>
                <span className="mt-6 inline-flex items-center gap-2 text-[0.875rem] font-medium text-signal-ink transition-colors group-hover:text-fg">
                  {resources.action}
                  <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
                <span className="sr-only">({footer.newTab})</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}

/** The site's band header: eyebrow and heading on the left, what the band is about on the right. */
function BandHeader({ eyebrow, title, id, children }: { eyebrow: string; title: string; id: string; children: ReactNode }) {
  return (
    <header data-motion-reveal className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
      <div className="lg:col-span-6">
        <p className="mb-4 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-signal-ink">{eyebrow}</p>
        <h2 id={id} className="text-headline text-[clamp(1.875rem,3.6vw,2.75rem)] font-normal leading-[1.12] tracking-[-0.03em]">
          {title}
        </h2>
      </div>
      <div className="lg:col-span-6 lg:pb-1">{children}</div>
    </header>
  );
}

function surname(name: string): string {
  return name.split(" ").pop() ?? name;
}

/** A member's card, or, without a member, the empty card that holds the place. */
function MemberCard({ member }: { member?: Member }) {
  const handle = member?.github?.replace(/^https:\/\/github\.com\//, "").replace(/\/$/, "");
  return (
    <article className="panel flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-fg/[0.06] bg-[radial-gradient(70%_80%_at_50%_45%,rgb(139_123_255/0.12),transparent_75%)]">
        {member?.photo ? (
          <Image src={`/images/governance/${member.photo}`} alt="" fill sizes="(min-width: 1024px) 24rem, (min-width: 640px) 45vw, 100vw" className="object-cover" />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-24 items-center justify-center rounded-full border border-fg/10 bg-fg/[0.04]">
              <ClprMark className="h-6 text-fg/25" />
            </span>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className={cn("text-[1.125rem] font-medium tracking-[-0.015em]", member ? "text-fg" : "text-faint")}>
          {member?.name ?? page.members.placeholderName}
        </h3>
        {member?.role && <p className="mt-1 text-[0.875rem] text-muted-foreground">{member.role}</p>}
        {member?.github ? (
          <a
            href={member.github}
            {...external}
            className="mt-2 inline-flex items-center gap-1.5 self-start font-mono text-[0.8125rem] text-fg/65 transition-colors hover:text-fg"
          >
            <GitHubMark className="size-3.5" />
            {handle ?? page.members.githubLabel}
            <span className="sr-only"> ({footer.newTab})</span>
          </a>
        ) : (
          !member && <span aria-hidden="true" className="mt-3 h-3 w-28 rounded-full bg-fg/[0.07]" />
        )}
        <p className="mt-4 line-clamp-5 text-[0.9375rem] leading-relaxed text-muted-foreground">{member?.bio ?? page.members.noBio}</p>
      </div>
    </article>
  );
}
