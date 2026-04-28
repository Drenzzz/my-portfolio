"use client"

import { useEffect, useState } from "react"
import { ArrowUpRight, GitCommitHorizontal, Loader2 } from "lucide-react"
import type { GithubRecentCommit } from "@/types"

interface Props {
  initialData?: GithubRecentCommit[]
}

const FALLBACK: GithubRecentCommit[] = []

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Recently"

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date)
}

export function LatestCommitsCard({ initialData }: Props) {
  const [commits, setCommits] = useState<GithubRecentCommit[]>(
    initialData || FALLBACK
  )
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch("/api/github/commits")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load recent commits")

        const json = (await response.json()) as {
          commits?: GithubRecentCommit[]
        }

        return Array.isArray(json.commits) ? json.commits : []
      })
      .then((nextCommits) => {
        if (cancelled) return
        setCommits(nextCommits)
        setError(null)
      })
      .catch(() => {
        if (cancelled) return
        setError("Recent commit activity is unavailable right now.")
      })
      .finally(() => {
        if (cancelled) return
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="flex h-full flex-col gap-4 rounded-xl border-[3px] border-black bg-white p-4 shadow-brutal xl:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-[#E7F193] text-black shadow-brutal-sm">
            <GitCommitHorizontal className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-head text-lg leading-none font-black text-black">
              Latest Commits
            </h3>
            <p className="mt-0.5 text-xs font-bold text-muted-foreground">
              Public Activity Across Repositories
            </p>
          </div>
        </div>

        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-black" />}
      </div>

      <div className="grid flex-1 gap-2.5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`latest-commit-skeleton-${index}`}
              className="rounded-xl border-2 border-black bg-[#F4F4F5] p-3 shadow-brutal-sm"
            >
              <div className="mb-2 h-3 w-24 animate-pulse rounded-sm bg-black/15" />
              <div className="mb-2 h-3 w-full animate-pulse rounded-sm bg-black/10" />
              <div className="h-3 w-16 animate-pulse rounded-sm bg-black/10" />
            </div>
          ))
        ) : error ? (
          <div className="flex min-h-24 items-center rounded-xl border-2 border-black bg-[#F4F4F5] p-4 text-sm font-bold text-muted-foreground shadow-brutal-sm">
            {error}
          </div>
        ) : commits.length === 0 ? (
          <div className="flex min-h-24 items-center rounded-xl border-2 border-black bg-[#F4F4F5] p-4 text-sm font-bold text-muted-foreground shadow-brutal-sm">
            No recent public commits found right now.
          </div>
        ) : (
          commits.map((commit) => (
            <a
              key={commit.id}
              href={commit.commitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border-2 border-black bg-[#F4F4F5] p-3 shadow-brutal-sm transition-all hover:-translate-y-1 hover:bg-[#C4A1FF] hover:shadow-brutal"
            >
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="font-head truncate text-[11px] font-black tracking-wider text-black uppercase">
                  {commit.repoName}
                </span>
                <span className="shrink-0 text-[10px] font-black text-muted-foreground uppercase">
                  {formatDate(commit.committedAt)}
                </span>
              </div>
              <p className="line-clamp-2 text-sm leading-relaxed font-semibold text-black">
                {commit.commitMessage}
              </p>
              <div className="mt-2 flex items-center justify-between gap-3 text-[10px] font-black uppercase text-muted-foreground">
                <span>{commit.shortSha}</span>
                <span className="inline-flex items-center gap-1">
                  View Commit
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </a>
          ))
        )}
      </div>
    </section>
  )
}
