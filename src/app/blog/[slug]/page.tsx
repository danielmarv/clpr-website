import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { blog, footer } from "@/content/site";
import { formatDate } from "@/lib/utils";

// Every post is known at build time; any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return blog.posts.map((post) => ({ slug: post.slug }));
}

function findPost(slug: string) {
  return blog.posts.find((post) => post.slug === slug);
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = findPost((await props.params).slug);
  return post ? { title: post.title, description: post.summary } : {};
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const post = findPost((await props.params).slug);
  if (!post) notFound();

  return (
    <PageShell>
      <article className="shell max-w-3xl pb-20 pt-16 lg:pb-28 lg:pt-24">
        <Link
          href="/blog/"
          className="group inline-flex items-center gap-2 text-[0.875rem] text-fg/60 transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true" />
          {blog.backLabel}
        </Link>
        <header className="mt-10">
          <time data-hero-reveal dateTime={post.date} className="text-[0.875rem] text-faint">
            {formatDate(post.date)}
          </time>
          <h1
            data-hero-reveal
            className="text-headline mt-3 text-[clamp(2rem,4.2vw,3.25rem)] font-light leading-[1.08] tracking-[-0.04em] text-balance"
          >
            {post.title}
          </h1>
          <p data-hero-reveal className="mt-5 text-[1.125rem] leading-[1.65] text-muted-foreground">
            {post.summary}
          </p>
        </header>

        <div className="mt-12 space-y-6 border-t border-fg/[0.07] pt-10 text-[1.0625rem] leading-[1.75] text-fg/85">
          {post.body.map((block) =>
            block.kind === "quote" ? (
              <figure key={block.text} className="border-l-2 border-signal-glow/60 py-1 pl-6">
                <blockquote className="text-[1.125rem] leading-[1.7] text-fg">“{block.text}”</blockquote>
                <figcaption className="mt-4 text-[0.875rem] leading-relaxed text-muted-foreground">
                  <span className="font-medium text-fg">{block.name}</span>, {block.role}
                </figcaption>
              </figure>
            ) : (
              <p key={block.text}>{block.text}</p>
            ),
          )}
        </div>

        {"cta" in post && (
          <Button asChild size="lg" variant="secondary" className="mt-10">
            <a href={post.cta.href} target="_blank" rel="noreferrer">
              {post.cta.label}
              <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
        )}

        <footer className="mt-14 border-t border-fg/[0.07] pt-8">
          <h2 className="text-[0.8125rem] font-medium text-fg">{blog.sourcesLabel}</h2>
          <ul className="mt-3 space-y-2">
            {post.sources.map((source) => (
              <li key={source.href}>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[0.875rem] text-fg/60 underline decoration-fg/20 underline-offset-2 transition-colors hover:text-fg hover:decoration-current"
                >
                  {source.label}
                  <span className="sr-only"> ({footer.newTab})</span>
                </a>
              </li>
            ))}
          </ul>
        </footer>
      </article>
    </PageShell>
  );
}
