import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type LimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

let redis: Redis | null = null;
let disabled = false;

let annaAuthedLimiter: Ratelimit | null = null;
let annaAnonLimiter: Ratelimit | null = null;
let leadLimiter: Ratelimit | null = null;

// Lazily resolve a single shared Redis client. Returns null (and disables all
// rate limiting) when Upstash credentials are absent, so the app still works
// in local/dev without Redis configured.
function getRedis(): Redis | null {
  if (disabled) return null;
  if (redis) return redis;

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

  redis = new Redis({ url, token });
  return redis;
}

export async function checkAnnaRateLimit(params: {
  userId: string | null;
  ip: string;
}): Promise<LimitResult | null> {
  const client = getRedis();
  if (!client) return null;

  if (!annaAuthedLimiter || !annaAnonLimiter) {
    annaAuthedLimiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      analytics: false,
      prefix: 'rl:anna:user',
    });
    annaAnonLimiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: false,
      prefix: 'rl:anna:ip',
    });
  }

  const { userId, ip } = params;
  if (userId) {
    return annaAuthedLimiter.limit(`u:${userId}`);
  }
  return annaAnonLimiter.limit(`ip:${ip}`);
}

// Lead submissions are far rarer than chat messages and unauthenticated by
// design, so this is a tighter per-IP cap purely to blunt spam/abuse.
export async function checkLeadRateLimit(ip: string): Promise<LimitResult | null> {
  const client = getRedis();
  if (!client) return null;

  if (!leadLimiter) {
    leadLimiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(3, '1 m'),
      analytics: false,
      prefix: 'rl:lead:ip',
    });
  }

  return leadLimiter.limit(`ip:${ip}`);
}

export function getClientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return headers.get('x-real-ip') ?? 'unknown';
}
