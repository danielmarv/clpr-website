// The colour theme. Light is the default; the visitor can choose Light, Dark or System. The choice is
// data-theme on <html>, saved as localStorage "theme" (the explainer under /plumbing/ reads the same key).
// globals.css turns it into colours: dark for Dark, and for System when the system is dark.

export type ThemeChoice = "light" | "dark" | "system";
export type Theme = "light" | "dark";

export const THEME_KEY = "theme";
export const DEFAULT_THEME: ThemeChoice = "light";

/** The page background of each theme (--bg in globals.css), for the browser's own chrome. */
export const THEME_COLOR: Record<Theme, string> = { light: "#f6f5fb", dark: "#0c0b1d" };

const SYSTEM_DARK = "(prefers-color-scheme: dark)";

/** Runs in <head> before the first paint, so a saved choice never flashes the default. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark"||t==="system")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export function themeChoice(): ThemeChoice {
  const chosen = document.documentElement.getAttribute("data-theme");
  return chosen === "dark" || chosen === "system" ? chosen : DEFAULT_THEME;
}

/** The theme in effect: the choice, with System resolved against the system's setting. */
export function currentTheme(): Theme {
  const choice = themeChoice();
  if (choice === "system") return window.matchMedia(SYSTEM_DARK).matches ? "dark" : "light";
  return choice;
}

export function setThemeChoice(choice: ThemeChoice) {
  document.documentElement.setAttribute("data-theme", choice);
  try {
    localStorage.setItem(THEME_KEY, choice);
  } catch {
    // Private windows may refuse storage; the choice then lasts for this page.
  }
}

/** Points the browser's chrome (meta theme-color) at the theme in effect. */
export function syncThemeColor() {
  const color = THEME_COLOR[currentTheme()];
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.content = color;
  });
}

/** Calls back whenever the theme in effect may have changed, by choice or by the system; returns the cleanup. */
export function watchTheme(callback: () => void): () => void {
  const system = window.matchMedia(SYSTEM_DARK);
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  system.addEventListener("change", callback);
  return () => {
    observer.disconnect();
    system.removeEventListener("change", callback);
  };
}
