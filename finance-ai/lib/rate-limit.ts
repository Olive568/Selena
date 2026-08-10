type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (entry && now < entry.resetAt) {
    if (entry.count >= limit) {
      return false;
    }
    entry.count++;
  } else {
    store.set(key, { count: 1, resetAt: now + windowMs });
  }

  return true;
}
