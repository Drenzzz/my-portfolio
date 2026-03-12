import type { APIRoute } from "astro"
import { z } from "zod"
import {
  buildKvKey,
  getJson,
  incrementCounter,
  setIfNotExists,
  setJson,
} from "@/lib/kv"
import type { GuestbookEntry } from "@/types"

export const prerender = false

const toSafeNumber = (value: string | null | undefined, fallback: number) => {
  if (!value) return fallback
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return parsed
}

const normalizePageKey = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9:/_-]/g, "")
    .slice(0, 120)
}

const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (!forwardedFor) return "anonymous"
  return forwardedFor.split(",")[0]?.trim() || "anonymous"
}

const createRateLimit = async (request: Request, pageKey: string) => {
  const windowSeconds = Math.max(
    toSafeNumber(import.meta.env.GUESTBOOK_RATE_LIMIT_WINDOW_SECONDS, 300),
    60
  )
  const maxRequests = Math.max(
    toSafeNumber(import.meta.env.GUESTBOOK_RATE_LIMIT_MAX_REQUESTS, 5),
    1
  )

  const ip = getClientIp(request)
  const rateKey = buildKvKey("guestbook", "rate", pageKey, ip)

  await setIfNotExists(rateKey, "0", windowSeconds)
  const currentCount = await incrementCounter(rateKey)
  return currentCount <= maxRequests
}

const listSchema = z.object({
  pageKey: z.string().min(1).max(120),
})

const messageMaxLength = Math.max(
  toSafeNumber(import.meta.env.GUESTBOOK_MAX_MESSAGE_LENGTH, 280),
  40
)

const createSchema = z.object({
  name: z.string().min(2).max(40),
  message: z.string().min(3).max(messageMaxLength),
  pageKey: z.string().min(1).max(120),
})

export const GET: APIRoute = async ({ url }) => {
  const parsed = listSchema.safeParse({
    pageKey: url.searchParams.get("pageKey") || "page:/about",
  })

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid pageKey" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const pageKey = normalizePageKey(parsed.data.pageKey)
  if (!pageKey) {
    return new Response(JSON.stringify({ error: "Invalid pageKey" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const storageKey = buildKvKey("guestbook", "entries", pageKey)
  const entries = (await getJson<GuestbookEntry[]>(storageKey)) || []

  return new Response(JSON.stringify({ entries }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}

export const POST: APIRoute = async ({ request }) => {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const parsed = createSchema.safeParse(payload)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid payload" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const pageKey = normalizePageKey(parsed.data.pageKey)
  if (!pageKey) {
    return new Response(JSON.stringify({ error: "Invalid pageKey" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const allowed = await createRateLimit(request, pageKey)
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { "content-type": "application/json" },
    })
  }

  const storageKey = buildKvKey("guestbook", "entries", pageKey)
  const entries = (await getJson<GuestbookEntry[]>(storageKey)) || []

  const nextEntry: GuestbookEntry = {
    id: crypto.randomUUID(),
    name: parsed.data.name.trim(),
    message: parsed.data.message.trim(),
    pageKey,
    createdAt: new Date().toISOString(),
  }

  const nextEntries = [nextEntry, ...entries].slice(0, 100)
  await setJson(storageKey, nextEntries)

  return new Response(JSON.stringify({ entry: nextEntry }), {
    status: 201,
    headers: { "content-type": "application/json" },
  })
}
