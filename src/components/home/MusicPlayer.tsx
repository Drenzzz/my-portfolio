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
  Music,
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

  return (
    <div
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border-4 border-black bg-[#F4F4F5] p-3 shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Music player"
    >
      <div className="pointer-events-none absolute -right-6 -bottom-6 -rotate-12 transform opacity-10 transition-transform duration-500 group-hover:rotate-0">
        <Music className="h-48 w-48" />
      </div>

      <div className="z-10 mb-2.5 flex items-center justify-between">
        <h3 className="font-head flex items-center gap-1.5 text-xl font-black tracking-tight text-black uppercase">
          <span
            className="h-2.5 w-2.5 animate-pulse rounded-full bg-black"
            style={{ animationDuration: isPlaying ? "1s" : "0s" }}
          ></span>
          Now Playing
        </h3>

        <div className="flex rounded-sm border-2 border-black bg-white shadow-brutal-sm">
          <button
            type="button"
            onClick={() => setIsMuted((prev) => !prev)}
            className="border-r-2 border-black p-1.5 transition-colors hover:bg-black hover:text-white"
            aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(event) =>
              setVolume(clamp(Number(event.target.value), 0, 100))
            }
            className="mx-2 w-16 accent-black"
            aria-label="Volume"
          />
        </div>
      </div>

      <div className="z-10 mb-2.5 flex flex-1 items-center gap-3 rounded-xl border-4 border-black bg-white p-2.5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-black bg-neutral-900 shadow-inner",
            isPlaying && "animate-spin"
          )}
          style={{ animationDuration: "3s" }}
        >
          <div className="h-4 w-4 rounded-full border-[2px] border-black bg-[#C4A1FF]"></div>
        </div>

        <div className="w-full overflow-hidden">
          <div className="mb-0.5 truncate text-lg leading-none font-black text-black">
            {currentTrack.title}
          </div>
          <div className="truncate text-xs font-bold tracking-widest text-muted-foreground uppercase">
            {currentTrack.artist}
          </div>
        </div>
      </div>

      <div className="relative z-10 rounded-xl border-4 border-black bg-white p-2 text-black">
        <div className="absolute inset-0 -z-10 translate-x-1 translate-y-1 rounded-xl border-4 border-black bg-[#C4A1FF]"></div>

        <div className="mb-1.5 flex items-center gap-2 px-1">
          <span className="text-[10px] font-black tabular-nums">
            {formatTime(progress)}
          </span>
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full border-2 border-black bg-[#F4F4F5]">
              <div
                className="h-full border-r-2 border-black bg-[#C4A1FF] transition-all"
                style={{ width: `${(progress / (duration || 1)) * 100}%` }}
              ></div>
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
          <span className="text-[10px] font-black tabular-nums">
            {formatTime(duration)}
          </span>
        </div>

        <div className="mb-1.5 flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setIsShuffle((prev) => !prev)}
            className={cn(
              "rounded border-2 px-1.5 py-0.5 text-[10px] font-bold transition-all",
              isShuffle
                ? "border-black bg-[#C4A1FF] text-black shadow-brutal-sm"
                : "border-transparent text-black/70 hover:border-black hover:bg-black hover:text-white"
            )}
            aria-label="Toggle shuffle"
            aria-pressed={isShuffle}
          >
            <span className="inline-flex items-center gap-1">
              <Shuffle className="h-3 w-3" />
              Shuffle
            </span>
          </button>

          <span className="text-[10px] font-black text-black">
            {currentTrackIdx + 1}/{playlist.length}
          </span>

          <button
            type="button"
            onClick={handleCycleRepeatMode}
            className={cn(
              "rounded border-2 px-1.5 py-0.5 text-[10px] font-bold transition-all",
              repeatMode !== "off"
                ? "border-black bg-[#C4A1FF] text-black shadow-brutal-sm"
                : "border-transparent text-black/70 hover:border-black hover:bg-black hover:text-white"
            )}
            aria-label={repeatLabel}
          >
            <span className="inline-flex items-center gap-1">
              {repeatMode === "one" ? (
                <Repeat1 className="h-3 w-3" />
              ) : (
                <Repeat className="h-3 w-3" />
              )}
              {repeatMode === "one" ? "One" : "Repeat"}
            </span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={handlePrev}
            className="transition-transform hover:-translate-x-1"
            aria-label="Previous Track"
          >
            <SkipBack className="h-4 w-4 fill-current" />
          </button>
          <button
            type="button"
            onClick={handlePlayPause}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-[#C4A1FF] text-black shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform hover:scale-110"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-black" />
            ) : (
              <Play className="ml-1 h-4 w-4 fill-black" />
            )}
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="transition-transform hover:translate-x-1"
            aria-label="Next Track"
          >
            <SkipForward className="h-4 w-4 fill-current" />
          </button>
        </div>
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
