import { NextResponse } from 'next/server';

import { getPublishedHunts } from '@/lib/hunts';

export async function GET() {
  const hunts = await getPublishedHunts();

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    hunts,
  });
}
