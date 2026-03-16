import { NextResponse } from 'next/server';

import { getPublishedHunts } from '@/lib/hunts';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const hunts = await getPublishedHunts();
  const hunt = hunts.find((h) => h.id === id);

  if (!hunt) {
    return NextResponse.json({ error: 'Hunt not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: hunt.id,
    name: hunt.name,
    title: hunt.title,
    description: hunt.description,
    category: hunt.category,
    categoryLabel: hunt.categoryLabel,
    tags: hunt.tags,
    stepCount: hunt.stepCount,
    assertionCount: hunt.assertionCount,
    updatedAt: hunt.updatedAt,
    isVerified: hunt.isVerified,
    content: hunt.content,
    downloadUrl: `/api/hunts/file?path=${encodeURIComponent(hunt.filePath)}`,
  });
}
