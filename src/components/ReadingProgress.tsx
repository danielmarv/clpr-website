"use client";

import { useEffect, useRef } from "react";

/** A hairline under the header that fills as the element with `targetId` is read. */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      // Read from the moment the body reaches the header to the moment its end is a third up the screen.
      const span = rect.height - window.innerHeight * 0.66;
      const progress = span > 0 ? (64 - rect.top) / span : rect.top < 64 ? 1 : 0;
      bar.current?.style.setProperty("transform", `scaleX(${Math.min(1, Math.max(0, progress))})`);
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
  }, [targetId]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-16 z-40 h-0.5">
      <div
        ref={bar}
        className="h-full origin-left scale-x-0 bg-[linear-gradient(90deg,var(--signal-glow),var(--proof-glow))]"
      />
    </div>
  );
}
