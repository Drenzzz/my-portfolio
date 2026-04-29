"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
import {
  Minimize2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { playlist } from "@/data/playlist"

const STORAGE_KEYS = {
  volume: "drenzzz-volume",
  muted: "drenzzz-muted",
  trackIndex: "drenzzz-track-idx",
  shuffle: "drenzzz-shuffle",
  repeatMode: "drenzzz-repeat-mode",
} as const

type RepeatMode = "off" | "all" | "one"

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}

const formatTime = (value: number) => {
  if (!Number.isFinite(value) || value < 0) return "0:00"
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0")
  return `${minutes}:${seconds}`
}

const readNumber = (key: string, fallback: number) => {
  if (typeof window === "undefined") return fallback

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = Number(raw)
    if (!Number.isFinite(parsed)) return fallback
    return parsed
  } catch {
    return fallback
  }
}

const readBoolean = (key: string, fallback: boolean) => {
  if (typeof window === "undefined") return fallback

  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return raw === "true"
  } catch {
    return fallback
  }
}

const savePreference = (key: string, value: string) => {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(key, value)
  } catch {
    return
  }
}

const readRepeatMode = () => {
  if (typeof window === "undefined") return "off" as RepeatMode

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.repeatMode)
    if (raw === "off" || raw === "all" || raw === "one") return raw
    return "off"
  } catch {
    return "off"
  }
}

export function MusicPlayer() {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(() => {
    const saved = readNumber(STORAGE_KEYS.trackIndex, 0)
    return clamp(Math.floor(saved), 0, Math.max(playlist.length - 1, 0))
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(() =>
    clamp(readNumber(STORAGE_KEYS.volume, 50), 0, 100)
  )
  const [isMuted, setIsMuted] = useState(() =>
    readBoolean(STORAGE_KEYS.muted, false)
  )
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isShuffle, setIsShuffle] = useState(() =>
    readBoolean(STORAGE_KEYS.shuffle, false)
  )
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(() =>
    readRepeatMode()
  )
  const [isExpanded, setIsExpanded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentTrack = useMemo(
    () => playlist[currentTrackIdx],
    [currentTrackIdx]
  )

  useEffect(() => {
    savePreference(STORAGE_KEYS.volume, volume.toString())
  }, [volume])

  useEffect(() => {
    savePreference(STORAGE_KEYS.muted, isMuted.toString())
  }, [isMuted])

  useEffect(() => {
    savePreference(STORAGE_KEYS.trackIndex, currentTrackIdx.toString())
  }, [currentTrackIdx])

  useEffect(() => {
    savePreference(STORAGE_KEYS.shuffle, isShuffle.toString())
  }, [isShuffle])

  useEffect(() => {
    savePreference(STORAGE_KEYS.repeatMode, repeatMode)
  }, [repeatMode])

  useEffect(() => {
    if (!audioRef.current) return

    audioRef.current.volume = isMuted ? 0 : volume / 100
    audioRef.current.muted = isMuted
  }, [volume, isMuted])

  useEffect(() => {
    if (!audioRef.current) return

    if (!hasInteracted || !isPlaying) return

    audioRef.current.play().catch(() => {
      setIsPlaying(false)
    })
  }, [currentTrackIdx, hasInteracted, isPlaying])

  const handlePrev = useCallback(() => {
    setHasInteracted(true)
    setProgress(0)
    setDuration(0)
    setCurrentTrackIdx((prev) => (prev - 1 + playlist.length) % playlist.length)
  }, [])

  const handleNext = useCallback(() => {
    setHasInteracted(true)
    setProgress(0)
    setDuration(0)
    setCurrentTrackIdx((prev) => {
      if (isShuffle && playlist.length > 1) {
        let next = prev
        while (next === prev) {
          next = Math.floor(Math.random() * playlist.length)
        }
        return next
      }

      if (repeatMode === "off" && prev === playlist.length - 1) {
        return prev
      }

      return (prev + 1) % playlist.length
    })
  }, [isShuffle, repeatMode])

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return

    setHasInteracted(true)
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false)
      })
      return
    }

    audioRef.current.pause()
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return

      if (event.code === "Space" || event.code === "KeyK") {
        event.preventDefault()
        handlePlayPause()
        return
      }

      if (event.code === "ArrowRight") {
        event.preventDefault()
        handleNext()
        return
      }

      if (event.code === "ArrowLeft") {
        event.preventDefault()
        handlePrev()
        return
      }

      if (event.code === "KeyM") {
        event.preventDefault()
        setIsMuted((prev) => !prev)
        return
      }

      if (event.code === "KeyS") {
        event.preventDefault()
        setIsShuffle((prev) => !prev)
        return
      }

      if (event.code === "KeyR") {
        event.preventDefault()
        setRepeatMode((prev) => {
          if (prev === "off") return "all"
          if (prev === "all") return "one"
          return "off"
        })
      }
    },
    [handleNext, handlePlayPause, handlePrev]
  )

  const handleSeek = useCallback(
    (value: number) => {
      if (!audioRef.current || duration <= 0 || !Number.isFinite(duration))
        return

      const nextProgress = clamp(value, 0, duration)
      audioRef.current.currentTime = nextProgress
      setProgress(nextProgress)
    },
    [duration]
  )

  const handleCycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all"
      if (prev === "all") return "one"
      return "off"
    })
  }, [])

  const repeatLabel =
    repeatMode === "off"
      ? "Repeat Off"
      : repeatMode === "all"
        ? "Repeat All"
        : "Repeat One"

  const volumePercent = `${Math.round(volume)}%`

  return (
    <div className="fixed bottom-4 right-4 z-50" aria-label="Music player overlay">
      <div className="relative">
        <div
          className={cn(
            "origin-bottom-right overflow-hidden rounded-2xl border-[3px] border-black bg-white px-4 py-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all transition-neo",
            "w-[min(92vw,360px)]",
            isExpanded
              ? "pointer-events-auto relative opacity-100 translate-y-0 scale-100"
              : "pointer-events-none absolute bottom-0 right-0 opacity-0 translate-y-4 scale-90"
          )}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-hidden={!isExpanded}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] border-black bg-neutral-900 transition-all",
                isPlaying && "animate-spin"
              )}
              style={{ animationDuration: "3s" }}
            >
              <div className="h-5 w-5 rounded-full border-[2px] border-black bg-[#C4A1FF]" />
              {isPlaying && (
                <div className="pointer-events-none absolute -right-3 -top-1 flex items-end gap-0.5">
                  <span className="h-2 w-1 animate-pulse rounded-full bg-[#C4A1FF]" style={{ animationDuration: "0.8s" }} />
                  <span className="h-3 w-1 animate-pulse rounded-full bg-[#C4A1FF]" style={{ animationDuration: "1.1s" }} />
                  <span className="h-1.5 w-1 animate-pulse rounded-full bg-[#C4A1FF]" style={{ animationDuration: "0.9s" }} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 text-left">
              <p className="font-head text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                Now Playing
              </p>
              <p className="truncate font-head text-lg font-black text-black transition-all">
                {currentTrack.title}
              </p>
              <p className="truncate text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                {currentTrack.artist}
              </p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                Track {currentTrackIdx + 1} of {playlist.length}
              </p>
            </div>

            <button
              type="button"
              onClick={handlePlayPause}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#C4A1FF] shadow-brutal-sm transition-all hover:-translate-y-[1px] hover:shadow-none"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-black" />
              ) : (
                <Play className="ml-0.5 h-4 w-4 fill-black" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#F4F4F5] shadow-brutal-sm transition-all hover:-translate-y-[1px] hover:shadow-none"
              aria-expanded={isExpanded}
              aria-label="Collapse music player"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-rows-[1fr] transition-all duration-300" aria-hidden={!isExpanded}>
            <div className="overflow-hidden">
              <div className="mb-4 rounded-xl border-[3px] border-black bg-[#F4F4F5] p-3 shadow-brutal-sm">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[10px] font-black tabular-nums text-black">
                    {formatTime(progress)}
                  </span>
                  <div className="relative flex-grow">
                    <div className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full border-2 border-black bg-white">
                      <div
                        className="h-full border-r-2 border-black bg-[#C4A1FF] transition-all"
                        style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      step={0.1}
                      value={progress}
                      onChange={(event) => handleSeek(Number(event.target.value))}
                      className="relative z-10 h-5 w-full cursor-pointer appearance-none bg-transparent opacity-0 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-0 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:appearance-none"
                      aria-label="Seek track"
                    />
                  </div>
                  <span className="text-[10px] font-black tabular-nums text-black">
                    {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="transition-transform hover:-translate-x-1"
                    aria-label="Previous track"
                  >
                    <SkipBack className="h-4 w-4 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={handlePlayPause}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-[#C4A1FF] text-black shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform hover:scale-105"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 fill-black" />
                    ) : (
                      <Play className="ml-0.5 h-4 w-4 fill-black" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="transition-transform hover:translate-x-1"
                    aria-label="Next track"
                  >
                    <SkipForward className="h-4 w-4 fill-current" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-xl border-[3px] border-black bg-[#F4F4F5] p-3 shadow-brutal-sm">
                <button
                  type="button"
                  onClick={() => setIsMuted((prev) => !prev)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 border-black bg-white transition-all hover:-translate-y-[1px] hover:shadow-none"
                  aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>

                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(event) =>
                      setVolume(clamp(Number(event.target.value), 0, 100))
                    }
                    className="w-full accent-black"
                    aria-label="Volume"
                  />

                  <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => setIsShuffle((prev) => !prev)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded border-2 px-2 py-1 transition-all",
                        isShuffle
                          ? "border-black bg-[#C4A1FF] text-black shadow-brutal-sm"
                          : "border-transparent text-black/70 hover:border-black hover:bg-black hover:text-white"
                      )}
                      aria-label="Toggle shuffle"
                      aria-pressed={isShuffle}
                    >
                      <Shuffle className="h-3 w-3" />
                      Shuffle
                    </button>

                    <span className="text-black">{volumePercent}</span>

                    <button
                      type="button"
                      onClick={handleCycleRepeatMode}
                      className={cn(
                        "inline-flex items-center gap-1 rounded border-2 px-2 py-1 transition-all",
                        repeatMode !== "off"
                          ? "border-black bg-[#C4A1FF] text-black shadow-brutal-sm"
                          : "border-transparent text-black/70 hover:border-black hover:bg-black hover:text-white"
                      )}
                      aria-label={repeatLabel}
                    >
                      {repeatMode === "one" ? (
                        <Repeat1 className="h-3 w-3" />
                      ) : (
                        <Repeat className="h-3 w-3" />
                      )}
                      {repeatMode === "one" ? "One" : "Repeat"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className={cn(
            "group origin-bottom-right flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-[3px] border-black bg-white shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all transition-neo",
            isExpanded
              ? "pointer-events-none absolute bottom-0 right-0 opacity-0 translate-y-3 scale-75 rotate-6"
              : "pointer-events-auto relative opacity-100 translate-y-0 scale-100 hover:-translate-y-[2px] hover:shadow-none"
          )}
          aria-expanded={isExpanded}
          aria-label="Open music player"
          aria-hidden={isExpanded}
        >
          <div
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-black bg-neutral-900 transition-transform duration-300 group-hover:scale-105",
              isPlaying && "animate-spin"
            )}
            style={{ animationDuration: "3s" }}
          >
            <div className="h-4 w-4 rounded-full border-[2px] border-black bg-[#C4A1FF]" />
          </div>
        </button>
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.src}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          if (!audioRef.current) return
          setProgress(audioRef.current.currentTime)
        }}
        onLoadedMetadata={() => {
          if (!audioRef.current) return
          setDuration(audioRef.current.duration)
        }}
        onEnded={() => {
          if (repeatMode === "one" && audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.play().catch(() => {
              setIsPlaying(false)
            })
            return
          }

          if (
            repeatMode === "off" &&
            currentTrackIdx === playlist.length - 1 &&
            !isShuffle
          ) {
            setIsPlaying(false)
            return
          }

          handleNext()
        }}
      />
    </div>
  )
}
