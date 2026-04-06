// In-memory rate limiter for serverless (per-instance)
// Sufficient for Vercel — each cold start resets, but within a warm instance it throttles abuse

interface RateLimitEntry {
  count: number
  resetAt: number
}

const stores = new Map<string, Map<string, RateLimitEntry>>()

interface RateLimitConfig {
  /** Unique identifier for this limiter (e.g. 'login', 'forgot-password') */
  id: string
  /** Max requests allowed in the window */
  limit: number
  /** Window size in seconds */
  windowSeconds: number
}

/**
 * Check rate limit for a given IP.
 * Returns { success: true } if allowed, or { success: false, retryAfter } if blocked.
 */
export function checkRateLimit(
  ip: string,
  config: RateLimitConfig
): { success: true } | { success: false; retryAfter: number } {
  if (!stores.has(config.id)) {
    stores.set(config.id, new Map())
  }
  const store = stores.get(config.id)!

  const now = Date.now()
  const entry = store.get(ip)

  // Clean up expired entries periodically (every 100 checks)
  if (Math.random() < 0.01) {
    store.forEach((val, key) => {
      if (val.resetAt < now) store.delete(key)
    })
  }

  if (!entry || entry.resetAt < now) {
    // New window
    store.set(ip, { count: 1, resetAt: now + config.windowSeconds * 1000 })
    return { success: true }
  }

  if (entry.count >= config.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return { success: false, retryAfter }
  }

  entry.count++
  return { success: true }
}

/** Get client IP from request headers (works on Vercel) */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || '127.0.0.1'
}
