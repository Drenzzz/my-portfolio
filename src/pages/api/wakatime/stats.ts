import type { APIRoute } from "astro"
import { fetchWakaTimeStatsWithCache } from "@/lib/wakatime"

export const prerender = false

export const GET: APIRoute = async () => {
  const stats = await fetchWakaTimeStatsWithCache()

  return new Response(JSON.stringify({ stats }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}
