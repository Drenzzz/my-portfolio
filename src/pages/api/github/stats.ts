import type { APIRoute } from "astro"
import { fetchGithubStatsWithCache } from "@/lib/github"

export const prerender = false

export const GET: APIRoute = async () => {
  const stats = await fetchGithubStatsWithCache()

  return new Response(JSON.stringify({ stats }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}
