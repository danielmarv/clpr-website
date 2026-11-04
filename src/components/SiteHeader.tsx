"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { ClprMark } from "@/components/ClprMark";
import { GitHubMark } from "@/components/GitHubMark";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { Button } from "@/components/ui/button";
import { headerCta, links, nav, site } from "@/content/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // The nav links point at section headings; what counts is the section around each one.
    const sections = nav.flatMap((item) => {
      // Only in-page anchors take part in the scroll-spy; a path (the explainer) is a separate page.
      if (!item.href.startsWith("#")) return [];
      const target = document.querySelector<HTMLElement>(item.href);
      return target ? [{ href: item.href, element: target.closest("section") ?? target }] : [];
    });
    // The marker slides to the active item; it keeps its last place while it fades out.
    const placeMarker = (href: string | null) => {
      const list = listRef.current;
      const marker = markerRef.current;
      if (!list || !marker) return;
      const item = href ? list.querySelector<HTMLElement>(`a[href="${href}"]`) : null;
      marker.style.opacity = item ? "1" : "0";
      if (!item) return;
      const left = item.getBoundingClientRect().left - list.getBoundingClientRect().left - list.clientLeft;
      marker.style.width = `${item.offsetWidth}px`;
      marker.style.transform = `translateX(${left}px)`;
    };
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
      // A section is being read while it crosses a line 40% down the viewport.
      const line = window.innerHeight * 0.4;
      const current = sections.findLast(({ element }) => element.getBoundingClientRect().top <= line);
      const href = current && current.element.getBoundingClientRect().bottom > line ? current.href : null;
      setActive(href);
      placeMarker(href);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // The labels change width once the web font has loaded.
    document.fonts?.ready.then(onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const wide = window.matchMedia("(min-width: 78rem)");
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

      {/* Beside the theme switch the pill nav needs 78rem; below that the menu button takes over. */}
      <div className="shell grid h-16 grid-cols-[1fr_auto] items-center gap-6 min-[78rem]:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          aria-label={site.homeLabel}
          className="flex items-center gap-2.5 justify-self-start"
          onClick={() => setOpen(false)}
        >
          <ClprMark className="h-5" />
          <span className="text-[1.125rem] font-semibold tracking-[-0.01em]">{site.name}</span>
        </Link>

        <nav aria-label="Main" className="hidden min-[78rem]:block">
          <ul
            ref={listRef}
            className="relative flex items-center rounded-full border border-fg/8 bg-fg/3 p-1 backdrop-blur-md"
          >
            <span
              ref={markerRef}
              aria-hidden="true"
              className="absolute left-0 top-1 h-[calc(100%-0.5rem)] rounded-full bg-fg/9 opacity-0 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] transition-[transform,width,opacity] duration-500 ease-out-expo"
            />
            {nav.map((item) => (
              <li key={item.href} className="relative">
                <a
                  href={item.href}
                  aria-current={active === item.href ? "true" : undefined}
                  className={cn(
                    "block rounded-full px-3.5 py-1.5 text-[0.875rem] transition-colors",
                    active === item.href ? "text-fg" : "text-fg/60 hover:text-fg",
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 justify-self-end min-[78rem]:gap-2">
          <ThemeSwitch className="mr-1" />
          <Button asChild variant="ghost" size="sm" className="max-[78rem]:hidden">
            <a href={links.githubOrg} target="_blank" rel="noreferrer">
              <GitHubMark />
              {site.githubLabel}
            </a>
          </Button>
          <Button asChild size="sm" className="max-[78rem]:hidden">
            <a href={headerCta.href}>{headerCta.label}</a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="min-[78rem]:hidden"
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
          className="fade-up h-[calc(100dvh-4rem)] overflow-y-auto border-t border-fg/7 bg-background/92 min-[78rem]:hidden"
        >
          <div className="shell flex min-h-full flex-col pb-8 pt-4">
            <ul className="flex flex-col">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active === item.href ? "true" : undefined}
                    className={cn(
                      "flex items-center justify-between border-b border-fg/7 py-4 text-[1.375rem] font-medium tracking-[-0.02em]",
                      active === item.href ? "text-fg" : "text-fg/75",
                    )}
                  >
                    {item.label}
                    {active === item.href && <span className="size-1.5 rounded-full bg-signal-glow" aria-hidden="true" />}
                  </a>
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
