import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { checkRateLimit } from '@/lib/rate-limit';

const RATE_LIMIT_RULES: Array<{
  prefix: string;
  limit: { max: number; windowMs: number };
}> = [
  { prefix: '/api/hunts/search', limit: { max: 30, windowMs: 60_000 } },
  { prefix: '/api/hunts/file', limit: { max: 30, windowMs: 60_000 } },
  { prefix: '/api/hunts', limit: { max: 60, windowMs: 60_000 } },
];

const DEFAULT_LIMIT = { max: 60, windowMs: 60_000 };

function getClientIp(request: NextRequest): string | null {
  const trustedRequest = request as NextRequest & { ip?: string | null };
  if (trustedRequest.ip) {
    return trustedRequest.ip;
  }

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) {
    return realIp;
  }

  if (request.nextUrl.hostname === 'localhost' || request.nextUrl.hostname === '127.0.0.1') {
    return '127.0.0.1';
  }

  console.warn('[rate-limit] Missing trusted client IP', {
    method: request.method,
    pathname: request.nextUrl.pathname,
    host: request.nextUrl.host,
    userAgent: request.headers.get('user-agent'),
  });

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const ip = getClientIp(request);
  if (!ip) {
    return NextResponse.json(
      { error: 'Unable to determine client IP for rate limiting' },
      { status: 503 }
    );
  }

  const matchedRule = RATE_LIMIT_RULES.find((rule) => pathname.startsWith(rule.prefix));
  const config = matchedRule?.limit ?? DEFAULT_LIMIT;
  const routeKey = matchedRule?.prefix ?? pathname;

  const key = `${ip}:${routeKey}`;
  const result = await checkRateLimit(key, config.max, config.windowMs);

  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.retryAfterSeconds),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
