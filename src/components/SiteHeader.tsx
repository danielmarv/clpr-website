"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { ClprMark } from "@/components/ClprMark";
import { GitHubMark } from "@/components/GitHubMark";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { Button } from "@/components/ui/button";
import { headerCta, links, nav, site } from "@/content/site";
import { cn } from "@/lib/utils";

// The explainer under /plumbing/ is static HTML served beside the app, not a route of it.
function PageLink({ href, className, current, onClick, children }: { href: string; className: string; current: boolean; onClick?: () => void; children: ReactNode }) {
  const props = { href, className, onClick, "aria-current": current ? ("page" as const) : undefined };
  return href.startsWith("/plumbing/") ? <a {...props}>{children}</a> : <Link {...props}>{children}</Link>;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Every nav href is a section of the site ending in "/", so a post under /blog/ marks Blog.
  const isCurrent = (href: string) => pathname.startsWith(href);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const wide = window.matchMedia("(min-width: 64rem)");
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onWide = () => {
      if (wide.matches) setOpen(false);
    };
    const root = document.documentElement;
    root.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b text-fg transition-[background-color,border-color] duration-300",
        scrolled || open
          ? "border-fg/7 bg-background/72 backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-transparent",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-background"
      >
        {site.skipLink}
      </a>

      {/* Beside the theme switch the pill nav needs 64rem; below that the menu button takes over. */}
      <div className="shell grid h-16 grid-cols-[1fr_auto] items-center gap-6 min-[64rem]:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          aria-label={site.homeLabel}
          className="flex items-center gap-2.5 justify-self-start"
          onClick={() => setOpen(false)}
        >
          <ClprMark className="h-5" />
          <span className="text-[1.125rem] font-semibold tracking-[-0.01em]">{site.name}</span>
        </Link>

        <nav aria-label="Main" className="hidden min-[64rem]:block">
          <ul className="flex items-center rounded-full border border-fg/8 bg-fg/3 p-1 backdrop-blur-md">
            {nav.map((item) => (
              <li key={item.href}>
                <PageLink
                  href={item.href}
                  current={isCurrent(item.href)}
                  className={cn(
                    "block rounded-full px-3.5 py-1.5 text-[0.875rem] transition-colors",
                    isCurrent(item.href)
                      ? "bg-fg/9 text-fg shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]"
                      : "text-fg/60 hover:text-fg",
                  )}
                >
                  {item.label}
                </PageLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 justify-self-end min-[64rem]:gap-2">
          <ThemeSwitch className="mr-1" />
          <Button asChild variant="ghost" size="sm" className="max-[64rem]:hidden">
            <a href={links.githubOrg} target="_blank" rel="noreferrer">
              <GitHubMark />
              {site.githubLabel}
            </a>
          </Button>
          <Button asChild size="sm" className="max-[64rem]:hidden">
            <a href={headerCta.href}>{headerCta.label}</a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="min-[64rem]:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? site.menuClose : site.menuOpen}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="fade-up h-[calc(100dvh-4rem)] overflow-y-auto border-t border-fg/7 bg-background/92 min-[64rem]:hidden"
        >
          <div className="shell flex min-h-full flex-col pb-8 pt-4">
            <ul className="flex flex-col">
              {nav.map((item) => (
                <li key={item.href}>
                  <PageLink
                    href={item.href}
                    current={isCurrent(item.href)}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between border-b border-fg/7 py-4 text-[1.375rem] font-medium tracking-[-0.02em]",
                      isCurrent(item.href) ? "text-fg" : "text-fg/75",
                    )}
                  >
                    {item.label}
                    {isCurrent(item.href) && <span className="size-1.5 rounded-full bg-signal-glow" aria-hidden="true" />}
                  </PageLink>
                </li>
              ))}
            </ul>
            <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
              <Button asChild variant="secondary" size="lg">
                <a href={links.githubOrg} target="_blank" rel="noreferrer">
                  <GitHubMark />
                  {site.githubLabel}
                </a>
              </Button>
              <Button asChild size="lg">
                <a href={headerCta.href} onClick={() => setOpen(false)}>
                  {headerCta.label}
                </a>
              </Button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
