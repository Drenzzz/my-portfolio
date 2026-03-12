import type { APIRoute } from "astro"
import {
  buildKvKey,
  getCounter,
  incrementCounter,
  setIfNotExists,
} from "@/lib/kv"

export const prerender = false

const toSafeNumber = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return parsed
}

const normalizeKey = (value: string | null) => {
  if (!value) return null
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9:/_-]/g, "")
    .slice(0, 120)

  if (!normalized) return null
  return normalized
}

const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (!forwardedFor) return "anonymous"
  return forwardedFor.split(",")[0]?.trim() || "anonymous"
}

export const GET: APIRoute = async ({ url }) => {
  const key = normalizeKey(url.searchParams.get("key"))
  if (!key) {
    return new Response(JSON.stringify({ error: "Invalid key" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const viewKey = buildKvKey("views", key)
  const views = await getCounter(viewKey)

  return new Response(JSON.stringify({ key, views }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}

export const POST: APIRoute = async ({ request, url }) => {
  const key = normalizeKey(url.searchParams.get("key"))
  if (!key) {
    return new Response(JSON.stringify({ error: "Invalid key" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const ip = getClientIp(request)
  const throttleSeconds = Math.max(
    toSafeNumber(import.meta.env.VIEW_COUNT_THROTTLE_SECONDS, 3600),
    60
  )

  const throttleKey = buildKvKey("views", "throttle", key, ip)
  const countKey = buildKvKey("views", key)

  const canIncrement = await setIfNotExists(throttleKey, "1", throttleSeconds)
  if (canIncrement) {
    const views = await incrementCounter(countKey)
    return new Response(JSON.stringify({ key, views, throttled: false }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  }

  const views = await getCounter(countKey)
  return new Response(JSON.stringify({ key, views, throttled: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}
