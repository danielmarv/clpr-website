"use client";

import { useMemo, useState } from "react";
import { MessageSquare, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { footer, issueExplorer as page } from "@/content/site";
import type { Issue } from "@/lib/github";
import { cn, format, formatDate } from "@/lib/utils";

type Sort = "updated" | "created" | "comments";

const SELECT =
  "h-11 rounded-full border border-input bg-fg/3 px-4 text-[0.9375rem] text-foreground transition-colors focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring/30";

/** Whether an issue carries the label of difficulty level `index` ("Everything" has none). */
function inLevel(issue: Issue, index: number): boolean {
  const label = page.levels[index].githubLabel;
  return !label || issue.labels.some((name) => name.toLowerCase() === label);
}

/** The filters and the list; the page fetches the issues on the server. */
export function IssueList({ issues }: { issues: Issue[] }) {
  const [query, setQuery] = useState("");
  const [repository, setRepository] = useState("");
  const [sort, setSort] = useState<Sort>("updated");
  const [level, setLevel] = useState(0);

  // Search and repository narrow the list first, so each difficulty tab can say how many it holds.
  const matching = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return issues.filter((issue) => {
      if (repository && issue.repository !== repository) return false;
      const text = `${issue.title} ${issue.repository} #${issue.number} ${issue.labels.join(" ")}`.toLowerCase();
      return words.every((word) => text.includes(word));
    });
  }, [issues, query, repository]);

  const shown = useMemo(() => {
    const list = matching.filter((issue) => inLevel(issue, level));
    const key = (issue: Issue) => (sort === "comments" ? issue.comments : Date.parse(sort === "created" ? issue.createdAt : issue.updatedAt));
    return list.sort((a, b) => key(b) - key(a));
  }, [matching, level, sort]);

  const selected = page.levels[level];

  return (
    <div>
      <div data-motion-reveal className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
        <label className="relative block">
          <span className="sr-only">{page.search.label}</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden="true" />
          <Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={page.search.placeholder} className="pl-10" />
        </label>
        <label className="flex items-center gap-2">
          <span className="sr-only">{page.repositoryFilter.label}</span>
          <select value={repository} onChange={(event) => setRepository(event.target.value)} className={cn(SELECT, "w-full md:w-auto")}>
            <option value="">{page.repositoryFilter.all}</option>
            {page.repositories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="shrink-0 text-[0.8125rem] text-faint">{page.sort.label}</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as Sort)} className={cn(SELECT, "w-full md:w-auto")}>
            <option value="updated">{page.sort.updated}</option>
            <option value="created">{page.sort.created}</option>
            <option value="comments">{page.sort.comments}</option>
          </select>
        </label>
      </div>

      <div data-motion-reveal className="mt-6">
        <div role="group" aria-label={page.difficultyLabel} className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          {page.levels.map((item, index) => {
            const count = matching.filter((issue) => inLevel(issue, index)).length;
            return (
              <button
                key={item.label}
                type="button"
                aria-pressed={level === index}
                onClick={() => setLevel(index)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.875rem] transition-colors",
                  level === index ? "border-fg/15 bg-fg/9 text-fg" : "border-transparent text-fg/60 hover:text-fg",
                )}
              >
                {item.label}
                <span className="font-mono text-[0.75rem] text-faint">{count}</span>
              </button>
            );
          })}
        </div>
        {selected.body && <p className="mt-3 text-[0.875rem] text-muted-foreground">{selected.body}</p>}
      </div>

      {shown.length ? (
        <ul className="mt-8 divide-y divide-fg/[0.07] overflow-hidden rounded-panel border border-fg/[0.07] bg-surface dark:bg-fg/[0.02]">
          {shown.map((issue) => (
            <li key={issue.id}>
              <a
                href={issue.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col gap-3 p-5 transition-colors hover:bg-fg/[0.03] sm:flex-row sm:items-start sm:justify-between sm:gap-8 sm:p-6"
              >
                <span className="min-w-0">
                  <span className="font-mono text-[0.75rem] text-faint">
                    {issue.repository} #{issue.number}
                  </span>
                  <span className="mt-1 block text-[1rem] font-medium leading-snug text-fg group-hover:text-signal-ink">{issue.title}</span>
                  {issue.labels.length > 0 && (
                    <span className="mt-3 flex flex-wrap gap-1.5">
                      {issue.labels.map((label) => (
                        <span key={label} className="rounded-full border border-fg/10 px-2 py-0.5 text-[0.75rem] text-fg/70">
                          {label}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
                <span className="flex shrink-0 items-center gap-4 text-[0.8125rem] text-faint sm:flex-col sm:items-end sm:gap-1">
                  <span>{format(page.updated, { date: formatDate(issue.updatedAt, true) })}</span>
                  <span>{format(page.opened, { date: formatDate(issue.createdAt, true) })}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageSquare className="size-3.5" aria-hidden="true" />
                    {format(page.comments, { count: issue.comments })}
                  </span>
                </span>
                <span className="sr-only">({footer.newTab})</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 rounded-panel border border-dashed border-fg/15 p-8 text-center text-[0.9375rem] text-muted-foreground">{page.empty}</p>
      )}
    </div>
  );
}
