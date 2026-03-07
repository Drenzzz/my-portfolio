import type { GithubStats } from "@/types"

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
    { label: "Stars", value: stats.stars, icon: "⭐" },
    { label: "Commits", value: stats.commits, icon: "📝" },
    { label: "PRs", value: stats.prs, icon: "🔀" },
    { label: "Issues", value: stats.issues, icon: "🔵" },
  ]

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border-[3px] border-black bg-white p-5 shadow-brutal">
      <div className="flex items-center gap-3">
        <div className="rounded-lg border-2 border-black bg-[#C4A1FF] p-2 shadow-brutal-sm">
          <span className="text-lg">📊</span>
        </div>
        <div>
          <h3 className="font-head text-lg leading-none font-bold">GitHub</h3>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            Statistics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-1 rounded-lg border-2 border-black bg-background p-3 shadow-brutal-sm"
          >
            <div className="font-head flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              <span>{item.icon}</span> {item.label}
            </div>
            <p className="font-head text-xl leading-tight font-black text-foreground">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {stats.topLanguages.length > 0 && (
        <div className="space-y-2 border-t-2 border-black pt-1">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full border-2 border-black">
            {stats.topLanguages.map((lang) => (
              <div
                key={lang.name}
                style={{
                  width: `${lang.percentage}%`,
                  backgroundColor: lang.color,
                }}
                className="h-full"
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {stats.topLanguages.map((lang) => (
              <div key={lang.name} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full border border-black"
                  style={{ backgroundColor: lang.color }}
                />
                <span className="font-head font-bold">
                  {lang.name}{" "}
                  <span className="font-medium text-muted-foreground">
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
