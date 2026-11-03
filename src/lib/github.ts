// Live numbers and issues from the LFDT-CLPR organization on GitHub, fetched on the server when a
// page is built and again at most once an hour. Without a GITHUB_TOKEN the API allows 60 requests an
// hour per server, plenty at that rate. Every call returns null when GitHub cannot be reached, and the
// pages leave the numbers out rather than fail.

const ORG = "LFDT-CLPR";
const API = "https://api.github.com";
export const REFRESH_SECONDS = 3600;

async function github<T>(path: string): Promise<T | null> {
  try {
    const token = process.env.GITHUB_TOKEN;
    const response = await fetch(`${API}${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      next: { revalidate: REFRESH_SECONDS },
    });
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

export type RepoStats = { name: string; stars: number };

/** Public repositories of the organization with their stars. */
export async function getRepos(): Promise<RepoStats[] | null> {
  const repos = await github<{ name: string; stargazers_count: number; private: boolean; archived: boolean }[]>(
    `/orgs/${ORG}/repos?type=public&per_page=100`,
  );
  return repos?.filter((repo) => !repo.private && !repo.archived).map((repo) => ({ name: repo.name, stars: repo.stargazers_count })) ?? null;
}

export type Issue = {
  id: number;
  number: number;
  title: string;
  url: string;
  repository: string;
  labels: string[];
  comments: number;
  createdAt: string;
  updatedAt: string;
};

/** Open issues that nobody is assigned to, across the organization, with the time they were fetched. */
export async function getOpenIssues(): Promise<{ issues: Issue[]; fetchedAt: string } | null> {
  type Item = {
    id: number;
    number: number;
    title: string;
    html_url: string;
    repository_url: string;
    labels: { name: string }[];
    comments: number;
    created_at: string;
    updated_at: string;
    pull_request?: unknown;
  };
  const query = encodeURIComponent(`org:${ORG} is:issue is:open no:assignee`);
  const result = await github<{ items: Item[] }>(`/search/issues?q=${query}&sort=updated&per_page=100`);
  if (!result) return null;
  return {
    fetchedAt: new Date().toISOString(),
    issues: result.items
      .filter((item) => !item.pull_request)
      .map((item) => ({
        id: item.id,
        number: item.number,
        title: item.title,
        url: item.html_url,
        repository: item.repository_url.split("/").pop() ?? "",
        labels: item.labels.map((label) => label.name),
        comments: item.comments,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })),
  };
}
