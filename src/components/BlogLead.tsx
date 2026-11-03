import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { blog } from "@/content/site";
import type { PostMeta } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

function byline(post: PostMeta): string {
  return post.authors
    .map((author) => author.name)
    .filter(Boolean)
    .join(", ");
}

/** The newest post across the page's width, the one place on the blog that shows its image at size. */
export function BlogLead({ post }: { post: PostMeta }) {
  const authors = byline(post);
  return (
    <section aria-labelledby="blog-lead-title" className="shell pb-16 lg:pb-24">
      <Link
        href={`/blog/${post.slug}/`}
        aria-label={post.title}
        data-motion-reveal
        className="panel group grid overflow-hidden transition-colors duration-300 hover:border-fg/15 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
      >
        <span className="relative block aspect-video overflow-hidden bg-fg/5 lg:aspect-auto lg:min-h-80">
          <Image
            src={post.featuredImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 40rem, 100vw"
            className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.02]"
            priority
          />
        </span>
        <span className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <span className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-signal-ink">{blog.latestLabel}</span>
          <h2
            id="blog-lead-title"
            className="text-headline mt-4 text-[clamp(1.5rem,2.8vw,2.25rem)] font-normal leading-[1.15] tracking-[-0.03em] text-balance"
          >
            {post.title}
          </h2>
          {post.abstract && <span className="mt-4 text-[1.0625rem] leading-relaxed text-muted-foreground">{post.abstract}</span>}
          <span className="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-[0.8125rem] text-faint">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {authors && <span>{authors}</span>}
          </span>
          <span className="mt-8 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-signal-ink transition-colors group-hover:text-fg">
            {blog.readLabel}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </span>
      </Link>
    </section>
  );
}
