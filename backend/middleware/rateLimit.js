// backend/middleware/rateLimit.js
// A small dependency-free, in-memory rate limiter. Enough to blunt brute-force
// and credential-stuffing on auth endpoints. For multi-instance production use a
// shared store (Redis) instead, but this is a real improvement over nothing.
export function rateLimit({ windowMs = 15 * 60 * 1000, max = 10, message } = {}) {
  const hits = new Map(); // key -> { count, resetAt }

  // Periodically drop expired buckets so the map does not grow unbounded.
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs);
  if (typeof sweep.unref === "function") sweep.unref();

  return function (req, res, next) {
    const key = req.ip || req.socket?.remoteAddress || "unknown";
    const now = Date.now();
    let entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({
        success: false,
        message: message || "Too many attempts. Please try again later.",
      });
    }

    next();
  };
}
