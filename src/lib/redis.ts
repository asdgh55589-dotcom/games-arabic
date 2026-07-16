/**
 * lib/redis.ts — اتصال Redis عبر Upstash (serverless, HTTP-based).
 */

import { Redis } from '@upstash/redis'

const hasRedis = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
)

let redisClient: Redis | null = null
if (hasRedis) {
  redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

const memoryStore = new Map<string, { value: string; expires: number }>()

export async function redisGet<T>(key: string): Promise<T | null> {
  if (redisClient) {
    try {
      const result = await redisClient.get<T>(key)
      return result
    } catch (err) {
      console.error('[redis] get failed:', err)
    }
  }
  const entry = memoryStore.get(key)
  if (!entry) return null
  if (entry.expires < Date.now()) {
    memoryStore.delete(key)
    return null
  }
  try {
    return JSON.parse(entry.value) as T
  } catch {
    return null
  }
}

export async function redisSet(key: string, value: unknown, ttlSeconds: number = 60): Promise<void> {
  const stringValue = JSON.stringify(value)
  if (redisClient) {
    try {
      await redisClient.set(key, stringValue, { ex: ttlSeconds })
      return
    } catch (err) {
      console.error('[redis] set failed:', err)
    }
  }
  memoryStore.set(key, { value: stringValue, expires: Date.now() + ttlSeconds * 1000 })
  if (memoryStore.size > 500) {
    const keys = Array.from(memoryStore.keys())
    for (let i = 0; i < 250; i++) memoryStore.delete(keys[i])
  }
}

export async function redisDel(key: string): Promise<void> {
  if (redisClient) {
    try { await redisClient.del(key); return } catch {}
  }
  memoryStore.delete(key)
}

export async function redisIncr(key: string, ttlSeconds: number = 60): Promise<number> {
  if (redisClient) {
    try {
      const result = await redisClient.incr(key)
      if (result === 1) await redisClient.expire(key, ttlSeconds)
      return result
    } catch (err) {
      console.error('[redis] incr failed:', err)
    }
  }
  const entry = memoryStore.get(key)
  const now = Date.now()
  if (!entry || entry.expires < now) {
    memoryStore.set(key, { value: '1', expires: now + ttlSeconds * 1000 })
    return 1
  }
  const count = parseInt(entry.value, 10) + 1
  entry.value = count.toString()
  memoryStore.set(key, entry)
  return count
}

export function getRedisInfo() {
  return { connected: hasRedis, type: redisClient ? 'upstash' : 'in-memory', storeSize: memoryStore.size }
}

export { redisClient }
