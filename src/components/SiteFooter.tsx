import Image from "next/image";
import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";

import { ClprMark } from "@/components/ClprMark";
import { footer, links, origins, site } from "@/content/site";
import { format, isExternal } from "@/lib/utils";

const [hashgraph, hedera, hiero] = origins.logos;

function Hexagon({ tone }: { tone: string }) {
  return (
    <svg viewBox="-10 -10 20 20" className="size-[1.125rem] shrink-0" fill="none" aria-hidden="true">
      <path d="M0 -8.5L7.4 -4.25V4.25L0 8.5L-7.4 4.25V-4.25Z" fill="#07060d" stroke={tone} strokeWidth={1.4} />
    </svg>
  );
}

/**
 * The footer's top edge as a Channel: two Endpoints joined by a twisted bundle
 * of fibres, a message crossing one way and its response the other.
 */
function ChannelEdge() {
  return (
    <div aria-hidden="true" className="shell pointer-events-none absolute inset-x-0 top-0 -translate-y-1/2">
      <div className="flex items-center">
        <Hexagon tone="var(--signal-glow)" />
        <div className="relative h-5 flex-1">
          <svg viewBox="0 0 1000 20" preserveAspectRatio="none" className="absolute inset-0 size-full" fill="none">
            <defs>
              <linearGradient id="footer-channel" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="var(--signal-glow)" />
                <stop offset="1" stopColor="var(--proof-glow)" />
              </linearGradient>
            </defs>
            {[-2, -1, 0, 1, 2].map((k) => (
              <path
                key={k}
                d={`M0 10C330 ${10 + k * 4} 670 ${10 - k * 4} 1000 10`}
                stroke="url(#footer-channel)"
                strokeOpacity={0.7}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
          <span className="footer-packet absolute top-1/2 size-1.5 rounded-full bg-white shadow-[0_0_10px_3px_rgb(157_139_255/0.8)]" />
          <span className="footer-packet footer-packet-back absolute top-1/2 size-1.5 rounded-full bg-peach shadow-[0_0_10px_3px_rgb(255_180_154/0.6)]" />
        </div>
        <Hexagon tone="var(--proof-glow)" />
      </div>
    </div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  const className = "group text-[0.9375rem] leading-snug text-white/55 transition-colors hover:text-white";
  if (!isExternal(href)) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {label}
      {/* Inline, so it stays with the last word when the label wraps. */}
      <ArrowUpRight
        className="ml-1 inline-block size-3.5 align-[-0.15em] text-white/30 transition-[color,transform] group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-white"
        aria-hidden="true"
      />
      <span className="sr-only"> ({footer.newTab})</span>
    </a>
  );
}

function Logo({ href, src, alt, width, height, className }: { href: string; src: string; alt: string; width: number; height: number; className: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex min-h-10 items-center opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100"
    >
      <Image src={src} alt={`${alt} (${footer.newTab})`} width={width} height={height} className={className} />
    </a>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { backing } = footer;

  return (
    <footer className="relative z-10 overflow-x-clip border-t border-white/7 bg-[#07060d]/85 text-white/70 backdrop-blur-xl">
      <ChannelEdge />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[64rem] max-w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgb(108_55_235/0.14),transparent_70%)]"
      />

      <div className="shell relative pt-16 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" aria-label={site.homeLabel} className="inline-flex items-center gap-2.5 text-white">
              <ClprMark className="h-6" />
              <span className="text-xl font-semibold tracking-[-0.01em]">{site.name}</span>
            </Link>
            <p className="mt-2 text-[0.875rem] text-white/50">{site.expansion}</p>
            <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed text-white/70">{footer.tagline}</p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:col-span-8">
            {footer.columns.map((column) => (
              <div key={column.title}>
                <h2 className="text-[0.8125rem] font-medium text-white">{column.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((item) => (
                    <li key={item.label}>
                      <FooterLink href={item.href} label={item.label} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Who is behind CLPR: the same three roles as in the hero, with their marks. */}
        <section
          aria-label={backing.label}
          className="mt-14 grid gap-6 border-t border-white/7 pt-8 sm:grid-cols-3 lg:mt-16"
        >
          <div>
            <p className="text-[0.75rem] text-faint">{backing.stewardedBy}</p>
            <Logo href={links.lfdt} src="/logos/lfdt-horizontal-white.svg" alt="LF Decentralized Trust" width={698.7} height={39.1} className="h-3.5 w-auto" />
          </div>
          <div>
            <p className="text-[0.75rem] text-faint">{backing.contributedBy}</p>
            <div className="flex flex-wrap items-center gap-x-6">
              {[hashgraph, hedera].map((logo) => (
                <Logo
                  key={logo.name}
                  href={logo.href}
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width}
                  height={logo.height}
                  className={`${logo.className} brightness-0 invert`}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[0.75rem] text-faint">{backing.builtInto}</p>
            <Logo href={hiero.href} src={hiero.src} alt={hiero.name} width={hiero.width} height={hiero.height} className={`${hiero.className} brightness-0 invert`} />
          </div>
        </section>
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
          <a href="#main" className="inline-flex shrink-0 items-center gap-1.5 text-white/70 transition-colors hover:text-white">
            {footer.backToTop}
            <ArrowUp className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
