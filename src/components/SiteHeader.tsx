"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { ClprMark } from "@/components/ClprMark";
import { GitHubMark } from "@/components/GitHubMark";
import { Button } from "@/components/ui/button";
import { headerCta, links, nav, site } from "@/content/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  // Transparent over the hero, frosted once the page scrolls.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b text-white transition-[background-color,border-color] duration-300",
        scrolled || open
          ? "border-white/7 bg-[#07060d]/70 backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-transparent",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-night"
      >
        {site.skipLink}
      </a>

      <div className="shell flex h-16 items-center gap-6">
        <Link
          href="/"
          aria-label={site.homeLabel}
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <ClprMark className="h-5" />
          <span className="text-[1.125rem] font-semibold tracking-[-0.01em]">{site.name}</span>
        </Link>

        <nav aria-label="Main" className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-0.5">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-[0.875rem] text-white/65 transition-colors hover:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:ml-0 lg:flex">
          <Button asChild variant="ghost" size="sm">
            <a href={links.githubOrg} target="_blank" rel="noreferrer">
              <GitHubMark />
              {site.githubLabel}
            </a>
          </Button>
          <Button asChild size="sm">
            <a href={headerCta.href}>{headerCta.label}</a>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="ml-auto lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? site.menuClose : site.menuOpen}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Main" className="shell border-t border-white/7 pb-6 pt-2 lg:hidden">
          <ul className="flex flex-col">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-white/7 py-3.5 text-lg text-white/90"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button asChild variant="secondary">
              <a href={links.githubOrg} target="_blank" rel="noreferrer">
                <GitHubMark />
                {site.githubLabel}
              </a>
            </Button>
            <Button asChild>
              <a href={headerCta.href} onClick={() => setOpen(false)}>
                {headerCta.label}
              </a>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
