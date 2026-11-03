import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PostImage, PostTags, readingTime } from "@/components/PostDetails";
import { blog } from "@/content/site";
import type { PostMeta } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

/**
 * One post as a card: picture, date and reading time, title, abstract, tags. The whole card is one link,
 * named by the title (aria-label) so a screen reader does not read the abstract as part of its name.
 * `compact` drops the tags and keeps the abstract to two lines, for the column beside the newest post.
 */
export function BlogPostCard({ post, compact = false }: { post: PostMeta; compact?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}/`}
      aria-label={post.title}
      className="panel group flex h-full flex-col overflow-hidden transition-colors duration-300 hover:border-fg/15 hover:bg-fg/[0.03]"
    >
      <PostImage post={post} sizes="(min-width: 1280px) 24rem, (min-width: 768px) 45vw, 100vw" className="aspect-video border-b border-fg/[0.06]" />
      <span className="flex flex-1 flex-col p-6">
        <span className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-faint">
          <time dateTime={post.date}>{formatDate(post.date, true)}</time> · {readingTime(post)}
        </span>
        {/* A heading, so the archive stays navigable by heading; the link's name is the aria-label. */}
        <h3 className="mt-3 text-[1.1875rem] font-medium leading-snug tracking-[-0.02em] text-fg transition-colors group-hover:text-signal-ink">
          {post.title}
        </h3>
        {post.abstract && (
          <span className={compact ? "mt-2 line-clamp-2 text-[0.9375rem] leading-relaxed text-muted-foreground" : "mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground"}>
            {post.abstract}
          </span>
        )}
        {!compact && <PostTags tags={post.tags} className="mt-4" />}
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[0.875rem] font-medium text-signal-ink" aria-hidden="true">
          {blog.readLabel}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </span>
    </Link>
  );
}
