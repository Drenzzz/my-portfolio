import type { WakaTimeStats } from "@/types"
import { buildKvKey, getJson, setJson } from "@/lib/kv"

const WAKATIME_API_KEY = import.meta.env.WAKATIME_API_KEY
const WAKATIME_RANGE = "last_7_days"

const toSafeNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return parsed
}

const CACHE_TTL_MS = Math.min(
  Math.max(
    toSafeNumber(import.meta.env.WAKATIME_STATS_CACHE_TTL_SECONDS, 3600) * 1000,
    60_000
  ),
  24 * 60 * 60 * 1000
)

const REQUEST_TIMEOUT_MS = Math.min(
  Math.max(toSafeNumber(import.meta.env.WAKATIME_REQUEST_TIMEOUT_MS, 8000), 3000),
  30000
)

const EMPTY_STATS: WakaTimeStats = {
  totalSeconds: 0,
  humanReadableTotal: "0 secs",
  dailyAverageSeconds: 0,
  humanReadableDailyAverage: "0 secs",
  range: WAKATIME_RANGE,
  humanReadableRange: "Last 7 days",
  percentCalculated: 0,
  isUpToDate: false,
  languages: [],
}

const toSafeFloat = (value: unknown) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0
  return Math.max(value, 0)
}

const toSafeInt = (value: unknown) => Math.trunc(toSafeFloat(value))

const formatLanguage = (language: unknown): WakaTimeStats["languages"][number] | null => {
  if (!language || typeof language !== "object") return null

  const source = language as Record<string, unknown>
  const name = typeof source.name === "string" ? source.name : ""
  if (!name) return null

  return {
    name,
    totalSeconds: toSafeFloat(source.total_seconds),
    percent: toSafeFloat(source.percent),
    text: typeof source.text === "string" ? source.text : "0 secs",
    hours: toSafeInt(source.hours),
    minutes: toSafeInt(source.minutes),
    seconds: toSafeInt(source.seconds),
  }
}

const normalizeStats = (payload: unknown): WakaTimeStats => {
  if (!payload || typeof payload !== "object") return EMPTY_STATS

  const source = payload as Record<string, unknown>
  const rawLanguages = Array.isArray(source.languages) ? source.languages : []

  return {
    totalSeconds: toSafeFloat(
      source.total_seconds_including_other_language ?? source.total_seconds
    ),
    humanReadableTotal:
      typeof source.human_readable_total_including_other_language === "string"
        ? source.human_readable_total_including_other_language
        : typeof source.human_readable_total === "string"
          ? source.human_readable_total
          : EMPTY_STATS.humanReadableTotal,
    dailyAverageSeconds: toSafeFloat(
      source.daily_average_including_other_language ?? source.daily_average
    ),
    humanReadableDailyAverage:
      typeof source.human_readable_daily_average_including_other_language ===
      "string"
        ? source.human_readable_daily_average_including_other_language
        : typeof source.human_readable_daily_average === "string"
          ? source.human_readable_daily_average
          : EMPTY_STATS.humanReadableDailyAverage,
    range: typeof source.range === "string" ? source.range : WAKATIME_RANGE,
    humanReadableRange:
      typeof source.human_readable_range === "string"
        ? source.human_readable_range
        : EMPTY_STATS.humanReadableRange,
    percentCalculated: toSafeInt(source.percent_calculated),
    isUpToDate: Boolean(source.is_up_to_date),
    languages: rawLanguages
      .map((language) => formatLanguage(language))
      .filter((language) => language !== null)
      .slice(0, 5),
  }
}

interface WakaTimeCachePayload {
  stats: WakaTimeStats
  updatedAt: number
}

let wakatimeStatsCache: { value: WakaTimeStats; expiresAt: number } | null = null

const fetchFromWakaTime = async () => {
  if (!WAKATIME_API_KEY) return EMPTY_STATS

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(
      `https://wakatime.com/api/v1/users/current/stats/${WAKATIME_RANGE}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(WAKATIME_API_KEY).toString("base64")}`,
        },
        signal: controller.signal,
      }
    )

    if (!response.ok && response.status !== 202) {
      throw new Error(`WakaTime API returned ${response.status}`)
    }

    const json = (await response.json()) as { data?: unknown }
    return normalizeStats(json.data)
  } finally {
    clearTimeout(timeout)
  }
}

export async function fetchWakaTimeStatsWithCache(): Promise<WakaTimeStats> {
  const now = Date.now()
  if (wakatimeStatsCache && wakatimeStatsCache.expiresAt > now) {
    return wakatimeStatsCache.value
  }

  const cacheKey = buildKvKey("wakatime", "stats", WAKATIME_RANGE)
  const cached = await getJson<WakaTimeCachePayload>(cacheKey)

  if (cached && now - cached.updatedAt < CACHE_TTL_MS) {
    wakatimeStatsCache = {
      value: cached.stats,
      expiresAt: now + CACHE_TTL_MS,
    }
    return cached.stats
  }

  try {
    const fresh = await fetchFromWakaTime()
    const ttlSeconds = Math.max(Math.floor(CACHE_TTL_MS / 1000), 60)

    await setJson(
      cacheKey,
      {
        stats: fresh,
        updatedAt: Date.now(),
      },
      ttlSeconds
    )

    wakatimeStatsCache = {
      value: fresh,
      expiresAt: now + CACHE_TTL_MS,
    }

    return fresh
  } catch {
    return cached?.stats || EMPTY_STATS
  }
}
