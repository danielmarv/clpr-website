import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { blog } from "@/content/site";
import type { PostMeta } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

/**
 * One post as a card: featured image, date, title, abstract. The whole card is one link, named by the
 * title (aria-label) so a screen reader does not read the abstract as part of the link's name.
 */
export function BlogPostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}/`}
      aria-label={post.title}
      className="panel group flex h-full flex-col overflow-hidden transition-colors duration-300 hover:border-fg/15 hover:bg-fg/[0.04]"
    >
      <span className="relative block aspect-video overflow-hidden border-b border-fg/[0.06] bg-fg/5">
        <Image
          src={post.featuredImage}
          alt=""
          fill
          sizes="(min-width: 1280px) 24rem, (min-width: 768px) 45vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
        />
      </span>
      <span className="flex flex-1 flex-col p-6">
        <time dateTime={post.date} className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-faint">
          {formatDate(post.date, true)}
        </time>
        {/* A heading, so the archive stays navigable by heading; the link's name is the aria-label. */}
        <h3 className="mt-3 text-[1.1875rem] font-medium leading-snug tracking-[-0.02em] text-fg">{post.title}</h3>
        {post.abstract && <span className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted-foreground">{post.abstract}</span>}
        <span className="mt-6 inline-flex items-center gap-2 text-[0.875rem] font-medium text-signal-ink transition-colors group-hover:text-fg" aria-hidden="true">
          {blog.readLabel}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </span>
    </Link>
  );
}
