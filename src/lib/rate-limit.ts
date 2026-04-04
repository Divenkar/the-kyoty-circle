/**
 * Simple in-memory rate limiter for API routes.
 *
 * Suitable for single-instance deployments. For multi-instance,
 * swap with Redis-based implementation (e.g. @upstash/ratelimit).
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });
 *   // In route handler:
 *   const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
 *   if (!limiter.check(ip)) return apiError('Too many requests', 429);
 */

interface RateLimiterOptions {
    /** Time window in milliseconds */
    windowMs: number;
    /** Maximum requests per window */
    max: number;
}

interface TokenBucket {
    count: number;
    resetAt: number;
}

export function createRateLimiter(options: RateLimiterOptions) {
    const { windowMs, max } = options;
    const buckets = new Map<string, TokenBucket>();

    // Periodically clean up expired entries to prevent memory leaks
    const CLEANUP_INTERVAL = Math.max(windowMs * 2, 60_000);
    let lastCleanup = Date.now();

    function cleanup() {
        const now = Date.now();
        if (now - lastCleanup < CLEANUP_INTERVAL) return;
        lastCleanup = now;
        for (const [key, bucket] of buckets) {
            if (bucket.resetAt <= now) {
                buckets.delete(key);
            }
        }
    }

    return {
        /**
         * Check if the key is within rate limits.
         * @returns true if request is allowed, false if rate limited
         */
        check(key: string): boolean {
            cleanup();
            const now = Date.now();
            const bucket = buckets.get(key);

            if (!bucket || bucket.resetAt <= now) {
                buckets.set(key, { count: 1, resetAt: now + windowMs });
                return true;
            }

            if (bucket.count >= max) {
                return false;
            }

            bucket.count += 1;
            return true;
        },

        /** Get remaining requests for a key */
        remaining(key: string): number {
            const bucket = buckets.get(key);
            if (!bucket || bucket.resetAt <= Date.now()) return max;
            return Math.max(0, max - bucket.count);
        },
    };
}
