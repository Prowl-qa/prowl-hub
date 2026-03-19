import { NextResponse } from 'next/server';

import { getHuntDownloadUrl, getPublishedHuntById } from '@/lib/hunts';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const hunt = await getPublishedHuntById(id);

  if (!hunt) {
    return NextResponse.json({ error: 'Hunt not found' }, { status: 404 });
  }

  return NextResponse.json({
    ...hunt,
    downloadUrl: getHuntDownloadUrl(hunt.filePath),
  });
}
