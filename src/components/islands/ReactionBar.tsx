"use client"

import { useEffect, useMemo, useState } from "react"
import { ThumbsUp, Flame, Rocket } from "lucide-react"
import type { ReactionType } from "@/types"

interface Props {
  pageKey: string
}

type ReactionCounts = Record<ReactionType, number>

const reactionIcons: Record<ReactionType, React.ReactNode> = {
  like: <ThumbsUp className="w-4 h-4" />,
  fire: <Flame className="w-4 h-4" />,
  rocket: <Rocket className="w-4 h-4" />,
}

const emptyCounts: ReactionCounts = {
  like: 0,
  fire: 0,
  rocket: 0,
}

export function ReactionBar({ pageKey }: Props) {
  const [counts, setCounts] = useState<ReactionCounts>(emptyCounts)
  const encodedKey = useMemo(() => encodeURIComponent(pageKey), [pageKey])

  useEffect(() => {
    fetch(`/api/reactions?key=${encodedKey}`)
      .then(async (response) => {
        if (!response.ok) return null
        const json = (await response.json()) as { counts?: ReactionCounts }
        return json.counts || null
      })
      .then((nextCounts) => {
        if (nextCounts) {
          setCounts(nextCounts)
        }
      })
      .catch(() => {
        return
      })
  }, [encodedKey])

  const react = async (type: ReactionType) => {
    const response = await fetch(
      `/api/reactions?key=${encodedKey}&type=${type}`,
      {
        method: "POST",
      }
    )
    if (!response.ok) return

    const json = (await response.json()) as { counts?: ReactionCounts }
    if (json.counts) {
      setCounts(json.counts)
    }
  }

  return (
    <section className="rounded-xl border-[3px] border-black bg-white p-4 shadow-brutal">
      <p className="font-head mb-2 text-xs font-black uppercase">Reactions</p>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(reactionIcons) as ReactionType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => react(type)}
            className="inline-flex items-center gap-1.5 rounded-sm border-2 border-black bg-[#F4F4F5] px-3 py-1.5 text-sm font-bold transition-all hover:-translate-y-[1px] hover:bg-[#C4A1FF]"
          >
            <span>{reactionIcons[type]}</span>
            <span>{counts[type]}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
