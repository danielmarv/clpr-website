"use client";

import { useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { BlogPostCard } from "@/components/BlogPostCard";
import { blog } from "@/content/site";
import type { PostMeta } from "@/lib/posts";
import { cn, format } from "@/lib/utils";

// Nine posts a page: three full rows at the widest grid and no orphan at any width, as on hiero.org.
const POSTS_PER_PAGE = 9;
const PAGER_SIZE = 5;

/** The archive behind the lead post: a grid of cards, paged in the browser. */
export function BlogPostList({ posts, listTitle }: { posts: PostMeta[]; listTitle: string }) {
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLElement>(null);
  const { pager } = blog;

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const pagePosts = posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
  const windowEnd = Math.min(totalPages, Math.max(1, page - Math.floor(PAGER_SIZE / 2)) + PAGER_SIZE - 1);
  const windowStart = Math.max(1, windowEnd - PAGER_SIZE + 1);
  const visiblePages = Array.from({ length: windowEnd - windowStart + 1 }, (_, index) => windowStart + index);

  // Back to the top of the archive, not of the document: the first row of the new page is what was asked for.
  const goTo = (next: number) => {
    setPage(next);
    topRef.current?.scrollIntoView({ block: "start" });
  };

  return (
    <section id="posts" ref={topRef} aria-labelledby="blog-archive-heading" className="band scroll-mt-16 py-20 lg:py-28">
      <div className="shell">
        <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h2 id="blog-archive-heading" className="text-headline text-[clamp(1.75rem,3vw,2.25rem)] font-normal tracking-[-0.03em]">
            {listTitle}
          </h2>
          <p className="flex gap-4 font-mono text-[0.75rem] uppercase tracking-[0.08em] text-faint">
            <span>{posts.length === 1 ? blog.postCountOne : format(blog.postCount, { count: posts.length })}</span>
            {totalPages > 1 && <span>{format(blog.pageOf, { page, total: totalPages })}</span>}
          </p>
        </header>

        <ul className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pagePosts.map((post) => (
            <li key={post.slug}>
              <BlogPostCard post={post} />
            </li>
          ))}
        </ul>

        {totalPages > 1 && (
          <nav aria-label={pager.label} className="mt-12">
            <ul className="flex flex-wrap items-center justify-center gap-1.5">
              <PagerButton label={pager.first} disabled={page === 1} onSelect={() => goTo(1)}>
                <ChevronsLeft className="size-4" aria-hidden="true" />
              </PagerButton>
              <PagerButton label={pager.previous} disabled={page === 1} onSelect={() => goTo(page - 1)}>
                <ChevronLeft className="size-4" aria-hidden="true" />
              </PagerButton>
              {visiblePages.map((number) => (
                <PagerButton
                  key={number}
                  label={format(pager.page, { page: number })}
                  current={number === page}
                  disabled={number === page}
                  onSelect={() => goTo(number)}
                >
                  {number}
                </PagerButton>
              ))}
              <PagerButton label={pager.next} disabled={page === totalPages} onSelect={() => goTo(page + 1)}>
                <ChevronRight className="size-4" aria-hidden="true" />
              </PagerButton>
              <PagerButton label={pager.last} disabled={page === totalPages} onSelect={() => goTo(totalPages)}>
                <ChevronsRight className="size-4" aria-hidden="true" />
              </PagerButton>
            </ul>
          </nav>
        )}
      </div>
    </section>
  );
}

function PagerButton({
  label,
  current = false,
  disabled,
  onSelect,
  children,
}: {
  label: string;
  current?: boolean;
  disabled: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <li>
      <button
        type="button"
        aria-label={label}
        aria-current={current ? "page" : undefined}
        disabled={disabled}
        onClick={onSelect}
        className={cn(
          "flex size-10 items-center justify-center rounded-full border text-[0.875rem] transition-colors",
          current ? "border-fg bg-fg text-background" : "border-fg/10 text-fg/70 hover:border-fg/25 hover:text-fg disabled:opacity-35",
        )}
      >
        {children}
      </button>
    </li>
  );
}
