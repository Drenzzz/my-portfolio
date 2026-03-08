import type { GithubStats } from "@/types"
import { Github, Star, GitCommitVertical, GitPullRequest, CircleDot } from "lucide-react"

interface Props {
  initialData?: GithubStats
}

const FALLBACK: GithubStats = {
  stars: 0,
  commits: 0,
  prs: 0,
  issues: 0,
  topLanguages: [],
}

export function GitHubStats({ initialData }: Props) {
  const stats = initialData || FALLBACK

  const statItems = [
    { label: "Stars", value: stats.stars, icon: <Star className="h-4 w-4" /> },
    { label: "Commits", value: stats.commits, icon: <GitCommitVertical className="h-4 w-4" /> },
    { label: "PRs", value: stats.prs, icon: <GitPullRequest className="h-4 w-4" /> },
    { label: "Issues", value: stats.issues, icon: <CircleDot className="h-4 w-4" /> },
  ]

  return (
    <div className="flex h-full flex-col justify-between gap-4 rounded-xl border-[3px] border-black bg-white p-4 xl:p-5 shadow-brutal">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-[#C4A1FF] text-black shadow-brutal-sm">
            <Github className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-head text-lg leading-none font-black text-black">GitHub</h3>
            <p className="mt-0.5 text-xs font-bold text-muted-foreground">
              Live Statistics
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 flex-grow">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="flex flex-col justify-center gap-1.5 rounded-xl border-2 border-black bg-[#F4F4F5] p-3 shadow-brutal-sm hover:-translate-y-1 hover:shadow-brutal transition-all"
          >
            <div className="font-head flex items-center gap-1.5 text-xs font-bold tracking-widest text-muted-foreground uppercase">
              {item.icon} <span className="pt-0.5">{item.label}</span>
            </div>
            <p className="font-head text-2xl leading-none font-black text-black">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {stats.topLanguages.length > 0 && (
        <div className="mt-2 space-y-2 rounded-xl border-2 border-black bg-white p-3 shadow-brutal-sm">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full border-2 border-black bg-neutral-100">
            {stats.topLanguages.map((lang) => (
              <div
                key={lang.name}
                style={{
                  width: `${lang.percentage}%`,
                  backgroundColor: lang.color,
                }}
                className="h-full border-r-[1.5px] border-black last:border-0"
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            {stats.topLanguages.map((lang) => (
              <div key={lang.name} className="flex items-center gap-1.5">
                <span
                  className="h-3 w-3 rounded-full border-2 border-black shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                  style={{ backgroundColor: lang.color }}
                />
                <span className="font-head text-[11px] font-bold text-black uppercase tracking-wider">
                  {lang.name}{" "}
                  <span className="text-muted-foreground opacity-80">
                    {lang.percentage}%
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
