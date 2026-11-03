import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { BlogPostCard } from "@/components/BlogPostCard";
import { PostImage, PostTags, readingTime } from "@/components/PostDetails";
import { blog, footer } from "@/content/site";
import type { PostMeta } from "@/lib/posts";
import { formatDate, isExternal } from "@/lib/utils";

function byline(post: PostMeta): string {
  return post.authors
    .map((author) => author.name)
    .filter(Boolean)
    .join(", ");
}

/**
 * The top of the blog: the newest post at size, and beside it the next two. While there are fewer than
 * three posts, the column ends with what to follow between them, so it never stands half empty.
 */
export function BlogLead({ lead, next }: { lead: PostMeta; next: PostMeta[] }) {
  const authors = byline(lead);
  return (
    <section aria-labelledby="blog-lead-title" className="shell pb-20 lg:pb-28">
      <div className="grid gap-4 lg:grid-cols-12">
        <Link
          href={`/blog/${lead.slug}/`}
          aria-label={lead.title}
          data-motion-reveal
          className="panel group flex flex-col overflow-hidden transition-colors duration-300 hover:border-fg/15 lg:col-span-8"
        >
          <PostImage post={lead} sizes="(min-width: 1024px) 48rem, 100vw" priority className="aspect-[2/1] border-b border-fg/[0.06] lg:aspect-auto lg:min-h-80 lg:flex-1" />
          <span className="flex flex-col p-6 sm:p-8 lg:p-10">
            <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="rounded-full bg-fg px-2.5 py-0.5 text-[0.75rem] font-medium text-background">{blog.latestLabel}</span>
              <span className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-faint">
                <time dateTime={lead.date}>{formatDate(lead.date)}</time> · {readingTime(lead)}
              </span>
            </span>
            <h2
              id="blog-lead-title"
              className="text-headline mt-5 max-w-[24ch] text-[clamp(1.75rem,3.2vw,2.625rem)] font-normal leading-[1.1] tracking-[-0.035em] text-balance"
            >
              {lead.title}
            </h2>
            {lead.abstract && <span className="mt-4 max-w-[58ch] text-[1.0625rem] leading-relaxed text-muted-foreground">{lead.abstract}</span>}
            {authors && <span className="mt-4 text-[0.875rem] text-fg/70">{authors}</span>}
            <span className="flex flex-wrap items-end justify-between gap-4 pt-8">
              <PostTags tags={lead.tags} />
              <span className="inline-flex items-center gap-2 text-[0.9375rem] font-medium text-signal-ink transition-colors group-hover:text-fg">
                {blog.readLabel}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </span>
          </span>
        </Link>

        <div className="grid content-start gap-4 lg:col-span-4">
          {next.map((post) => (
            <div key={post.slug} data-motion-reveal>
              <BlogPostCard post={post} compact />
            </div>
          ))}
          {next.length < 2 && <FollowCard />}
        </div>
      </div>
    </section>
  );
}

function FollowCard() {
  const { follow } = blog;
  return (
    <aside data-motion-reveal aria-labelledby="blog-follow-title" className="panel relative overflow-hidden p-6 sm:p-7">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[radial-gradient(circle,rgb(157_139_255/0.22),transparent_70%)]"
      />
      <h2 id="blog-follow-title" className="relative text-[1.125rem] font-medium tracking-[-0.015em]">
        {follow.title}
      </h2>
      <p className="relative mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{follow.body}</p>
      <ul className="relative mt-5 divide-y divide-fg/[0.07] border-t border-fg/[0.07]">
        {follow.links.map((link) => {
          const external = isExternal(link.href);
          const Arrow = external ? ArrowUpRight : ArrowRight;
          const className = "group flex items-center justify-between py-3 text-[0.9375rem] font-medium text-fg transition-colors hover:text-signal-ink";
          const content = (
            <>
              {link.label}
              <Arrow className="size-4 text-fg/40 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-signal-ink" aria-hidden="true" />
              {external && <span className="sr-only"> ({footer.newTab})</span>}
            </>
          );
          return (
            <li key={link.label}>
              {external ? (
                <a href={link.href} target="_blank" rel="noreferrer" className={className}>
                  {content}
                </a>
              ) : (
                <Link href={link.href} className={className}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
