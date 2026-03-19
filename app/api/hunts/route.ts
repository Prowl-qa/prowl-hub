import { NextResponse } from 'next/server';

import { getHuntDownloadUrl, getPublishedHunts } from '@/lib/hunts';

export async function GET() {
  const hunts = await getPublishedHunts();

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    hunts: hunts.map((hunt) => ({
      ...hunt,
      downloadUrl: getHuntDownloadUrl(hunt.filePath),
    })),
  });
}
