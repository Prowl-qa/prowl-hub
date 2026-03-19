import { NextResponse } from 'next/server';

import { getHuntDownloadUrl, getPublishedHuntSummaries } from '@/lib/hunts';

function parseIntegerParam(rawValue: string | null, fallback: number) {
  if (rawValue === null) {
    return fallback;
  }

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.trunc(parsed);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const category = searchParams.get('category') || '';
  const tagsParam = searchParams.get('tags') || '';
  const rawLimit = searchParams.get('limit');
  const rawOffset = searchParams.get('offset');
  const limit = Math.min(Math.max(1, parseIntegerParam(rawLimit, 20)), 100);
  const offset = Math.max(0, parseIntegerParam(rawOffset, 0));

  const requestedTags = tagsParam
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const allHunts = await getPublishedHuntSummaries();

  const filtered = allHunts.filter((hunt) => {
    if (category && hunt.category !== category) return false;

    if (requestedTags.length > 0) {
      const huntTags = hunt.tags.map((t) => t.toLowerCase());
      if (!requestedTags.every((t) => huntTags.includes(t))) return false;
    }

    if (q) {
      const searchable = `${hunt.title} ${hunt.description} ${hunt.categoryLabel} ${hunt.tags.join(' ')}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    return true;
  });

  const results = filtered.slice(offset, offset + limit).map((hunt) => ({
    ...hunt,
    downloadUrl: getHuntDownloadUrl(hunt.filePath),
  }));

  return NextResponse.json({
    query: q,
    total: filtered.length,
    limit,
    offset,
    results,
  });
}
