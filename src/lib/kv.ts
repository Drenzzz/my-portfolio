import { Redis } from "@upstash/redis"

const memoryStore = new Map<string, string>()

const readEnv = (key: string) => {
  if (typeof process !== "undefined" && process.env[key]) {
    return process.env[key]
  }

  const importEnv = import.meta.env as Record<string, string | undefined>
  return importEnv[key]
}

const kvRestUrl = readEnv("KV_REST_API_URL")
const kvRestToken = readEnv("KV_REST_API_TOKEN")

let kvClient: Redis | null = null

const getKvClient = () => {
  if (!kvRestUrl || !kvRestToken) return null
  if (kvClient) return kvClient

  kvClient = new Redis({
    url: kvRestUrl,
    token: kvRestToken,
  })

  return kvClient
}

export const isKvEnabled = () => Boolean(kvRestUrl && kvRestToken)

export const buildKvKey = (...parts: string[]) => {
  return parts
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .join(":")
}

export const getCounter = async (key: string) => {
  const client = getKvClient()
  if (!client) {
    const raw = memoryStore.get(key)
    return raw ? Number(raw) || 0 : 0
  }

  const value = await client.get<number>(key)
  return typeof value === "number" ? value : 0
}

export const incrementCounter = async (key: string, by = 1) => {
  const client = getKvClient()
  if (!client) {
    const current = Number(memoryStore.get(key) || "0") || 0
    const next = current + by
    memoryStore.set(key, String(next))
    return next
  }

  return client.incrby(key, by)
}

export const getJson = async <T>(key: string): Promise<T | null> => {
  const client = getKvClient()
  if (!client) {
    const raw = memoryStore.get(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  }

  return client.get<T>(key)
}

export const setJson = async (
  key: string,
  value: unknown,
  ttlSeconds?: number
) => {
  const client = getKvClient()
  if (!client) {
    memoryStore.set(key, JSON.stringify(value))
    return
  }

  if (ttlSeconds && ttlSeconds > 0) {
    await client.set(key, value, { ex: ttlSeconds })
    return
  }

  await client.set(key, value)
}

export const setIfNotExists = async (
  key: string,
  value: string,
  ttlSeconds: number
) => {
  const client = getKvClient()
  if (!client) {
    if (memoryStore.has(key)) return false
    memoryStore.set(key, value)
    return true
  }

  const result = await client.set(key, value, {
    nx: true,
    ex: ttlSeconds,
  })

  return result === "OK"
}
