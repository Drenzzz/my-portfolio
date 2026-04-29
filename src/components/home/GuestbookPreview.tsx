"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowUpRight, MessageCircleHeart } from "lucide-react"
import type { GuestbookEntry } from "@/types"

interface Props {
  pageKey?: string
  limit?: number
}

const defaultPageKey = "page:/about"
const defaultLimit = 3

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Recently"

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date)
}

export function GuestbookPreview({
  pageKey = defaultPageKey,
  limit = defaultLimit,
}: Props) {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const encodedPageKey = useMemo(() => encodeURIComponent(pageKey), [pageKey])

  useEffect(() => {
    let cancelled = false

    fetch(`/api/guestbook?pageKey=${encodedPageKey}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load guestbook preview")

        const json = (await response.json()) as { entries?: GuestbookEntry[] }
        return Array.isArray(json.entries) ? json.entries.slice(0, limit) : []
      })
      .then((nextEntries) => {
        if (cancelled) return
        setError(null)
        setEntries(nextEntries)
      })
      .catch(() => {
        if (cancelled) return
        setError("Guestbook preview is unavailable right now.")
      })
      .finally(() => {
        if (cancelled) return
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [encodedPageKey, limit])

  return (
    <section className="relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-xl border-[3px] border-black bg-white p-5 shadow-brutal">
      <div className="absolute inset-x-0 top-0 h-2 bg-[#C4A1FF]" />
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-black bg-[#C4A1FF] text-black shadow-brutal-sm">
            <MessageCircleHeart className="h-5 w-5" />
          </div>
          <div>
            <p className="font-head text-[11px] font-black tracking-widest text-muted-foreground uppercase">
              Social Proof
            </p>
            <h3 className="font-head text-xl leading-tight font-black text-black">
              Latest Guestbook
            </h3>
          </div>
        </div>

        <a
          href="/about"
          className="inline-flex items-center gap-1 rounded-sm border-2 border-black bg-[#F4F4F5] px-3 py-1.5 text-[10px] font-black text-black uppercase shadow-brutal-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#C4A1FF] hover:shadow-none"
        >
          View About
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="grid flex-1 gap-2.5">
        {isLoading ? (
          Array.from({ length: limit }).map((_, index) => (
            <div
              key={`guestbook-preview-skeleton-${index}`}
              className="rounded-xl border-2 border-black bg-[#F4F4F5] p-3 shadow-brutal-sm"
            >
              <div className="mb-2 h-3 w-24 animate-pulse rounded-sm bg-black/15" />
              <div className="h-3 w-full animate-pulse rounded-sm bg-black/10" />
            </div>
          ))
        ) : error ? (
          <div className="flex min-h-24 items-center rounded-xl border-2 border-black bg-[#F4F4F5] p-4 text-sm font-bold text-muted-foreground shadow-brutal-sm">
            {error}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex min-h-24 items-center rounded-xl border-2 border-black bg-[#F4F4F5] p-4 text-sm font-bold text-muted-foreground shadow-brutal-sm">
            No messages yet. Be the first one to leave a note.
          </div>
        ) : (
          entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-xl border-2 border-black bg-[#F4F4F5] p-3 shadow-brutal-sm"
            >
              <div className="mb-1 flex items-center justify-between gap-3">
                <strong className="font-head truncate text-xs font-black text-black uppercase">
                  {entry.name}
                </strong>
                <time className="shrink-0 text-[10px] font-black text-muted-foreground uppercase">
                  {formatDate(entry.createdAt)}
                </time>
              </div>
              <p className="line-clamp-2 text-sm leading-relaxed font-semibold text-muted-foreground">
                {entry.message}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
