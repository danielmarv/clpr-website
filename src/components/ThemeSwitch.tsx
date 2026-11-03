"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";

import { site } from "@/content/site";
import { DEFAULT_THEME, setThemeChoice, syncThemeColor, themeChoice, watchTheme, type ThemeChoice } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { value: ThemeChoice; icon: LucideIcon }[] = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
];

// globals.css marks the chosen option from data-theme, so it is right before React hydrates;
// aria-pressed follows once React has read the choice.
export function ThemeSwitch({ className }: { className?: string }) {
  const choice = useSyncExternalStore(watchTheme, themeChoice, () => DEFAULT_THEME);

  useEffect(() => {
    syncThemeColor();
    return watchTheme(syncThemeColor);
  }, []);

  return (
    <div
      role="group"
      aria-label={site.theme.label}
      className={cn("flex items-center gap-0.5 rounded-full border border-fg/10 bg-fg/3 p-0.5", className)}
    >
      {OPTIONS.map(({ value, icon: Icon }) => (
        <button
          key={value}
          type="button"
          data-theme-option={value}
          aria-pressed={choice === value}
          aria-label={site.theme[value]}
          title={site.theme[value]}
          onClick={() => setThemeChoice(value)}
          className="flex size-7 items-center justify-center rounded-full text-fg/55 transition-colors hover:text-fg"
        >
          <Icon className="size-3.5" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
