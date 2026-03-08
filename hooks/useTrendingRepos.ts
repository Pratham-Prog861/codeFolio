import { useCallback, useEffect, useState } from "react";
import { TrendingRepo } from "../components/TrendingRepoCard";

export type Since = "daily" | "weekly" | "monthly";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3572A5",
  Rust: "#DEA584",
  Go: "#00ADD8",
  Java: "#B07219",
  "C++": "#F34B7D",
  C: "#555555",
  "C#": "#178600",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Ruby: "#CC342D",
  PHP: "#4F5D95",
  Dart: "#00B4AB",
  Shell: "#89E051",
  HTML: "#E34C26",
  CSS: "#563D7C",
  Vue: "#41B883",
};

function getDateSince(since: Since): string {
  const d = new Date();
  if (since === "daily") d.setDate(d.getDate() - 1);
  else if (since === "weekly") d.setDate(d.getDate() - 7);
  else d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

interface GHSearchItem {
  id: number;
  name: string;
  owner: { login: string; avatar_url: string };
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
}

interface GHSearchResult {
  items: GHSearchItem[];
  message?: string;
}

// Uses the official GitHub Search API — no auth required (10 req/min unauthenticated)
async function fetchTrending(
  since: Since,
  language: string,
): Promise<TrendingRepo[]> {
  const date = getDateSince(since);
  const minStars = since === "daily" ? 0 : since === "weekly" ? 5 : 20;
  let q = `created:>${date} stars:>=${minStars}`;
  if (language) q += ` language:${language}`;

  const url =
    `https://api.github.com/search/repositories` +
    `?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=25`;

  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (res.status === 403) {
    throw new Error("GitHub rate limit reached. Wait a minute and try again.");
  }
  if (!res.ok) {
    throw new Error(`GitHub API error: HTTP ${res.status}`);
  }

  const data: GHSearchResult = await res.json();

  if (data.message) {
    throw new Error(data.message);
  }

  return (data.items ?? []).map(
    (item): TrendingRepo => ({
      author: item.owner.login,
      name: item.name,
      avatar: item.owner.avatar_url,
      url: item.html_url,
      description: item.description ?? "",
      language: item.language ?? "",
      languageColor: item.language
        ? (LANG_COLORS[item.language] ?? "#8B949E")
        : "#8B949E",
      stars: item.stargazers_count,
      forks: item.forks_count,
      currentPeriodStars: 0,
    }),
  );
}

interface State {
  repos: TrendingRepo[];
  loading: boolean;
  error: string | null;
}

export function useTrendingRepos(since: Since, language: string) {
  const [state, setState] = useState<State>({
    repos: [],
    loading: true,
    error: null,
  });

  const load = useCallback(() => {
    setState({ repos: [], loading: true, error: null });
    fetchTrending(since, language)
      .then((repos) => setState({ repos, loading: false, error: null }))
      .catch((err: unknown) =>
        setState({
          repos: [],
          loading: false,
          error:
            err instanceof Error
              ? err.message
              : "Failed to load trending repositories. Please try again.",
        }),
      );
  }, [since, language]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refetch: load };
}
