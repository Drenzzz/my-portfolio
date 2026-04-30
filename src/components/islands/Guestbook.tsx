"use client"

import { useEffect, useMemo, useState } from "react"
import type { GuestbookEntry } from "@/types"

interface Props {
  pageKey: string
}

const MAX_MESSAGE_LENGTH = 280

export function Guestbook({ pageKey }: Props) {
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const encodedPageKey = useMemo(() => encodeURIComponent(pageKey), [pageKey])

  useEffect(() => {
    fetch(`/api/guestbook?pageKey=${encodedPageKey}`)
      .then(async (response) => {
        if (!response.ok) return []
        const json = (await response.json()) as { entries?: GuestbookEntry[] }
        return Array.isArray(json.entries) ? json.entries : []
      })
      .then((nextEntries) => {
        setEntries(nextEntries)
      })
      .catch(() => {
        return
      })
  }, [encodedPageKey])

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const safeName = name.trim()
    const safeMessage = message.trim()

    if (safeName.length < 2 || safeMessage.length < 3) {
      setError("Name and message are too short.")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: safeName,
          message: safeMessage,
          pageKey,
        }),
      })

      if (!response.ok) {
        setError("Unable to submit message right now.")
        return
      }

      const json = (await response.json()) as { entry?: GuestbookEntry }
      if (json.entry) {
        setEntries((prev) => [json.entry!, ...prev])
        setMessage("")
      }
    } catch {
      setError("Network error. Try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section
      id="guestbook-motion-root"
      className="container mx-auto px-4 py-16 md:py-24"
      aria-labelledby="guestbook-heading"
    >
      <div className="mb-8 max-w-2xl">
        <p className="font-head text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          Guestbook
        </p>
        <h2
          id="guestbook-heading"
          className="mt-2 font-head text-3xl font-black uppercase tracking-tight md:text-4xl"
        >
          Leave a Trace
        </h2>
      </div>

      <div
        className="rounded-xl border-4 border-black bg-white p-5 shadow-brutal md:p-6"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <div>
            <form onSubmit={submit} className="flex flex-col gap-3">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                className="w-full rounded-sm border-2 border-black bg-[#F4F4F5] px-3 py-2.5 text-sm font-medium"
                maxLength={40}
                required
              />
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Leave a message"
                className="h-32 w-full resize-none rounded-sm border-2 border-black bg-[#F4F4F5] px-3 py-2.5 text-sm font-medium"
                maxLength={MAX_MESSAGE_LENGTH}
                required
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  {message.length}/{MAX_MESSAGE_LENGTH}
                </span>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-sm border-2 border-black bg-[#C4A1FF] px-5 py-2 text-xs font-black uppercase shadow-brutal-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-60"
                >
                  {isLoading ? "Sending..." : "Send"}
                </button>
              </div>
            </form>

            {error && (
              <p className="mt-2 text-xs font-bold text-red-600">{error}</p>
            )}
          </div>

          <div className="scrollbar-neo-thin max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {entries.length === 0 ? (
              <p className="text-sm font-medium text-muted-foreground">
                No messages yet.
              </p>
            ) : (
              entries.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-sm border-2 border-black bg-[#F4F4F5] px-3 py-2.5"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <strong className="font-head text-xs uppercase">
                      {entry.name}
                    </strong>
                    <time className="text-[10px] font-semibold text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString("id-ID")}
                    </time>
                  </div>
                  <p className="text-sm font-medium">{entry.message}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
