import { Children, isValidElement, type ReactNode } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { footer } from "@/content/site";
import { createSlugger } from "@/lib/headings";
import { isExternal } from "@/lib/utils";

/** The words a heading renders as, whatever inline markup it is built from. */
function textOf(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") return String(child);
      if (isValidElement(child)) return textOf((child.props as { children?: ReactNode }).children);
      return "";
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * A post's Markdown (GitHub flavoured, raw HTML skipped), styled by .post-prose in globals.css. Headings
 * take their ids from the same slugger as the contents list (lib/headings.ts), in the same order.
 */
export function PostBody({ markdown, className }: { markdown: string; className?: string }) {
  const slug = createSlugger();
  const anchored = (Tag: "h1" | "h2" | "h3") => {
    function AnchoredHeading({ children }: { children?: ReactNode }) {
      return <Tag id={slug(textOf(children))}>{children}</Tag>;
    }
    AnchoredHeading.displayName = `Anchored${Tag.toUpperCase()}`;
    return AnchoredHeading;
  };

  return (
    <div className={className}>
      <ReactMarkdown
        skipHtml
        remarkPlugins={[remarkGfm]}
        components={{
          h1: anchored("h1"),
          h2: anchored("h2"),
          h3: anchored("h3"),
          a({ href = "", children }) {
            if (!href) return <>{children}</>;
            if (isExternal(href) || href.startsWith("mailto:")) {
              return (
                <a href={href} target="_blank" rel="noreferrer">
                  {children}
                  <span className="sr-only"> ({footer.newTab})</span>
                </a>
              );
            }
            // The explainer under /plumbing/ is static HTML beside the app, not a route of it.
            return href.startsWith("/plumbing/") ? <a href={href}>{children}</a> : <Link href={href}>{children}</Link>;
          },
          // A wide table scrolls inside its own frame rather than widening the reading column.
          table({ children }) {
            return (
              <div className="post-prose-table">
                <table>{children}</table>
              </div>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
