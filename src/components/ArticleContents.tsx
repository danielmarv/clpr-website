"use client";

import { useEffect, useState } from "react";

import { blog } from "@/content/site";
import type { ArticleHeading } from "@/lib/headings";
import { cn } from "@/lib/utils";

/**
 * A post's contents, marking the section being read: the last heading above a line a third of the way
 * down the viewport. Rendered only for posts with enough sections to navigate; the page decides.
 */
export function ArticleContents({ headings }: { headings: ArticleHeading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id);
  // A primitive, so the effect re-runs when the headings change but not for a fresh array of the same ids.
  const idsKey = headings.map((heading) => heading.id).join("|");

  useEffect(() => {
    const targets = idsKey
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (!targets.length) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.3;
      let current = targets[0];
      for (const target of targets) {
        if (target.getBoundingClientRect().top > line) break;
        current = target;
      }
      setActiveId(current.id);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [idsKey]);

  return (
    <nav aria-label={blog.rail.contents}>
      <p className="text-[0.75rem] font-medium text-fg">{blog.rail.contents}</p>
      <ol className="mt-3 border-l border-fg/10">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={heading.id === activeId ? "true" : undefined}
              className={cn(
                "-ml-px block border-l py-1.5 text-[0.875rem] leading-snug transition-colors",
                heading.level === 3 ? "pl-7" : "pl-4",
                heading.id === activeId ? "border-signal-glow text-fg" : "border-transparent text-fg/55 hover:text-fg",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
