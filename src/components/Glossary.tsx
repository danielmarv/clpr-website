"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";

import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { glossary } from "@/content/site";
import { escapeRegExp, RELATED, TERM_BY_NAME, TERM_PATTERN, type Term } from "@/lib/glossary";
import { cn, format } from "@/lib/utils";

type Category = "all" | (typeof glossary.categories)[number];

function highlight(text: string, needle: string): ReactNode {
  if (!needle) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(needle)})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === needle ? (
      <mark key={index} className="rounded-sm bg-signal-glow/25 px-0.5 text-white">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function Glossary() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [selectedName, setSelectedName] = useState<string>(glossary.terms[0].term);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const inputId = useId();

  const needle = query.trim().toLowerCase();
  const terms = glossary.terms.filter(
    (item) =>
      (category === "all" || item.category === category) &&
      (!needle || item.term.toLowerCase().includes(needle) || item.definition.toLowerCase().includes(needle)),
  );
  const selected = terms.find((item) => item.term === selectedName) ?? terms[0];
  const selectedIndex = selected ? terms.indexOf(selected) : -1;

  const choose = (name: string, focus = false) => {
    // Jumping to a term hidden by the filters clears them first.
    if (!terms.some((item) => item.term === name)) {
      setCategory("all");
      setQuery("");
    }
    setSelectedName(name);
    if (focus) itemRefs.current.get(name)?.focus();
  };

  const step = (offset: number) => {
    if (terms.length === 0) return;
    const next = terms[(selectedIndex + offset + terms.length) % terms.length];
    choose(next.term, true);
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      step(-1);
    }
  };

  const detail = (compact: boolean) =>
    selected && (
      <TermDetail
        term={selected}
        index={selectedIndex}
        count={terms.length}
        compact={compact}
        onChoose={(name) => choose(name)}
        onStep={step}
      />
    );

  return (
    <section
      aria-labelledby={glossary.id}
      data-form="knowledge"
      // The background draws the terms as a knowledge graph and lights up the selected one.
      data-form-focus={selected ? glossary.terms.indexOf(selected) : -1}
      className="shell py-20 lg:py-28"
    >
      <SectionHeading id={glossary.id} eyebrow={glossary.eyebrow} title={glossary.title} lead={glossary.lead} illustrated />

      <div className="panel mt-10 p-5 sm:p-8 lg:mt-14 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <label htmlFor={inputId} className="sr-only">
              {glossary.filterLabel}
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id={inputId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={glossary.filterPlaceholder}
                className="pl-10"
                aria-controls={`${inputId}-results`}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Categories">
              {(["all", ...glossary.categories] as Category[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-[0.85rem] transition-colors",
                    category === item
                      ? "border-white bg-white text-night"
                      : "border-white/10 text-white/70 hover:border-white/25 hover:text-white",
                  )}
                >
                  {item === "all" ? glossary.allLabel : item}
                </button>
              ))}
            </div>

            <div id={`${inputId}-results`} aria-live="polite" className="mt-6">
              {terms.length > 0 ? (
                <ul onKeyDown={onListKeyDown} className="flex flex-col gap-1 lg:max-h-[32rem] lg:overflow-y-auto lg:pr-1">
                  {terms.map((item) => {
                    const isSelected = item === selected;
                    return (
                      <li key={item.term}>
                        <button
                          ref={(element) => {
                            if (element) itemRefs.current.set(item.term, element);
                            else itemRefs.current.delete(item.term);
                          }}
                          type="button"
                          aria-current={isSelected ? "true" : undefined}
                          onClick={() => choose(item.term)}
                          className={cn(
                            "flex w-full items-center justify-between gap-4 rounded-lg px-4 py-3 text-left transition-colors",
                            isSelected ? "bg-white/7 text-white" : "text-white/75 hover:bg-white/3 hover:text-white",
                          )}
                        >
                          <span className="text-[1.02rem]">{highlight(item.term, needle)}</span>
                          <span className={cn("text-[0.75rem]", isSelected ? "text-white/60" : "text-muted-foreground")}>
                            {item.category}
                          </span>
                        </button>
                        {isSelected && <div className="mt-2 lg:hidden">{detail(true)}</div>}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-start gap-4 py-4">
                  <p className="text-muted-foreground">
                    {format(glossary.emptyState, { query: query.trim(), count: glossary.terms.length })}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery("");
                      setCategory("all");
                    }}
                  >
                    <X />
                    {glossary.clearLabel}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:col-span-7 lg:block">
            <div className="sticky top-28">{detail(false)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TermDetail({
  term,
  index,
  count,
  compact,
  onChoose,
  onStep,
}: {
  term: Term;
  index: number;
  count: number;
  compact: boolean;
  onChoose: (name: string) => void;
  onStep: (offset: number) => void;
}) {
  const related = RELATED.get(term.term) ?? [];

  // Render the definition with every other glossary term as a link to its entry.
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const match of term.definition.matchAll(TERM_PATTERN)) {
    const target = TERM_BY_NAME.get(match[1].toLowerCase());
    const start = match.index ?? 0;
    if (!target || target.term === term.term) continue;
    parts.push(term.definition.slice(cursor, start));
    parts.push(
      <button
        key={start}
        type="button"
        onClick={() => onChoose(target.term)}
        className="text-white underline decoration-signal-glow/70 decoration-1 underline-offset-[5px] transition-colors hover:decoration-signal-glow"
      >
        {match[0]}
      </button>,
    );
    cursor = start + match[0].length;
  }
  parts.push(term.definition.slice(cursor));

  return (
    <article
      className={cn(
        "relative isolate overflow-hidden rounded-panel border border-signal-glow/20 bg-[linear-gradient(160deg,rgb(40_26_102/0.7),rgb(13_11_26/0.95)_60%,rgb(54_16_50/0.6))] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.07)]",
        compact ? "p-5" : "min-h-[26rem] p-10",
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 -z-10 size-80 rounded-full bg-violet/40 blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-20 -z-10 size-72 rounded-full bg-magenta/25 blur-[90px]"
      />

      <div className="flex items-center justify-between gap-4">
        <p className="text-[0.8125rem] font-medium text-signal-ink">{term.category}</p>
        <p className="text-[0.78rem] tabular-nums text-white/50">
          {format(glossary.position, { index: index + 1, count })}
        </p>
      </div>

      {!compact && (
        <h3 key={term.term} className="fade-up text-headline mt-8 text-[2.5rem] font-medium leading-tight tracking-[-0.035em]">
          {term.term}
        </h3>
      )}
      <p
        key={`${term.term}-definition`}
        className={cn("fade-up font-light text-white/85", compact ? "mt-3 text-[1.05rem] leading-relaxed" : "mt-5 text-xl leading-relaxed")}
      >
        {parts}
      </p>

      {related.length > 0 && (
        <div className={compact ? "mt-5" : "mt-10"}>
          <p className="text-[0.8125rem] font-medium text-white/55">{glossary.relatedLabel}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {related.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => onChoose(name)}
                  className="rounded-full border border-white/15 px-3 py-1 text-[0.85rem] text-white/85 transition-colors hover:border-white hover:bg-white hover:text-night"
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!compact && count > 1 && (
        <div className="mt-10 flex gap-2">
          <Button variant="outline" size="icon" onClick={() => onStep(-1)} aria-label={glossary.previous}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onStep(1)} aria-label={glossary.next}>
            <ChevronRight />
          </Button>
        </div>
      )}
    </article>
  );
}
