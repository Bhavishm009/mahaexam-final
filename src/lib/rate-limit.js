const memory = globalThis.__mahaExamRateLimit || new Map();
globalThis.__mahaExamRateLimit = memory;
export function rateLimit(key, limit = 60, windowMs = 60000) {
  const now = Date.now(),
    x = memory.get(key);
  if (!x || now - x.started >= windowMs) {
    memory.set(key, { started: now, count: 1 });
    return { allowed: true, remaining: limit - 1 };
  }
  x.count++;
  return { allowed: x.count <= limit, remaining: Math.max(0, limit - x.count) };
}
export async function distributedRateLimit(key, limit = 60, windowMs = 60000) {
  return rateLimit(key, limit, windowMs);
}
