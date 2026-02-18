import { NextResponse } from 'next/server';

const ALLOWED_PARAMS = ['hunt', 'category', 'from', 'to', 'group', 'sort', 'limit'];

export async function GET(request: Request) {
  const statsUrl = process.env.STATS_API_URL;
  const statsKey = process.env.STATS_API_KEY;

  if (!statsUrl || !statsKey) {
    return NextResponse.json(
      { error: 'Stats service not configured' },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const forwarded = new URLSearchParams();

  for (const param of ALLOWED_PARAMS) {
    const value = searchParams.get(param);
    if (value) forwarded.set(param, value);
  }

  const qs = forwarded.toString();
  const target = `${statsUrl}${qs ? `?${qs}` : ''}`;

  try {
    const response = await fetch(target, {
      headers: { Authorization: `Bearer ${statsKey}` },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Stats service error' },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Stats service unavailable' },
      { status: 502 }
    );
  }
}
