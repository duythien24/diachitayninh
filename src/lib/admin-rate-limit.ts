import "server-only";

const maxFailedAttempts = 5;
const lockDurationMs = 10 * 60 * 1000;
const attemptWindowMs = 10 * 60 * 1000;

type LoginAttempt = {
  count: number;
  firstAttemptAt: number;
  lockedUntil?: number;
};

const attempts = new Map<string, LoginAttempt>();

function keyFor(ip: string, username: string) {
  return `${ip || "unknown"}:${username.trim().toLowerCase() || "unknown"}`;
}

function cleanup(now: number) {
  for (const [key, attempt] of attempts.entries()) {
    const lockExpired = attempt.lockedUntil && attempt.lockedUntil <= now;
    const windowExpired = now - attempt.firstAttemptAt > attemptWindowMs;

    if (lockExpired || (!attempt.lockedUntil && windowExpired)) {
      attempts.delete(key);
    }
  }
}

export function getLoginRateLimitState(ip: string, username: string) {
  const now = Date.now();
  cleanup(now);

  const attempt = attempts.get(keyFor(ip, username));
  if (!attempt?.lockedUntil || attempt.lockedUntil <= now) {
    return { locked: false, retryAfterSeconds: 0 };
  }

  return {
    locked: true,
    retryAfterSeconds: Math.ceil((attempt.lockedUntil - now) / 1000)
  };
}

export function recordLoginFailure(ip: string, username: string) {
  const now = Date.now();
  cleanup(now);

  const key = keyFor(ip, username);
  const current = attempts.get(key);
  const attempt =
    current && now - current.firstAttemptAt <= attemptWindowMs
      ? current
      : {
          count: 0,
          firstAttemptAt: now
        };

  attempt.count += 1;

  if (attempt.count >= maxFailedAttempts) {
    attempt.lockedUntil = now + lockDurationMs;
  }

  attempts.set(key, attempt);
  return getLoginRateLimitState(ip, username);
}

export function clearLoginRateLimit(ip: string, username: string) {
  attempts.delete(keyFor(ip, username));
}
