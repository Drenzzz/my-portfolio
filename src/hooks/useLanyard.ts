import { useEffect, useRef, useState } from "react"
import type { LanyardData } from "@/types"

const DISCORD_ID = import.meta.env.PUBLIC_DISCORD_ID
const MAX_ATTEMPTS = Number(import.meta.env.PUBLIC_LANYARD_MAX_ATTEMPTS || 6)

const isValidDiscordId = (value: string) => /^\d{17,20}$/.test(value)

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

const toSafeLanyardData = (value: unknown): LanyardData | null => {
  if (!isObject(value)) return null

  const discordUser = value.discord_user
  const activities = value.activities
  if (!isObject(discordUser) || !Array.isArray(activities)) return null

  if (
    typeof discordUser.id !== "string" ||
    typeof discordUser.username !== "string"
  ) {
    return null
  }

  return value as unknown as LanyardData
}

export function useLanyard() {
  const [data, setData] = useState<LanyardData | null>(null)
  const [status, setStatus] = useState<
    "idle" | "connecting" | "open" | "closed" | "error"
  >("idle")
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const attemptRef = useRef(0)

  useEffect(() => {
    if (!DISCORD_ID || !isValidDiscordId(DISCORD_ID)) {
      setError("PUBLIC_DISCORD_ID is missing or invalid")
      setStatus("error")
      return
    }

    let socket: WebSocket | null = null
    let heartbeatInterval: ReturnType<typeof setInterval> | null = null
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
    let stopped = false
    const maxAttempts = Number.isFinite(MAX_ATTEMPTS)
      ? Math.min(Math.max(Math.floor(MAX_ATTEMPTS), 1), 20)
      : 6

    const connect = () => {
      if (stopped) return
      if (attemptRef.current >= maxAttempts) {
        setStatus("error")
        setError("Failed to connect to Lanyard after multiple attempts")
        return
      }

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

        const { op, d } = message

        if (op === 1) {
          const heartbeatIntervalMs =
            isObject(d) && typeof d.heartbeat_interval === "number"
              ? d.heartbeat_interval
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
        } else if (op === 0) {
          if (message.t === "INIT_STATE" || message.t === "PRESENCE_UPDATE") {
            const safeData = toSafeLanyardData(d)
            if (!safeData) return

            setStatus("open")
            setData(safeData)
            setLastUpdated(Date.now())
            attemptRef.current = 0
          }
        }
      }

      socket.onerror = () => {
        setStatus("error")
        setError("WebSocket error")
      }

      socket.onclose = () => {
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval)
          heartbeatInterval = null
        }
        if (stopped) return
        setStatus("closed")
        const delay = Math.min(5000 * Math.pow(1.5, attemptRef.current), 30000)
        reconnectTimeout = setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      stopped = true
      if (heartbeatInterval) clearInterval(heartbeatInterval)
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      socket?.close()
    }
  }, [])

  return { data, status, error, lastUpdated }
}
