interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface RateLimitStore {
  check(key: string, maxRequests: number, windowMs: number): Promise<RateLimitResult>;
}

class MemoryRateLimitStore implements RateLimitStore {
  private readonly store = new Map<string, RateLimitEntry>();
  private lastCleanup = Date.now();
  private static readonly CLEANUP_INTERVAL_MS = 60_000;

  private cleanup() {
    const now = Date.now();
    if (now - this.lastCleanup < MemoryRateLimitStore.CLEANUP_INTERVAL_MS) return;
    this.lastCleanup = now;

    for (const [key, entry] of this.store) {
      if (entry.resetAt <= now) {
        this.store.delete(key);
      }
    }
  }

  async check(
    key: string,
    maxRequests: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    this.cleanup();

    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetAt <= now) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1, retryAfterSeconds: 0 };
    }

    if (entry.count < maxRequests) {
      entry.count++;
      return { allowed: true, remaining: maxRequests - entry.count, retryAfterSeconds: 0 };
    }

    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }
}

class UpstashRateLimitStore implements RateLimitStore {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string
  ) {}

  private async command<T>(...parts: string[]): Promise<T> {
    const encodedPath = parts.map((part) => encodeURIComponent(part)).join('/');
    const response = await fetch(`${this.baseUrl}/${encodedPath}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Upstash rate-limit request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { result?: T };
    return payload.result as T;
  }

  async check(
    key: string,
    maxRequests: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const count = Number(await this.command<number>('INCR', key));

    let ttlMs = windowMs;
    if (count === 1) {
      await this.command<number>('PEXPIRE', key, String(windowMs));
    } else {
      ttlMs = Number(await this.command<number>('PTTL', key));
      if (ttlMs < 0) {
        await this.command<number>('PEXPIRE', key, String(windowMs));
        ttlMs = windowMs;
      }
    }

    if (count <= maxRequests) {
      return { allowed: true, remaining: maxRequests - count, retryAfterSeconds: 0 };
    }

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(ttlMs / 1000)),
    };
  }
}

const memoryStore = new MemoryRateLimitStore();
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let activeStore: RateLimitStore =
  upstashUrl && upstashToken
    ? new UpstashRateLimitStore(upstashUrl.replace(/\/$/, ''), upstashToken)
    : memoryStore;

let warnedAboutMemoryStore = false;

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (activeStore === memoryStore && !warnedAboutMemoryStore) {
    warnedAboutMemoryStore = true;
    console.warn(
      '[rate-limit] Using in-memory store; limits are best-effort per runtime instance. Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for shared enforcement.'
    );
  }

  try {
    return await activeStore.check(key, maxRequests, windowMs);
  } catch (error) {
    if (activeStore !== memoryStore) {
      console.warn('[rate-limit] Shared store unavailable, falling back to in-memory limits', error);
      activeStore = memoryStore;
      return memoryStore.check(key, maxRequests, windowMs);
    }

    throw error;
  }
}
