import type { Metadata } from "next";

import { BlogLead } from "@/components/BlogLead";
import { BlogPostList } from "@/components/BlogPostList";
import { PageShell } from "@/components/PageShell";
import { blog } from "@/content/site";
import { getAllPosts, getBlogIndexMeta } from "@/lib/posts";
import { format, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Blog", description: blog.description };

// The structure of hiero.org/blog: the header, the newest post at size, then the archive as a grid.
// Here the two posts after the newest sit beside it, and the archive starts after them.
export default function BlogPage() {
  const meta = getBlogIndexMeta();
  const posts = getAllPosts();
  const [lead] = posts;
  const next = posts.slice(1, 3);
  const archive = posts.slice(3);

  return (
    <PageShell>
      <section aria-labelledby="page-title" className="shell pb-12 pt-16 lg:pb-16 lg:pt-24">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <p
              data-hero-reveal
              className="inline-flex items-center gap-2 rounded-full border border-fg/10 bg-fg/[0.03] py-1 pl-2.5 pr-3.5 text-[0.8125rem] text-muted-foreground"
            >
              <span className="size-1.5 rounded-full bg-signal-glow" aria-hidden="true" />
              {blog.kicker}
            </p>
            <h1
              id="page-title"
              data-hero-reveal
              className="text-headline mt-6 text-[clamp(2.75rem,6.4vw,5rem)] font-light leading-[1] tracking-[-0.045em]"
            >
              {meta.title}
            </h1>
          </div>
          <div data-hero-reveal className="lg:col-span-5 lg:pb-2">
            <p className="text-[1.0625rem] leading-[1.7] text-muted-foreground sm:text-lg">{meta.subtitle}</p>
            {lead && (
              <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.75rem] uppercase tracking-[0.08em] text-faint">
                <span>{posts.length === 1 ? blog.postCountOne : format(blog.postCount, { count: posts.length })}</span>
                <span>{format(blog.latestOn, { date: formatDate(lead.date, true) })}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {lead && <BlogLead lead={lead} next={next} />}
      {archive.length > 0 && <BlogPostList posts={archive} listTitle={meta.listTitle} />}
    </PageShell>
  );
}
