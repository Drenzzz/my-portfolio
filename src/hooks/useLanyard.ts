import { useEffect, useRef, useState } from "react"
import type { Activity, LanyardData } from "@/types"

const DISCORD_ID = import.meta.env.PUBLIC_DISCORD_ID
const MAX_ATTEMPTS = Number(import.meta.env.PUBLIC_LANYARD_MAX_ATTEMPTS || 6)

const isValidDiscordId = (value: string) => /^\d{17,20}$/.test(value)
const HAS_VALID_DISCORD_ID = Boolean(DISCORD_ID && isValidDiscordId(DISCORD_ID))

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

const toSafeString = (value: unknown) => {
  if (typeof value !== "string") return ""
  return value
}

const toSafeNumber = (value: unknown) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined
  return value
}

const toSafeActivity = (value: unknown): Activity | null => {
  if (!isObject(value)) return null

  const name = toSafeString(value.name)
  const type = toSafeNumber(value.type)
  if (!name || type === undefined) return null

  const timestamps = isObject(value.timestamps)
    ? {
        start: toSafeNumber(value.timestamps.start),
        end: toSafeNumber(value.timestamps.end),
      }
    : undefined

  return {
    name,
    type,
    state: toSafeString(value.state) || undefined,
    details: toSafeString(value.details) || undefined,
    application_id: toSafeString(value.application_id) || undefined,
    sync_id: toSafeString(value.sync_id) || undefined,
    timestamps,
    assets: isObject(value.assets)
      ? {
          large_image: toSafeString(value.assets.large_image) || undefined,
          large_text: toSafeString(value.assets.large_text) || undefined,
          small_image: toSafeString(value.assets.small_image) || undefined,
          small_text: toSafeString(value.assets.small_text) || undefined,
        }
      : undefined,
  }
}

const toSafeLanyardData = (value: unknown): LanyardData | null => {
  if (!isObject(value)) return null

  const discordUser = value.discord_user
  if (!isObject(discordUser)) return null

  const discordId = toSafeString(discordUser.id)
  const username = toSafeString(discordUser.username)
  if (!discordId || !username) return null

  const activitiesRaw = Array.isArray(value.activities) ? value.activities : []
  const activities = activitiesRaw
    .map((activity) => toSafeActivity(activity))
    .filter((activity): activity is Activity => activity !== null)

  const spotify = isObject(value.spotify)
    ? {
        track_id: toSafeString(value.spotify.track_id),
        song: toSafeString(value.spotify.song) || "Listening on Spotify",
        artist: toSafeString(value.spotify.artist),
        album_art_url: toSafeString(value.spotify.album_art_url),
        album: toSafeString(value.spotify.album),
        timestamps:
          isObject(value.spotify.timestamps) &&
          toSafeNumber(value.spotify.timestamps.start) !== undefined &&
          toSafeNumber(value.spotify.timestamps.end) !== undefined
            ? {
                start: toSafeNumber(value.spotify.timestamps.start)!,
                end: toSafeNumber(value.spotify.timestamps.end)!,
              }
            : null,
      }
    : null

  const status = toSafeString(value.discord_status)
  const discordStatus =
    status === "online" ||
    status === "idle" ||
    status === "dnd" ||
    status === "offline"
      ? status
      : "offline"

  return {
    discord_user: {
      id: discordId,
      username,
      avatar: toSafeString(discordUser.avatar),
    },
    discord_status: discordStatus,
    activities,
    spotify,
    active_on_discord_mobile: Boolean(value.active_on_discord_mobile),
    active_on_discord_desktop: Boolean(value.active_on_discord_desktop),
    active_on_discord_web: Boolean(value.active_on_discord_web),
  }
}

export function useLanyard() {
  const [data, setData] = useState<LanyardData | null>(null)
  const [status, setStatus] = useState<
    "idle" | "connecting" | "open" | "closed" | "error"
  >(HAS_VALID_DISCORD_ID ? "idle" : "error")
  const [error, setError] = useState<string | null>(
    HAS_VALID_DISCORD_ID ? null : "PUBLIC_DISCORD_ID is missing or invalid"
  )
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const attemptRef = useRef(0)

  useEffect(() => {
    if (!HAS_VALID_DISCORD_ID) {
      return
    }

    let socket: WebSocket | null = null
    let heartbeatInterval: ReturnType<typeof setInterval> | null = null
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
    let stopped = false

    const maxAttempts = Number.isFinite(MAX_ATTEMPTS)
      ? Math.min(Math.max(Math.floor(MAX_ATTEMPTS), 1), 20)
      : 6

    const clearTimers = () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval)
        heartbeatInterval = null
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
        reconnectTimeout = null
      }
    }

    const scheduleReconnect = () => {
      if (stopped || attemptRef.current >= maxAttempts) {
        setStatus("error")
        setError("Unable to connect to Lanyard after multiple attempts")
        return
      }

      const delay = Math.min(3000 * 1.5 ** attemptRef.current, 20000)
      reconnectTimeout = setTimeout(connect, delay)
    }

    const connect = () => {
      if (stopped) return

      clearTimers()
      setStatus("connecting")
      setError(null)
      attemptRef.current += 1
      socket = new WebSocket("wss://api.lanyard.rest/socket")

      socket.onmessage = (event) => {
        let message: { op?: number; d?: unknown; t?: string }
        try {
          message = JSON.parse(event.data)
        } catch {
          return
        }

        if (message.op === 1) {
          const heartbeatIntervalMs =
            isObject(message.d) &&
            typeof message.d.heartbeat_interval === "number"
              ? Math.max(message.d.heartbeat_interval, 5000)
              : 30000

          heartbeatInterval = setInterval(() => {
            socket?.send(JSON.stringify({ op: 3 }))
          }, heartbeatIntervalMs)

          socket?.send(
            JSON.stringify({
              op: 2,
              d: { subscribe_to_id: DISCORD_ID },
            })
          )
          return
        }

        if (message.op === 0) {
          if (message.t !== "INIT_STATE" && message.t !== "PRESENCE_UPDATE") {
            return
          }

          const safeData = toSafeLanyardData(message.d)
          if (!safeData) return

          setStatus("open")
          setData(safeData)
          setLastUpdated(Date.now())
          attemptRef.current = 0
        }
      }

      socket.onerror = () => {
        setStatus("closed")
        setError("WebSocket connection failed")
      }

      socket.onclose = () => {
        if (stopped) return
        setStatus("closed")
        scheduleReconnect()
      }
    }

    connect()

    return () => {
      stopped = true
      clearTimers()
      socket?.close()
    }
  }, [])

  return { data, status, error, lastUpdated }
}
