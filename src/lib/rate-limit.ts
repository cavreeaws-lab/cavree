// Simple in-memory rate limiter for API routes
// Use Redis (ioredis) for production multi-instance deployments

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return "unknown"
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export function rateLimit(
  request: Request,
  limit: number = 60,
  windowMs: number = 60 * 1000
): RateLimitResult {
  const ip = getClientIp(request)
  const now = Date.now()
  const key = `${ip}:${request.url}`

  const entry = store.get(key)
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs }
  }

  if (entry.count >= limit) {
    return { success: false, limit, remaining: 0, reset: entry.resetAt }
  }

  entry.count += 1
  return { success: true, limit, remaining: limit - entry.count, reset: entry.resetAt }
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Array.from(store.entries()).forEach(([key, entry]) => {
    if (now > entry.resetAt) store.delete(key)
  })
}, 5 * 60 * 1000)
