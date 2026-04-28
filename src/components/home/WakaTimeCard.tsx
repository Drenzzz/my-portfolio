"use client"

import { useEffect, useState } from "react"
import { Activity, Clock3, Loader2, TimerReset } from "lucide-react"
import type { WakaTimeStats } from "@/types"

interface Props {
  initialData?: WakaTimeStats
}

const FALLBACK: WakaTimeStats = {
  totalSeconds: 0,
  humanReadableTotal: "0 secs",
  dailyAverageSeconds: 0,
  humanReadableDailyAverage: "0 secs",
  range: "last_7_days",
  humanReadableRange: "Last 7 days",
  percentCalculated: 0,
  isUpToDate: false,
  languages: [],
}

export function WakaTimeCard({ initialData }: Props) {
  const [stats, setStats] = useState<WakaTimeStats>(initialData || FALLBACK)
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch("/api/wakatime/stats")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load WakaTime activity")

        const json = (await response.json()) as { stats?: WakaTimeStats }
        if (!json.stats) throw new Error("Missing WakaTime stats payload")

        return json.stats
      })
      .then((nextStats) => {
        if (cancelled) return
        setStats(nextStats)
        setError(null)
      })
      .catch(() => {
        if (cancelled) return
        setError("WakaTime activity is unavailable right now.")
      })
      .finally(() => {
        if (cancelled) return
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const statItems = [
    {
      label: "Total Time",
      value: stats.humanReadableTotal,
      icon: <Clock3 className="h-4 w-4" />,
    },
    {
      label: "Daily Average",
      value: stats.humanReadableDailyAverage,
      icon: <TimerReset className="h-4 w-4" />,
    },
  ]

  const hasLanguages = stats.languages.length > 0

  return (
    <section className="flex h-full flex-col gap-4 rounded-xl border-[3px] border-black bg-white p-4 shadow-brutal xl:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-[#C4A1FF] text-black shadow-brutal-sm">
            <Activity className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-head text-lg leading-none font-black text-black">
              WakaTime
            </h3>
            <p className="mt-0.5 text-xs font-bold text-muted-foreground">
              Weekly Coding Activity
            </p>
          </div>
        </div>

        <span
          className={
            stats.isUpToDate
              ? "inline-flex items-center gap-1 rounded-full border-2 border-black bg-[#E7F193] px-3 py-1 text-[10px] font-black uppercase shadow-brutal-sm"
              : "inline-flex items-center gap-1 rounded-full border-2 border-black bg-[#F4F4F5] px-3 py-1 text-[10px] font-black uppercase shadow-brutal-sm"
          }
        >
          {stats.isUpToDate ? "Live" : "Cached"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="flex min-h-[92px] flex-col justify-center gap-1.5 rounded-xl border-2 border-black bg-[#F4F4F5] p-3 shadow-brutal-sm"
          >
            <div className="font-head flex items-center gap-1.5 text-xs font-bold tracking-widest text-muted-foreground uppercase">
              {item.icon}
              <span className="pt-0.5">{item.label}</span>
            </div>
            <p className="font-head text-xl leading-tight font-black text-black sm:text-2xl">
              {isLoading ? "Loading..." : item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border-2 border-black bg-white p-3 shadow-brutal-sm">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="font-head text-xs font-black tracking-widest text-muted-foreground uppercase">
            {stats.humanReadableRange}
          </p>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-black" />}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`wakatime-language-skeleton-${index}`}
                className="rounded-lg border-2 border-black bg-[#F4F4F5] p-3 shadow-brutal-sm"
              >
                <div className="mb-2 h-3 w-24 animate-pulse rounded-sm bg-black/15" />
                <div className="h-3 w-full animate-pulse rounded-sm bg-black/10" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex min-h-24 items-center rounded-xl border-2 border-black bg-[#F4F4F5] p-4 text-sm font-bold text-muted-foreground shadow-brutal-sm">
            {error}
          </div>
        ) : hasLanguages ? (
          <div className="space-y-2.5">
            <div className="flex h-2.5 w-full overflow-hidden rounded-full border-2 border-black bg-neutral-100">
              {stats.languages.map((language) => (
                <div
                  key={language.name}
                  className="h-full border-r-[1.5px] border-black bg-[#C4A1FF] last:border-0"
                  style={{ width: `${Math.max(language.percent, 4)}%` }}
                />
              ))}
            </div>

            <div className="space-y-2">
              {stats.languages.map((language) => (
                <article
                  key={language.name}
                  className="flex items-center justify-between gap-3 rounded-xl border-2 border-black bg-[#F4F4F5] p-3 shadow-brutal-sm"
                >
                  <div className="min-w-0">
                    <p className="font-head truncate text-xs font-black tracking-wider text-black uppercase">
                      {language.name}
                    </p>
                    <p className="text-xs font-bold text-muted-foreground">
                      {language.text}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border-2 border-black bg-white px-2.5 py-1 text-[10px] font-black uppercase shadow-brutal-sm">
                    {Math.round(language.percent)}%
                  </span>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex min-h-24 items-center rounded-xl border-2 border-black bg-[#F4F4F5] p-4 text-sm font-bold text-muted-foreground shadow-brutal-sm">
            No WakaTime language activity found for this range.
          </div>
        )}
      </div>
    </section>
  )
}
