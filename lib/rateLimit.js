// In-memory rate limiter for Vercel Edge Functions
// Resets on cold start — acceptable for v1

const store = new Map();

const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || "5");
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "600000"); // 10 minutes

export function checkRateLimit(ip) {
  const now = Date.now();
  const key = ip || "anonymous";

  if (!store.has(key)) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  const record = store.get(key);

  // Window expired — reset
  if (now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  // Within window
  if (record.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter: retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - record.count };
}
