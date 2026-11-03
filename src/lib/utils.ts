import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Replaces `{key}` placeholders in a message with values. */
export function format(message: string, values: Record<string, string | number>): string {
  return message.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/** A date as "24 September 2026" (or "24 Sept 2026" when short), in UTC so server and browser agree. */
export function formatDate(iso: string, short = false): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: short ? "short" : "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(iso),
  );
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}
