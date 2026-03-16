import { NextResponse } from 'next/server';

import { getPublishedHuntSummaries } from '@/lib/hunts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const category = searchParams.get('category') || '';
  const tagsParam = searchParams.get('tags') || '';
  const limit = Math.min(Math.max(1, Number(searchParams.get('limit')) || 20), 100);
  const offset = Math.max(0, Number(searchParams.get('offset')) || 0);

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
    id: hunt.id,
    name: hunt.name,
    description: hunt.description,
    category: hunt.category,
    tags: hunt.tags,
    stepCount: hunt.stepCount,
    assertionCount: hunt.assertionCount,
    downloadUrl: `/api/hunts/file?path=${encodeURIComponent(hunt.filePath)}`,
  }));

  return NextResponse.json({
    query: q || undefined,
    total: filtered.length,
    limit,
    offset,
    results,
  });
}
