const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 4;
const attempts = new Map<string, number[]>();

export function takeSessionSlot(key: string, now = Date.now()) {
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) return false;

  recent.push(now);
  attempts.set(key, recent);

  // ponytail: per-instance limiter; replace with host-level limiter if public traffic grows.
  if (attempts.size > 5000) {
    for (const [candidate, times] of attempts)
      if (times.every((time) => now - time >= RATE_WINDOW_MS)) attempts.delete(candidate);
  }
  return true;
}
