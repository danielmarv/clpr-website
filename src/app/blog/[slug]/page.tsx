import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { ArticleContents } from "@/components/ArticleContents";
import { BlogPostCard } from "@/components/BlogPostCard";
import { PageShell } from "@/components/PageShell";
import { PostBody } from "@/components/PostBody";
import { ShareButtons } from "@/components/ShareButtons";
import { blog } from "@/content/site";
import { extractHeadings } from "@/lib/headings";
import { getAllPosts, getPostBySlug, type PostAuthor, type PostMeta } from "@/lib/posts";
import { cn, format, formatDate } from "@/lib/utils";

/** One row of the archive grid. */
const RELATED_COUNT = 3;
/** Below this a contents list is furniture rather than help. */
const MIN_HEADINGS_FOR_CONTENTS = 3;

// Every post is known at build time; any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPostBySlug((await props.params).slug);
  return post ? { title: post.title, description: post.abstract } : {};
}

// The structure of a post on hiero.org: the header, the prose with a rail beside it (image, authors,
// contents, share), the older and newer posts, then more from the blog.
export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const headings = extractHeadings(post.contentMarkdown);
  const contents = headings.length >= MIN_HEADINGS_FOR_CONTENTS ? headings : null;
  const readingTime = post.duration ?? format(blog.readingTime, { minutes: post.readingMinutes });

  // getAllPosts is newest first, so the entry before this one is the newer post.
  const all = getAllPosts();
  const index = all.findIndex((candidate) => candidate.slug === slug);
  const newer = index > 0 ? all[index - 1] : undefined;
  const older = index >= 0 ? all[index + 1] : undefined;
  // What the neighbour links already offer stays out of the grid, so no post is offered twice.
  const shown = new Set([slug, newer?.slug, older?.slug]);
  const related = all.filter((candidate) => !shown.has(candidate.slug)).slice(0, RELATED_COUNT);

  return (
    <PageShell>
      <article>
        <header className="shell pb-12 pt-16 lg:pb-14 lg:pt-24">
          <Link href="/blog/" className="group inline-flex items-center gap-2 text-[0.875rem] text-fg/60 transition-colors hover:text-fg">
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true" />
            {blog.backLabel}
          </Link>
          <p data-hero-reveal className="mt-10 flex flex-wrap gap-x-3 font-mono text-[0.75rem] uppercase tracking-[0.08em] text-faint">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{readingTime}</span>
          </p>
          <h1
            data-hero-reveal
            className="text-headline mt-4 max-w-[24ch] text-[clamp(2rem,4.4vw,3.5rem)] font-light leading-[1.07] tracking-[-0.04em] text-balance"
          >
            {post.title}
          </h1>
          {post.abstract && (
            <p data-hero-reveal className="mt-6 max-w-[60ch] text-[1.125rem] leading-[1.65] text-muted-foreground">
              {post.abstract}
            </p>
          )}
        </header>

        {/* The prose keeps the title's left edge; the rail takes the space to its right, and moves below it under xl. */}
        <div className="border-t border-fg/[0.07]">
          <div className="shell grid gap-12 pb-20 pt-12 xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-16 lg:pb-24">
            <PostBody markdown={post.contentMarkdown} className="post-prose max-w-[68ch]" />

            <aside aria-label={blog.rail.label} className="xl:sticky xl:top-24 xl:self-start">
              <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-1">
                <span className="relative block aspect-video overflow-hidden rounded-panel border border-fg/10 bg-fg/5 sm:col-span-2 xl:col-span-1">
                  <Image src={post.featuredImage} alt="" fill sizes="20rem" className="object-cover" />
                </span>
                {post.authors.length > 0 && (
                  <div>
                    <p className="text-[0.75rem] font-medium text-fg">{post.authors.length > 1 ? blog.rail.authors : blog.rail.author}</p>
                    <ul className="mt-3 space-y-3">
                      {post.authors.map((author, key) => (
                        <li key={author.link ?? author.name ?? key}>
                          <Author author={author} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {contents && <ArticleContents headings={contents} />}
                <div>
                  <p className="text-[0.75rem] font-medium text-fg">{blog.rail.share}</p>
                  <div className="mt-3">
                    <ShareButtons path={`/blog/${post.slug}/`} title={post.title} />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {(newer || older) && (
          <nav aria-label={blog.nearby.label} className="border-t border-fg/[0.07]">
            {/* The links' padding hangs outside the column, so their text keeps the prose's edge. */}
            <div className="shell py-10">
              <div className="-mx-4 grid gap-4 sm:grid-cols-2">
                {older ? <Neighbour post={older} direction="older" /> : <span aria-hidden="true" />}
                {newer && <Neighbour post={newer} direction="newer" />}
              </div>
            </div>
          </nav>
        )}
      </article>

      {related.length > 0 && (
        <section aria-labelledby="blog-more-heading" className="band py-20 lg:py-24">
          <div className="shell">
            <header className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 id="blog-more-heading" className="text-headline text-[clamp(1.5rem,2.6vw,2rem)] font-normal tracking-[-0.03em]">
                {blog.more.title}
              </h2>
              <Link href="/blog/" className="group inline-flex items-center gap-2 text-[0.9375rem] font-medium text-signal-ink transition-colors hover:text-fg">
                {blog.more.all}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </header>
            <ul className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {related.map((candidate) => (
                <li key={candidate.slug}>
                  <BlogPostCard post={candidate} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </PageShell>
  );
}

/** The post either side of this one in date order. */
function Neighbour({ post, direction }: { post: PostMeta; direction: "older" | "newer" }) {
  const older = direction === "older";
  const Arrow = older ? ArrowLeft : ArrowRight;
  return (
    <Link
      href={`/blog/${post.slug}/`}
      aria-label={`${older ? blog.nearby.older : blog.nearby.newer}: ${post.title}`}
      className={cn("group flex flex-col gap-2 rounded-panel p-4 transition-colors hover:bg-fg/[0.04]", !older && "sm:items-end sm:text-right")}
    >
      <span className="inline-flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.08em] text-faint">
        {older && <Arrow className="size-3.5" aria-hidden="true" />}
        {older ? blog.nearby.older : blog.nearby.newer}
        {!older && <Arrow className="size-3.5" aria-hidden="true" />}
      </span>
      <span className="text-[1.0625rem] font-medium leading-snug text-fg group-hover:text-signal-ink">{post.title}</span>
    </Link>
  );
}

function Author({ author }: { author: PostAuthor }) {
  const affiliation = [author.title, author.organization].filter(Boolean).join(", ");
  const inner = (
    <>
      {author.image && <Image src={author.image} alt="" width={40} height={40} className="size-10 shrink-0 rounded-full border border-fg/10" />}
      <span className="min-w-0">
        <span className="block text-[0.9375rem] font-medium text-fg">{author.name}</span>
        {affiliation && <span className="block text-[0.8125rem] leading-snug text-muted-foreground">{affiliation}</span>}
      </span>
    </>
  );
  return author.link ? (
    <a href={author.link} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg transition-colors hover:text-signal-ink">
      {inner}
    </a>
  ) : (
    <span className="flex items-center gap-3">{inner}</span>
  );
}
