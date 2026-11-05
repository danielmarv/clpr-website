"use client";

import { useId, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, MessageSquare, Search, X } from "lucide-react";

import { footer, issueExplorer as page } from "@/content/site";
import type { Issue } from "@/lib/github";
import { cn, format } from "@/lib/utils";

// The board of the Issue Explorer, after the Hiero website's (src/components/IssueExplorer there): the
// repository tiles, search and sort, the difficulty levels with their counts, and the issues as cards,
// twelve to a page. The filters live in the address, so a filtered board can be shared.

type Sort = "updated" | "created" | "comments";
type Level = (typeof page.levels)[number]["id"];
type Query = { search: string; repository: string | null; level: Level | null; sort: Sort };

/** Twelve: a whole number of rows at one, two and three columns. */
const PER_PAGE = 12;
/** Three place an issue; more make a wall. */
const VISIBLE_LABELS = 3;
const SORTS: Sort[] = ["updated", "created", "comments"];
const DEFAULT: Query = { search: "", repository: null, level: null, sort: "updated" };

// The query string as a store: the server renders the unfiltered board, and a visitor who came by a
// filtered link gets the filter right after hydration. replaceState, so Back leaves the page rather than
// walking back through every keystroke; nothing then fires popstate, hence the listeners.
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("popstate", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}
function write(query: Query) {
  const params = new URLSearchParams();
  if (query.search) params.set("q", query.search);
  if (query.repository) params.set("repo", query.repository);
  if (query.level) params.set("level", query.level);
  if (query.sort !== DEFAULT.sort) params.set("sort", query.sort);
  const search = params.toString();
  window.history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
  listeners.forEach((listener) => listener());
}
function read(search: string): Query {
  const params = new URLSearchParams(search);
  const repository = params.get("repo");
  const level = params.get("level");
  const sort = params.get("sort");
  return {
    search: params.get("q") ?? "",
    repository: page.repositories.some((repo) => repo.name === repository) ? repository : null,
    level: page.levels.find((item) => item.id === level)?.id ?? null,
    sort: SORTS.includes(sort as Sort) ? (sort as Sort) : DEFAULT.sort,
  };
}

/** A label as the level names are written: lower case, no "skill:"-style prefix, single spaces. */
function normalise(label: string): string {
  return label
    .toLowerCase()
    .replace(/^\s*(skill|level|difficulty|complexity)\s*:\s*/, "")
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The level an issue's labels name, the first in the levels' order, or null. */
function levelOf(labels: string[]): Level | null {
  const names = new Set(labels.map(normalise));
  return page.levels.find((level) => level.names.some((name) => names.has(name)))?.id ?? null;
}

/** How long ago, counted from when the issues were fetched so the server and the browser agree. */
function age(iso: string, reference: string): string {
  const days = Math.floor((Date.parse(reference) - Date.parse(iso)) / 86_400_000);
  const { ages } = page;
  if (days <= 0) return ages.today;
  if (days === 1) return ages.yesterday;
  if (days < 14) return format(ages.days, { count: days });
  if (days < 60) return format(ages.weeks, { count: Math.round(days / 7) });
  if (days < 365) return format(ages.months, { count: Math.round(days / 30) });
  const years = Math.round(days / 365);
  return years === 1 ? ages.year : format(ages.years, { count: years });
}

const LEVEL_STYLE: Record<Level, string> = {
  "good-first-issue": "border-signal-glow/40 bg-signal-glow/10 text-signal-ink",
  beginner: "border-fg/15 bg-fg/[0.04] text-fg/75",
  intermediate: "border-fg/25 bg-fg/[0.07] text-fg/85",
  advanced: "border-proof-glow/40 bg-proof-glow/10 text-proof-ink",
};

export function IssueBoard({ issues, fetchedAt }: { issues: Issue[] | null; fetchedAt: string | null }) {
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => "");
  const query = useMemo(() => read(search), [search]);
  const [pageNumber, setPageNumber] = useState(1);
  const boardRef = useRef<HTMLDivElement>(null);
  const searchId = useId();
  const sortId = useId();

  const update = (patch: Partial<Query>) => {
    write({ ...query, ...patch });
    setPageNumber(1);
  };

  const all = useMemo(() => (issues ?? []).map((issue) => ({ ...issue, level: levelOf(issue.labels) })), [issues]);

  // Each count answers "how many would I get if I chose this": taken after the other filters, before its own.
  const searched = useMemo(() => {
    const words = query.search.toLowerCase().split(/\s+/).filter(Boolean);
    return all.filter((issue) => {
      const text = `${issue.title} ${issue.repository} #${issue.number} ${issue.labels.join(" ")}`.toLowerCase();
      return words.every((word) => text.includes(word));
    });
  }, [all, query]);
  const inRepository = useMemo(
    () => (query.repository ? searched.filter((issue) => issue.repository === query.repository) : searched),
    [searched, query],
  );
  const matches = useMemo(() => {
    const list = query.level ? inRepository.filter((issue) => issue.level === query.level) : inRepository;
    const key = (issue: Issue) =>
      query.sort === "comments" ? issue.comments : Date.parse(query.sort === "created" ? issue.createdAt : issue.updatedAt);
    return [...list].sort((a, b) => key(b) - key(a));
  }, [inRepository, query]);

  const totalPages = Math.max(1, Math.ceil(matches.length / PER_PAGE));
  // A filter can shrink the list under the page being read; clamping keeps the reader near where they were.
  const current = Math.min(pageNumber, totalPages);
  const shown = matches.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const filtered = query.search !== "" || query.repository !== null || query.level !== null || query.sort !== DEFAULT.sort;
  const selectedLevel = page.levels.find((level) => level.id === query.level);

  const goTo = (next: number) => {
    setPageNumber(next);
    boardRef.current?.scrollIntoView({ block: "start" });
  };

  return (
    <div ref={boardRef} className="scroll-mt-24">
      <div role="group" aria-label={page.repositoriesLabel} className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {page.repositories.map((repository) => {
          const count = searched.filter((issue) => issue.repository === repository.name).length;
          const active = query.repository === repository.name;
          return (
            <button
              key={repository.name}
              type="button"
              aria-pressed={active}
              onClick={() => update({ repository: active ? null : repository.name })}
              className={cn(
                "panel flex flex-col p-5 text-left transition-colors duration-300 hover:border-fg/20",
                active && "border-signal-glow/60 bg-signal-glow/[0.07] dark:bg-signal-glow/[0.08]",
              )}
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[0.9375rem] font-medium text-fg">{repository.name}</span>
                <span className={cn("font-mono text-[0.75rem]", count ? "text-signal-ink" : "text-faint")}>
                  {count === 1 ? page.openOne : format(page.openMany, { count })}
                </span>
              </span>
              <span className="mt-2 text-[0.875rem] leading-relaxed text-muted-foreground">{repository.body}</span>
            </button>
          );
        })}
      </div>

      <div className="panel mt-4 p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <label htmlFor={searchId} className="sr-only">
              {page.search.label}
            </label>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden="true" />
            <input
              id={searchId}
              type="search"
              value={query.search}
              placeholder={page.search.placeholder}
              autoComplete="off"
              onChange={(event) => update({ search: event.target.value })}
              className="h-11 w-full rounded-full border border-input bg-background/60 pl-10 pr-4 text-base text-foreground transition-colors placeholder:text-faint focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring/30"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor={sortId} className="shrink-0 text-[0.8125rem] text-faint">
              {page.sort.label}
            </label>
            <select
              id={sortId}
              value={query.sort}
              onChange={(event) => update({ sort: event.target.value as Sort })}
              className="h-11 w-full rounded-full border border-input bg-background/60 px-4 text-[0.9375rem] text-foreground transition-colors focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring/30 sm:w-auto"
            >
              {SORTS.map((sort) => (
                <option key={sort} value={sort}>
                  {page.sort[sort]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div role="group" aria-label={page.difficultyLabel} className="-mx-1 mt-3 flex gap-1 overflow-x-auto px-1 pb-0.5">
          {[{ id: null, label: page.everything }, ...page.levels].map((level) => {
            const count = level.id ? inRepository.filter((issue) => issue.level === level.id).length : inRepository.length;
            const active = query.level === level.id;
            return (
              <button
                key={level.label}
                type="button"
                aria-pressed={active}
                // Not disabled at zero: an empty level is information, and a disabled button cannot be reached.
                aria-label={`${level.label}, ${count === 1 ? page.tally.one : format(page.tally.many, { count })}`}
                onClick={() => update({ level: level.id })}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.875rem] transition-colors",
                  active ? "border-fg bg-fg text-background" : "border-transparent text-fg/65 hover:bg-fg/[0.05] hover:text-fg",
                )}
              >
                {level.label}
                <span className={cn("font-mono text-[0.75rem]", active ? "text-background/70" : "text-faint")}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex min-h-8 flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="text-[0.875rem] text-fg/70">
          <span className="font-medium text-fg">
            {matches.length === 0 ? page.tally.none : matches.length === 1 ? page.tally.one : format(page.tally.many, { count: matches.length })}
          </span>
          {totalPages > 1 && <span> · {format(page.tally.page, { page: current, total: totalPages })}</span>}
          {selectedLevel && <span className="text-faint"> · {selectedLevel.body}</span>}
        </p>
        {filtered && (
          <button
            type="button"
            onClick={() => update(DEFAULT)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.8125rem] text-fg/65 transition-colors hover:bg-fg/[0.05] hover:text-fg"
          >
            <X className="size-3.5" aria-hidden="true" />
            {page.clear}
          </button>
        )}
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {matches.length === 1 ? page.statusOne : format(page.status, { count: matches.length })}
      </p>

      {shown.length === 0 ? (
        // Two different nothings: GitHub not answering is not the reader's search being too narrow.
        <div className="mt-4 rounded-panel border border-dashed border-fg/15 px-6 py-14 text-center">
          <p className="text-[1.0625rem] font-medium text-fg">{issues ? page.empty.title : page.failed.title}</p>
          <p className="mx-auto mt-2 max-w-[52ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
            {issues ? page.empty.body : page.failed.body}
          </p>
          {filtered && (
            <button
              type="button"
              onClick={() => update(DEFAULT)}
              className="mt-6 rounded-full border border-fg/15 px-4 py-2 text-[0.875rem] font-medium text-fg transition-colors hover:border-fg/30"
            >
              {page.clear}
            </button>
          )}
        </div>
      ) : (
        <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((issue) => (
            <li key={issue.id}>
              <IssueCard issue={issue} reference={fetchedAt ?? issue.updatedAt} />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav aria-label={page.pager.label} className="mt-10 flex items-center justify-center gap-1.5">
          <PagerButton label={page.pager.previous} disabled={current === 1} onClick={() => goTo(current - 1)}>
            <ChevronLeft className="size-4" aria-hidden="true" />
          </PagerButton>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
            <PagerButton
              key={number}
              label={format(page.pager.page, { page: number })}
              current={number === current}
              disabled={number === current}
              onClick={() => goTo(number)}
            >
              {number}
            </PagerButton>
          ))}
          <PagerButton label={page.pager.next} disabled={current === totalPages} onClick={() => goTo(current + 1)}>
            <ChevronRight className="size-4" aria-hidden="true" />
          </PagerButton>
        </nav>
      )}
    </div>
  );
}

function IssueCard({ issue, reference }: { issue: Issue & { level: Level | null }; reference: string }) {
  const level = page.levels.find((item) => item.id === issue.level);
  // The level badge already says what its label says, so that label is not shown twice.
  const rest = issue.labels.filter((label) => levelOf([label]) === null);
  const chips = rest.slice(0, VISIBLE_LABELS);
  return (
    <a
      href={issue.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`${format(page.issueName, { title: issue.title, number: issue.number, repository: issue.repository })}${level ? `, ${level.label}` : ""} (${footer.newTab})`}
      className="panel group flex h-full flex-col p-5 transition-colors duration-300 hover:border-fg/20 hover:bg-fg/[0.03] sm:p-6"
    >
      <span className="flex items-center justify-between gap-3">
        <span className="truncate font-mono text-[0.75rem] text-faint">{issue.repository}</span>
        {level && (
          <span className={cn("shrink-0 rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-medium", LEVEL_STYLE[level.id])}>
            {level.label}
          </span>
        )}
      </span>
      {/* Plain text, as GitHub shows it: anyone can open an issue, so its title is never read as markup. */}
      <span className="mt-3 text-[1.0625rem] font-medium leading-snug text-fg transition-colors group-hover:text-signal-ink">
        {issue.title}
      </span>
      {chips.length > 0 && (
        <span className="mt-4 flex flex-wrap gap-1.5">
          {chips.map((label) => (
            <span key={label} className="rounded-full border border-fg/10 px-2 py-0.5 text-[0.75rem] text-fg/65">
              {label}
            </span>
          ))}
          {rest.length > chips.length && (
            <span className="rounded-full px-1.5 py-0.5 text-[0.75rem] text-faint">+{rest.length - chips.length}</span>
          )}
        </span>
      )}
      {/* The footer sits on the card's floor, however long the title above it. */}
      <span className="flex-1" aria-hidden="true" />
      <span className="mt-5 flex items-center justify-between gap-3 border-t border-fg/[0.07] pt-4">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.75rem] text-faint">
          <span>#{issue.number}</span>
          <span>{age(issue.createdAt, reference)}</span>
          {issue.comments > 0 && (
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="size-3.5" aria-hidden="true" />
              {issue.comments}
            </span>
          )}
        </span>
        <ArrowUpRight
          className="size-4 shrink-0 text-fg/35 transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
          aria-hidden="true"
        />
      </span>
    </a>
  );
}

function PagerButton({
  label,
  current = false,
  disabled,
  onClick,
  children,
}: {
  label: string;
  current?: boolean;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={current ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-10 items-center justify-center rounded-full border text-[0.875rem] transition-colors",
        current ? "border-fg bg-fg text-background" : "border-fg/10 text-fg/70 hover:border-fg/25 hover:text-fg disabled:opacity-35",
      )}
    >
      {children}
    </button>
  );
}
