import type { GithubStats } from "@/types";

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
const GITHUB_USERNAME = "drenzzz";

const QUERY = `
query($login: String!) {
  user(login: $login) {
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
      totalCount
      nodes {
        stargazerCount
        primaryLanguage { name color }
      }
    }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
    }
  }
}`;

export async function fetchGithubStats(): Promise<GithubStats> {
  if (!GITHUB_TOKEN) {
    return {
      stars: 0,
      commits: 0,
      prs: 0,
      issues: 0,
      topLanguages: [],
    };
  }

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { login: GITHUB_USERNAME } }),
    });

    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
    const json = await res.json();
    const user = json.data.user;

    const stars = user.repositories.nodes.reduce(
      (sum: number, r: { stargazerCount: number }) => sum + r.stargazerCount,
      0
    );

    const langMap = new Map<string, { color: string; count: number }>();
    for (const repo of user.repositories.nodes) {
      if (repo.primaryLanguage) {
        const existing = langMap.get(repo.primaryLanguage.name);
        langMap.set(repo.primaryLanguage.name, {
          color: repo.primaryLanguage.color || "#888",
          count: (existing?.count || 0) + 1,
        });
      }
    }
    const totalRepos = user.repositories.totalCount;
    const topLanguages = Array.from(langMap.entries())
      .map(([name, { color, count }]) => ({
        name,
        color,
        percentage: Math.round((count / totalRepos) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);

    return {
      stars,
      commits: user.contributionsCollection.totalCommitContributions,
      prs: user.contributionsCollection.totalPullRequestContributions,
      issues: user.contributionsCollection.totalIssueContributions,
      topLanguages,
    };
  } catch {
    return { stars: 0, commits: 0, prs: 0, issues: 0, topLanguages: [] };
  }
}
