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
 * glossary links these, and the background draws them as a knowledge graph.
 */
export const RELATED = new Map<string, string[]>(
  glossary.terms.map((item) => {
    const outgoing = mentionsIn(item.definition);
    const incoming = glossary.terms.filter((other) => mentionsIn(other.definition).includes(item.term)).map((other) => other.term);
    return [item.term, [...new Set([...outgoing, ...incoming])].filter((name) => name !== item.term)];
  }),
);
