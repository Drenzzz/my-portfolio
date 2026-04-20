import type { Activity, LanyardData } from "@/types"

export const LANYARD_SOCKET_URL = "wss://api.lanyard.rest/socket"
export const LANYARD_REST_URL = "https://api.lanyard.rest/v1/users"

export const DISCORD_ID_PATTERN = /^\d{17,20}$/

export const LANYARD_RETRY_LIMITS = {
  minAttempts: 1,
  maxAttempts: 20,
  baseDelayMs: 3000,
  backoffMultiplier: 1.5,
  maxDelayMs: 20000,
} as const

export const CODING_ACTIVITY_NAMES = [
  "Visual Studio Code",
  "IntelliJ IDEA",
  "Android Studio",
  "Neovim",
] as const

export const GAME_ACTIVITY_FALLBACKS: Array<{
  keywords: string[]
  image: string
}> = [
  {
    keywords: ["counter", "cs2", "counter-strike"],
    image: "https://upload.wikimedia.org/wikipedia/en/f/f2/CS2_Cover_Art.jpg",
  },
  {
    keywords: ["minecraft", "prism launcher"],
    image:
      "https://upload.wikimedia.org/wikipedia/en/b/b6/Minecraft_2024_cover_art.png",
  },
  {
    keywords: ["valorant"],
    image: "https://cdn.simpleicons.org/valorant/white",
  },
]

export const DISCORD_STATUS_META: Record<
  LanyardData["discord_status"],
  { color: string; label: string }
> = {
  online: { color: "bg-green-500", label: "Online" },
  idle: { color: "bg-yellow-500", label: "Idle" },
  dnd: { color: "bg-red-500", label: "Do Not Disturb" },
  offline: { color: "bg-gray-500", label: "Offline" },
}

export const CONNECTION_STATUS_LABELS = {
  idle: "Waiting for presence",
  connecting: "Connecting to Lanyard",
  open: "Connection stable",
  closed: "Reconnecting",
  error: "Presence unavailable",
  stale: "Using last known activity",
} as const

export const DEFAULT_SPOTIFY_SONG = "Listening on Spotify"
export const DEFAULT_CUSTOM_STATUS = "Currently chilling..."

export const isValidDiscordId = (value: string) =>
  DISCORD_ID_PATTERN.test(value)

export const isKnownDiscordStatus = (
  value: string
): value is LanyardData["discord_status"] => {
  return (
    value === "online" ||
    value === "idle" ||
    value === "dnd" ||
    value === "offline"
  )
}

export const isCodingActivity = (activity: Activity) => {
  return CODING_ACTIVITY_NAMES.includes(
    activity.name as (typeof CODING_ACTIVITY_NAMES)[number]
  )
}

export const getConnectionLabel = (
  status: keyof typeof CONNECTION_STATUS_LABELS,
  error: string | null
) => {
  if (error) return error
  return CONNECTION_STATUS_LABELS[status] ?? CONNECTION_STATUS_LABELS.idle
}

export const getActivityImage = (activity: Activity) => {
  const appId = activity.application_id
  const assetId = activity.assets?.large_image
  if (!assetId) return null

  if (assetId.startsWith("mp:external/")) {
    return `https://media.discordapp.net/${assetId.replace("mp:", "")}`
  }

  if (appId) {
    return `https://cdn.discordapp.com/app-assets/${appId}/${assetId}.png`
  }

  return null
}

export const getGameFallbackImage = (activityName: string) => {
  const normalizedName = activityName.toLowerCase()
  const matched = GAME_ACTIVITY_FALLBACKS.find((entry) =>
    entry.keywords.some((keyword) => normalizedName.includes(keyword))
  )

  return matched?.image ?? null
}
