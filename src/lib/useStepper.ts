"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function subscribeToVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

/**
 * Steps that play on their own while in view, for the walkthroughs. Playback
 * follows the visitor's motion preference until they pick a step or press
 * play or pause; it waits while the element is off screen or the tab is hidden.
 * `jump` is true after a long jump (wrapping around, or picking a step far
 * away), so drawings can move without travelling.
 */
export function useStepper(count: number, durationMs: number) {
  const root = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [jump, setJump] = useState(false);
  const [inView, setInView] = useState(false);
  // null follows the visitor's motion preference; manual selection pauses playback.
  const [playPreference, setPlayPreference] = useState<boolean | null>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
  const pageVisible = useSyncExternalStore(
    subscribeToVisibility,
    () => !document.hidden,
    () => true,
  );
  const isPlaying = playPreference ?? !reducedMotion;
  const running = isPlaying && inView && pageVisible;

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      const next = (index + 1) % count;
      setJump(next === 0);
      setIndex(next);
    }, durationMs);
    return () => window.clearTimeout(timer);
  }, [running, index, count, durationMs]);

  const goTo = (target: number) => {
    const next = (target + count) % count;
    setPlayPreference(false);
    setJump(Math.abs(next - index) > 1);
    setIndex(next);
  };

  const togglePlay = () => setPlayPreference(!isPlaying);

  /** Arrow keys, Home and End on a list of buttons marked `data-step-index`. */
  const onStepKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-step-index]");
    if (!button) return;
    const current = Number(button.dataset.stepIndex);
    const next =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? (current + 1) % count
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? (current - 1 + count) % count
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? count - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    goTo(next);
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-step-index="${next}"]`)?.focus();
  };

  return { root, index, jump, isPlaying, running, reducedMotion, goTo, togglePlay, onStepKeyDown };
}
