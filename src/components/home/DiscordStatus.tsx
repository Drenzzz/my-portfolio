import { useEffect, useMemo, useState } from "react"
import { useLanyard } from "@/hooks/useLanyard"
import {
  DEFAULT_CUSTOM_STATUS,
  DISCORD_STATUS_META,
  getActivityImage,
  getConnectionLabel,
} from "@/lib/discord-presence"
import { deriveDiscordPresenceView } from "@/lib/discord-presence-view"
import { cn } from "@/lib/utils"
import {
  Code2,
  Gamepad2,
  Globe,
  Laptop,
  Loader2,
  Moon,
  Smartphone,
} from "lucide-react"

const PROFILE_DISCORD_ID = import.meta.env.PUBLIC_DISCORD_ID

const formatTime = (ms: number) => {
  const safeMs = Math.max(ms, 0)
  const seconds = Math.floor((safeMs / 1000) % 60)
  const minutes = Math.floor((safeMs / 1000 / 60) % 60)
  const hours = Math.floor(safeMs / 1000 / 60 / 60)
  return `${hours > 0 ? `${hours}:` : ""}${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

const formatAgo = (now: number, timestamp: number | null) => {
  if (!timestamp) return "No updates"

  const diff = Math.max(0, now - timestamp)
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const calculateProgress = (now: number, start: number, end: number) => {
  const total = end - start
  if (total <= 0) return 0

  const elapsed = now - start
  return Math.min(Math.max((elapsed / total) * 100, 0), 100)
}

export function DiscordStatus() {
  const { data, status, error, lastUpdated } = useLanyard()
  const [now, setNow] = useState(() => Date.now())
  const [isPageVisible, setIsPageVisible] = useState(true)

  useEffect(() => {
    const onVisibilityChange = () => {
      const visible = !document.hidden
      setIsPageVisible(visible)
      if (visible) setNow(Date.now())
    }

    document.addEventListener("visibilitychange", onVisibilityChange)

    if (!isPageVisible) {
      return () => {
        document.removeEventListener("visibilitychange", onVisibilityChange)
      }
    }

    const interval = setInterval(() => setNow(Date.now()), 1000)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [isPageVisible])

  const discordStatus = data?.discord_status || "offline"
  const statusMeta =
    DISCORD_STATUS_META[discordStatus] || DISCORD_STATUS_META.offline
  const statusColor = statusMeta.color
  const statusLabel = statusMeta.label
  const connectionLabel = getConnectionLabel(status, error)

  const {
    avatarUrl,
    codingActivity,
    customStatus,
    gameActivity,
    gameImage,
    spotify,
  } = useMemo(() => deriveDiscordPresenceView(data), [data])
  const codingElapsed =
    codingActivity?.timestamps?.start !== undefined
      ? formatTime(now - codingActivity.timestamps.start)
      : null

  return (
    <div className="group/discord relative h-full w-full overflow-hidden rounded-xl border-[3px] border-black bg-black shadow-brutal">
      <div className="absolute inset-0 z-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover opacity-60 blur-[2px] transition-transform duration-700 group-hover/discord:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-black opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/35" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-end p-4">
        <div className="flex flex-col rounded-xl border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
            {PROFILE_DISCORD_ID ? (
              <a
                href={`https://discord.com/users/${PROFILE_DISCORD_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white transition-opacity hover:opacity-90"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 127.14 96.36"
                  fill="currentColor"
                  className="opacity-90"
                >
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.89,105.89,0,0,0,126.6,80.22c2.91-27.55-13.53-51.36-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                </svg>
                <h3 className="text-sm leading-none font-bold">
                  {data ? data.discord_user.username : "Discord"}
                </h3>
              </a>
            ) : (
              <h3 className="text-sm leading-none font-bold text-white">
                {data ? data.discord_user.username : "Discord"}
              </h3>
            )}

            <span className="text-[10px] font-medium text-white/60">
              {formatAgo(now, lastUpdated)}
            </span>
          </div>

          <div
            className="mb-3 flex items-center gap-2 border-b border-white/10 pb-3"
            aria-live="polite"
          >
            <span
              className={cn(
                "h-2.5 w-2.5 animate-pulse rounded-full",
                statusColor
              )}
            />
            <span className="text-[10px] font-semibold tracking-wider text-white/80 uppercase">
              {statusLabel}
            </span>
            <span className="text-[10px] text-white/60">{connectionLabel}</span>

            {data && (
              <div className="ml-auto flex items-center gap-1 border-l border-white/10 pl-2 text-white/55">
                {data.active_on_discord_mobile && (
                  <Smartphone className="h-3 w-3" />
                )}
                {data.active_on_discord_desktop && (
                  <Laptop className="h-3 w-3" />
                )}
                {data.active_on_discord_web && <Globe className="h-3 w-3" />}
              </div>
            )}
          </div>

          <div className="flex min-h-[92px] items-end">
            {!data ? (
              <div className="flex w-full items-center gap-3 rounded-lg border border-white/5 bg-black/20 px-3 py-4 text-white/75">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-xs font-semibold">
                  Loading Discord presence...
                </p>
              </div>
            ) : gameActivity ? (
              <div className="w-full rounded-lg border border-white/10 bg-black/40 p-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {gameImage ? (
                      <img
                        src={gameImage}
                        className="h-12 w-12 rounded-md bg-black/30 object-cover"
                        alt="Game activity"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(event) => {
                          const target = event.currentTarget
                          target.style.display = "none"
                          target.nextElementSibling?.classList.remove("hidden")
                        }}
                      />
                    ) : null}
                    <Gamepad2
                      className={cn(
                        "h-12 w-12 rounded-md bg-purple-500/25 p-2 text-purple-300",
                        gameImage && "hidden"
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[10px] font-bold tracking-widest text-purple-300 uppercase">
                      Playing
                    </p>
                    <p className="truncate text-sm font-bold text-white">
                      {gameActivity.name}
                    </p>
                    {gameActivity.timestamps?.start && (
                      <p className="mt-1 font-mono text-[11px] text-white/65">
                        {formatTime(now - gameActivity.timestamps.start)}{" "}
                        elapsed
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : codingActivity ? (
              <div className="w-full rounded-lg border border-white/10 bg-black/40 p-3">
                <div className="flex items-center gap-3">
                  {getActivityImage(codingActivity) ? (
                    <img
                      src={getActivityImage(codingActivity)!}
                      className="h-10 w-10 rounded-md bg-black/30"
                      alt="Coding activity"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Code2 className="h-10 w-10 rounded-md bg-blue-500/25 p-2 text-blue-300" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[10px] font-bold tracking-widest text-blue-300 uppercase">
                      Working On {codingActivity.name}
                    </p>
                    <p className="truncate text-xs font-semibold text-white">
                      {codingActivity.details || "No file details"}
                    </p>
                    <div className="flex items-center gap-2">
                      {codingActivity.state && (
                        <p className="truncate text-[11px] text-white/70">
                          {codingActivity.state}
                        </p>
                      )}
                      {codingElapsed && (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-white/65">
                          <Gamepad2 className="h-3 w-3" />
                          {codingElapsed}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : spotify ? (
              <div className="w-full rounded-lg border border-white/10 bg-black/40 p-3">
                <div className="mb-2 flex items-center gap-3">
                  {spotify.album_art_url ? (
                    <img
                      src={spotify.album_art_url}
                      className="h-12 w-12 rounded-md shadow-md"
                      alt="Album art"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-md bg-white/10" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[10px] font-bold tracking-widest text-green-400 uppercase">
                      Listening To Spotify
                    </p>
                    <p className="truncate text-sm font-bold text-white">
                      {spotify.song}
                    </p>
                    <p className="truncate text-[11px] text-white/70">
                      {spotify.artist}
                    </p>
                  </div>
                </div>

                {spotify.timestamps && (
                  <div className="space-y-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full border border-white/5 bg-black/60">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all duration-1000 ease-linear"
                        style={{
                          width: `${calculateProgress(now, spotify.timestamps.start, spotify.timestamps.end)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between font-mono text-[10px] text-white/45">
                      <span>{formatTime(now - spotify.timestamps.start)}</span>
                      <span>
                        {formatTime(
                          spotify.timestamps.end - spotify.timestamps.start
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex w-full items-center gap-2 rounded-lg border border-white/5 bg-black/20 px-3 py-4 text-white/65">
                <Moon className="h-4 w-4" />
                <p className="truncate text-xs italic">
                  &quot;{customStatus?.state || DEFAULT_CUSTOM_STATUS}&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
