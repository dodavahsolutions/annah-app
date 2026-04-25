import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type LimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

let authedLimiter: Ratelimit | null = null;
let anonLimiter: Ratelimit | null = null;
let disabled = false;

function getLimiters() {
  if (disabled) return null;
  if (authedLimiter && anonLimiter) return { authedLimiter, anonLimiter };

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    disabled = true;
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN not set — rate limiting DISABLED'
      );
    }
    return null;
  }

  const redis = new Redis({ url, token });
  authedLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: false,
    prefix: 'rl:anna:user',
  });
  anonLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: false,
    prefix: 'rl:anna:ip',
  });
  return { authedLimiter, anonLimiter };
}

export async function checkAnnaRateLimit(params: {
  userId: string | null;
  ip: string;
}): Promise<LimitResult | null> {
  const limiters = getLimiters();
  if (!limiters) return null;

  const { userId, ip } = params;
  if (userId) {
    return limiters.authedLimiter.limit(`u:${userId}`);
  }
  return limiters.anonLimiter.limit(`ip:${ip}`);
}

export function getClientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return headers.get('x-real-ip') ?? 'unknown';
}
