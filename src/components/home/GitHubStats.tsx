import { useEffect, useState } from "react";
import type { GithubStats } from "@/types";

interface Props {
  initialData?: GithubStats;
}

const FALLBACK: GithubStats = {
  stars: 0,
  commits: 0,
  prs: 0,
  issues: 0,
  topLanguages: [],
};

export function GitHubStats({ initialData }: Props) {
  const [stats] = useState<GithubStats>(initialData || FALLBACK);

  const statItems = [
    { label: "Stars", value: stats.stars, icon: "⭐" },
    { label: "Commits", value: stats.commits, icon: "📝" },
    { label: "PRs", value: stats.prs, icon: "🔀" },
    { label: "Issues", value: stats.issues, icon: "🔵" },
  ];

  return (
    <div className="h-full border-[3px] border-black bg-white shadow-brutal rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#E6A627] border-2 border-black rounded-lg shadow-brutal-sm">
          <span className="text-lg">📊</span>
        </div>
        <div>
          <h3 className="font-bold text-lg leading-none font-head">GitHub</h3>
          <p className="text-xs text-muted-foreground font-medium mt-1">Statistics</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statItems.map((item) => (
          <div key={item.label} className="p-3 rounded-lg bg-background border-2 border-black shadow-brutal-sm flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase font-bold tracking-wider font-head">
              <span>{item.icon}</span> {item.label}
            </div>
            <p className="text-xl font-black text-foreground leading-tight font-head">{item.value}</p>
          </div>
        ))}
      </div>

      {stats.topLanguages.length > 0 && (
        <div className="space-y-2 pt-1 border-t-2 border-black">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full border-2 border-black">
            {stats.topLanguages.map((lang) => (
              <div
                key={lang.name}
                style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                className="h-full"
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {stats.topLanguages.map((lang) => (
              <div key={lang.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: lang.color }} />
                <span className="font-bold font-head">
                  {lang.name} <span className="text-muted-foreground font-medium">{lang.percentage}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
