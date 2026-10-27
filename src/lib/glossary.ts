import { glossary } from "@/content/site";

export type Term = (typeof glossary.terms)[number];

export const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Longest names first, so "Data Message" wins over "Message".
export const TERM_PATTERN = new RegExp(
  `\\b(${[...glossary.terms]
    .map((item) => item.term)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|")})(?:s)?\\b`,
  "gi",
);
export const TERM_BY_NAME = new Map<string, Term>(glossary.terms.map((item) => [item.term.toLowerCase(), item]));

function mentionsIn(definition: string): string[] {
  return [...definition.matchAll(TERM_PATTERN)].flatMap((match) => {
    const name = TERM_BY_NAME.get(match[1].toLowerCase())?.term;
    return name ? [name] : [];
  });
}

/**
 * Terms a definition mentions, plus terms whose definitions mention it. The
 * glossary links these, and the term map (TermMap) draws them as fibres.
 */
export const RELATED = new Map<string, string[]>(
  glossary.terms.map((item) => {
    const outgoing = mentionsIn(item.definition);
    const incoming = glossary.terms.filter((other) => mentionsIn(other.definition).includes(item.term)).map((other) => other.term);
    return [item.term, [...new Set([...outgoing, ...incoming])].filter((name) => name !== item.term)];
  }),
);

/** Other sections link to a term: the glossary selects it when this event fires. */
export const SHOW_TERM_EVENT = "clpr:show-term";

/** Selects a term in the glossary and scrolls to it. */
export function showTerm(name: string) {
  window.dispatchEvent(new CustomEvent<string>(SHOW_TERM_EVENT, { detail: name }));
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(glossary.id)?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
}
