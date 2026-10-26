import Image from "next/image";
import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";

import { ClprMark } from "@/components/ClprMark";
import { GitHubMark } from "@/components/GitHubMark";
import { Button } from "@/components/ui/button";
import { footer, links, roadmap, site } from "@/content/site";
import { format, isExternal } from "@/lib/utils";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const phase = roadmap.phases.find((item) => item.current) ?? roadmap.phases[0];

  return (
    <footer className="relative z-10 overflow-hidden border-t border-white/7 bg-[#07060d]/85 text-white/70 backdrop-blur-xl">
      {/* Light along the top edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-signal-glow/60 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[64rem] max-w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgb(108_55_235/0.16),transparent_70%)]"
      />

      <div className="shell relative pt-16 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" aria-label={site.homeLabel} className="inline-flex items-center gap-2.5 text-white">
              <ClprMark className="h-6" />
              <span className="text-xl font-semibold tracking-[-0.01em]">{site.name}</span>
            </Link>
            <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed text-white/70">{footer.tagline}</p>

            <Link
              href="/#roadmap"
              className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[0.8125rem] text-white/75 transition-colors hover:border-white/20 hover:text-white"
            >
              <span className="relative flex size-2" aria-hidden="true">
                <span className="soft-pulse absolute inset-0 rounded-full bg-proof-glow" />
                <span className="absolute inset-0.5 rounded-full bg-proof-glow" />
              </span>
              <span>
                {footer.statusLabel}: <span className="text-white">{phase.name}</span>
                <span className="text-faint"> · {phase.period}</span>
              </span>
            </Link>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Button asChild variant="secondary" size="sm">
                <a href={links.githubOrg} target="_blank" rel="noreferrer">
                  <GitHubMark />
                  {footer.githubCta}
                  <span className="sr-only"> ({footer.newTab})</span>
                </a>
              </Button>
              <a
                href={links.lfdt}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-8 items-center opacity-60 transition-opacity hover:opacity-100"
              >
                <Image
                  src="/logos/lfdt-horizontal-white.svg"
                  alt={`LF Decentralized Trust (${footer.newTab})`}
                  width={698.7}
                  height={39.1}
                  className="h-3 w-auto"
                />
              </a>
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:col-span-8">
            {footer.columns.map((column) => (
              <div key={column.title}>
                <h2 className="text-[0.8125rem] font-medium text-white">{column.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((item) => {
                    const className =
                      "group inline-flex items-start gap-1 text-[0.9375rem] leading-snug text-white/55 transition-colors hover:text-white";
                    return (
                      <li key={item.label}>
                        {isExternal(item.href) ? (
                          <a href={item.href} target="_blank" rel="noreferrer" className={className}>
                            {item.label}
                            <ArrowUpRight
                              className="mt-0.5 size-3.5 shrink-0 text-white/30 transition-[color,transform] group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-white"
                              aria-hidden="true"
                            />
                            <span className="sr-only"> ({footer.newTab})</span>
                          </a>
                        ) : (
                          <Link href={item.href} className={className}>
                            {item.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* The wordmark lights up in the spiral's colors where the pointer is. */}
      <div className="shell relative mt-14 lg:mt-16" aria-hidden="true">
        <p data-pointer-glow className="footer-wordmark">
          {footer.wordmark}
        </p>
      </div>

      <div className="shell relative">
        <div className="flex flex-col gap-4 border-t border-white/7 py-6 text-[0.8125rem] text-white/45 md:flex-row md:items-center md:justify-between md:gap-10">
          <p className="max-w-3xl">{format(footer.legal, { year })}</p>
          <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2">
            <span>{footer.prototypeNote}</span>
            <a href="#main" className="inline-flex items-center gap-1.5 text-white/70 transition-colors hover:text-white">
              {footer.backToTop}
              <ArrowUp className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
