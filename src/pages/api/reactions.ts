import type { APIRoute } from "astro"
import { z } from "zod"
import {
  buildKvKey,
  getCounter,
  incrementCounter,
  setIfNotExists,
} from "@/lib/kv"
import type { ReactionType } from "@/types"

export const prerender = false

const reactionTypes: ReactionType[] = ["like", "fire", "rocket"]

const toSafeNumber = (value: string | null | undefined, fallback: number) => {
  if (!value) return fallback
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return parsed
}

const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (!forwardedFor) return "anonymous"
  return forwardedFor.split(",")[0]?.trim() || "anonymous"
}

const normalizeKey = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9:/_-]/g, "")
    .slice(0, 120)
}

const schema = z.object({
  key: z.string().min(1).max(120),
  type: z.enum(reactionTypes),
})

const readCounts = async (key: string) => {
  const [like, fire, rocket] = await Promise.all([
    getCounter(buildKvKey("reactions", key, "like")),
    getCounter(buildKvKey("reactions", key, "fire")),
    getCounter(buildKvKey("reactions", key, "rocket")),
  ])

  return { like, fire, rocket }
}

export const GET: APIRoute = async ({ url }) => {
  const keyParam = url.searchParams.get("key") || "page:/"
  const key = normalizeKey(keyParam)
  if (!key) {
    return new Response(JSON.stringify({ error: "Invalid key" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const counts = await readCounts(key)
  return new Response(JSON.stringify({ key, counts }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}

export const POST: APIRoute = async ({ request, url }) => {
  const parsed = schema.safeParse({
    key: url.searchParams.get("key") || "",
    type: url.searchParams.get("type") || "",
  })

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid payload" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const key = normalizeKey(parsed.data.key)
  if (!key) {
    return new Response(JSON.stringify({ error: "Invalid key" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const ip = getClientIp(request)
  const windowSeconds = Math.max(
    toSafeNumber(import.meta.env.REACTION_RATE_LIMIT_WINDOW_SECONDS, 60),
    10
  )
  const maxRequests = Math.max(
    toSafeNumber(import.meta.env.REACTION_RATE_LIMIT_MAX_REQUESTS, 12),
    1
  )

  const rateKey = buildKvKey("reactions", "rate", key, parsed.data.type, ip)
  await setIfNotExists(rateKey, "0", windowSeconds)
  const requestCount = await incrementCounter(rateKey)

  if (requestCount > maxRequests) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { "content-type": "application/json" },
    })
  }

  const reactionKey = buildKvKey("reactions", key, parsed.data.type)
  await incrementCounter(reactionKey)
  const counts = await readCounts(key)

  return new Response(JSON.stringify({ key, counts }), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}
