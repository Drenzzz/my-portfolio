"use client"

import { useEffect, useState } from "react"
import { Eye } from "lucide-react"

interface Props {
  pageKey: string
}

export function ViewCounter({ pageKey }: Props) {
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    const safeKey = encodeURIComponent(pageKey)
    fetch(`/api/views?key=${safeKey}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) return null
        const json = (await response.json()) as { views?: number }
        if (typeof json.views !== "number") return null
        return json.views
      })
      .then((nextViews) => {
        if (typeof nextViews === "number") {
          setViews(nextViews)
        }
      })
      .catch(() => {
        return
      })
  }, [pageKey])

  return (
    <div className="font-head inline-flex items-center gap-2 rounded-sm border-2 border-black bg-white px-3 py-1 text-xs font-bold uppercase shadow-brutal-sm">
      <Eye className="h-3.5 w-3.5" />
      <span>{views ?? "-"} Views</span>
    </div>
  )
}
