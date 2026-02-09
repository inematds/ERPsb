/**
 * Simple in-memory cache for server-side data with TTL.
 * Used to avoid repeated expensive DB queries on Vercel serverless.
 * Cache is per-instance (not shared across serverless invocations),
 * but still effective because Vercel reuses warm instances.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Get or set a cached value. If the key exists and hasn't expired,
 * returns the cached value. Otherwise, calls fn() and caches the result.
 */
export async function cached<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const entry = cache.get(key) as CacheEntry<T> | undefined;

  if (entry && entry.expiresAt > now) {
    return entry.data;
  }

  const data = await fn();
  cache.set(key, { data, expiresAt: now + ttlMs });
  return data;
}

/** Invalidate a specific cache key */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/** Invalidate all keys matching a prefix */
export function invalidateCachePrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}
