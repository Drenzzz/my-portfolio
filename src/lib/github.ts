import type { GithubStats } from "@/types"
import { buildKvKey, getJson, setJson } from "@/lib/kv"

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN
const GITHUB_USERNAME = import.meta.env.GITHUB_USERNAME || "drenzzz"

const toSafeNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return parsed
}

const CACHE_TTL_MS = Math.min(
  Math.max(
    toSafeNumber(import.meta.env.GITHUB_STATS_CACHE_TTL_MS, 10 * 60 * 1000),
    60_000
  ),
  60 * 60 * 1000
)
const REQUEST_TIMEOUT_MS = Math.min(
  Math.max(toSafeNumber(import.meta.env.GITHUB_REQUEST_TIMEOUT_MS, 8000), 3000),
  30000
)

const EMPTY_STATS: GithubStats = {
  stars: 0,
  commits: 0,
  prs: 0,
  issues: 0,
  topLanguages: [],
}

const toSafeInt = (value: unknown) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0
  return Math.max(Math.trunc(value), 0)
}

let githubStatsCache: { value: GithubStats; expiresAt: number } | null = null

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
}`

export async function fetchGithubStats(): Promise<GithubStats> {
  const now = Date.now()
  if (githubStatsCache && githubStatsCache.expiresAt > now) {
    return githubStatsCache.value
  }

  if (!GITHUB_TOKEN) {
    return EMPTY_STATS
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { login: GITHUB_USERNAME },
      }),
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timeout)
    })

    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`)
    const json = await res.json()
    const user = json?.data?.user
    if (!user?.repositories?.nodes || !user?.contributionsCollection) {
      return EMPTY_STATS
    }

    const stars = user.repositories.nodes.reduce(
      (sum: number, r: { stargazerCount: number }) => {
        return sum + toSafeInt(r.stargazerCount)
      },
      0
    )

    const langMap = new Map<string, { color: string; count: number }>()
    for (const repo of user.repositories.nodes) {
      if (repo.primaryLanguage) {
        const existing = langMap.get(repo.primaryLanguage.name)
        langMap.set(repo.primaryLanguage.name, {
          color: repo.primaryLanguage.color || "#888",
          count: (existing?.count || 0) + 1,
        })
      }
    }
    const totalRepos = Math.max(
      user.repositories.totalCount || user.repositories.nodes.length || 1,
      1
    )
    const topLanguages = Array.from(langMap.entries())
      .map(([name, { color, count }]) => ({
        name,
        color,
        percentage: Math.round((count / totalRepos) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5)

    const nextStats = {
      stars,
      commits: toSafeInt(user.contributionsCollection.totalCommitContributions),
      prs: toSafeInt(
        user.contributionsCollection.totalPullRequestContributions
      ),
      issues: toSafeInt(user.contributionsCollection.totalIssueContributions),
      topLanguages,
    }

    githubStatsCache = {
      value: nextStats,
      expiresAt: Date.now() + CACHE_TTL_MS,
    }

    return nextStats
  } catch {
    return EMPTY_STATS
  }
}

interface GithubStatsCachePayload {
  stats: GithubStats
  updatedAt: number
}

export async function fetchGithubStatsWithCache(): Promise<GithubStats> {
  const cacheKey = buildKvKey("github", "stats", GITHUB_USERNAME)
  const cached = await getJson<GithubStatsCachePayload>(cacheKey)
  const now = Date.now()

  if (cached && now - cached.updatedAt < CACHE_TTL_MS) {
    return cached.stats
  }

  try {
    const fresh = await fetchGithubStats()

    const ttlSeconds = Math.max(Math.floor(CACHE_TTL_MS / 1000), 60)
    await setJson(
      cacheKey,
      {
        stats: fresh,
        updatedAt: Date.now(),
      },
      ttlSeconds
    )

    return fresh
  } catch {
    return cached?.stats || EMPTY_STATS
  }
}
