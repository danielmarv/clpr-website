import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageIntro, PageShell } from "@/components/PageShell";
import { blog } from "@/content/site";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: blog.metaTitle, description: blog.description };

// Posts are listed newest first; the newest one is featured.
const posts = [...blog.posts].sort((a, b) => b.date.localeCompare(a.date));

export default function BlogPage() {
  const [latest, ...recent] = posts;
  return (
    <PageShell>
      <PageIntro kicker={blog.kicker} title={blog.title} lead={blog.lead} />

      <section aria-labelledby="latest" className="shell pb-20 lg:pb-28">
        <h2 id="latest" className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-signal-ink">
          {blog.latestLabel}
        </h2>
        <article
          data-motion-reveal
          className="relative mt-5 overflow-hidden rounded-panel border border-signal-glow/40 bg-[linear-gradient(160deg,rgb(91_69_224/0.08),rgb(255_255_255/0.8)_60%)] p-6 dark:border-signal-glow/25 dark:bg-[linear-gradient(160deg,rgb(63_34_215/0.16),transparent_60%)] sm:p-8 lg:p-10"
        >
          <time dateTime={latest.date} className="text-[0.8125rem] text-faint">
            {formatDate(latest.date)}
          </time>
          <h3 className="text-headline mt-3 max-w-[28ch] text-[clamp(1.5rem,3vw,2.25rem)] font-normal leading-[1.15] tracking-[-0.03em]">
            <Link href={`/blog/${latest.slug}/`} className="after:absolute after:inset-0">
              {latest.title}
            </Link>
          </h3>
          <p className="mt-4 max-w-[60ch] text-[1.0625rem] leading-relaxed text-muted-foreground">{latest.summary}</p>
          <span className="mt-6 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-signal-ink" aria-hidden="true">
            {blog.readLabel}
            <ArrowRight className="size-4" />
          </span>
        </article>

        {recent.length > 0 && (
          <>
            <h2 className="mt-16 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-signal-ink">{blog.recentLabel}</h2>
            <ul className="mt-5 grid gap-4 md:grid-cols-2">
              {recent.map((post) => (
                <li key={post.slug} data-motion-reveal>
                  <article className="panel relative flex h-full flex-col p-6 transition-colors duration-300 hover:border-fg/15 hover:bg-fg/[0.04] sm:p-7">
                    <time dateTime={post.date} className="text-[0.8125rem] text-faint">
                      {formatDate(post.date)}
                    </time>
                    <h3 className="mt-2 text-[1.25rem] font-medium leading-snug tracking-[-0.02em]">
                      <Link href={`/blog/${post.slug}/`} className="after:absolute after:inset-0">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted-foreground">{post.summary}</p>
                  </article>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </PageShell>
  );
}
