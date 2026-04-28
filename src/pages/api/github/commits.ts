import type { APIRoute } from "astro"
import { fetchGithubRecentCommitsWithCache } from "@/lib/github"

export const prerender = false

export const GET: APIRoute = async () => {
  const commits = await fetchGithubRecentCommitsWithCache()

  return new Response(JSON.stringify({ commits }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}
