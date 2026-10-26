"use client";

import { animate, createAnimatable, createScope, stagger } from "animejs";
import { useEffect, useRef, type ReactNode } from "react";

/** A small client boundary keeps the page content server rendered. */
export function SiteMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  // Cards marked data-spotlight light up where the pointer is; elements marked
  // data-pointer-glow follow the pointer even when it is beside them.
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const pointer = { x: 0, y: 0, seen: false };
    const track = (target: HTMLElement) => {
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${pointer.x - rect.left}px`);
      target.style.setProperty("--my", `${pointer.y - rect.top}px`);
    };
    const trackGlows = () => {
      if (!pointer.seen) return;
      element.querySelectorAll<HTMLElement>("[data-pointer-glow]").forEach((glow) => {
        const rect = glow.getBoundingClientRect();
        if (rect.bottom > -200 && rect.top < window.innerHeight + 200) track(glow);
      });
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      Object.assign(pointer, { x: event.clientX, y: event.clientY, seen: true });
      const card = (event.target as Element | null)?.closest<HTMLElement>("[data-spotlight]");
      if (card) track(card);
      trackGlows();
    };
    element.addEventListener("pointermove", onPointerMove, { passive: true });
    // A still pointer over a scrolling page keeps the glow under it.
    window.addEventListener("scroll", trackGlows, { passive: true });
    return () => {
      element.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", trackGlows);
    };
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let dispose = () => {};
    const setup = () => {
      dispose();
      dispose = () => {};
      if (preference.matches) return;

      const scope = createScope({ root });
      const listeners: (() => void)[] = [];
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.filter((entry) => entry.isIntersecting);
          if (!visible.length) return;
          scope.addOnce(() => {
            animate(visible.map((entry) => entry.target), {
              opacity: [0.35, 1],
              y: [24, 0],
              duration: 750,
              delay: stagger(70),
              ease: "out(4)",
            });
          });
          visible.forEach((entry) => observer.unobserve(entry.target));
        },
        { threshold: 0.12, rootMargin: "0px 0px -32px 0px" },
      );

      scope.add(() => {
        // Content is visible by default, including before hydration and without JS.
        // Only run the intro when the visitor is actually at the top of the page.
        if (window.scrollY < 80) {
          animate("[data-hero-reveal]", {
            opacity: [0, 1],
            y: [22, 0],
            duration: 900,
            delay: stagger(90, { start: 500 }),
            ease: "out(4)",
          });
        }

        element.querySelectorAll<HTMLElement>("[data-motion-reveal]").forEach((target) => {
          observer.observe(target);
        });

        element.querySelectorAll<HTMLElement>('[data-slot="button"]').forEach((target) => {
          const motion = createAnimatable(target, { scale: 220, ease: "out(3)" });
          let hovered = false;
          let focused = false;
          const update = () => motion.scale(hovered || focused ? 1.035 : 1);
          const enter = (event: PointerEvent) => {
            if (event.pointerType !== "mouse") return;
            hovered = true;
            update();
          };
          const leave = () => { hovered = false; update(); };
          const focus = () => { focused = true; update(); };
          const blur = () => { focused = false; update(); };
          target.addEventListener("pointerenter", enter);
          target.addEventListener("pointerleave", leave);
          target.addEventListener("focus", focus);
          target.addEventListener("blur", blur);
          listeners.push(() => {
            target.removeEventListener("pointerenter", enter);
            target.removeEventListener("pointerleave", leave);
            target.removeEventListener("focus", focus);
            target.removeEventListener("blur", blur);
          });
        });
      });

      dispose = () => {
        observer.disconnect();
        listeners.forEach((remove) => remove());
        scope.revert();
      };
    };

    setup();
    preference.addEventListener("change", setup);
    return () => {
      preference.removeEventListener("change", setup);
      dispose();
    };
  }, []);

  return <div ref={root}>{children}</div>;
}
