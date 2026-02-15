import path from 'node:path';

import { NextResponse } from 'next/server';

import { readPublishedHunt } from '@/lib/hunts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');

  if (!filePath) {
    return new NextResponse('Missing hunt path', { status: 400 });
  }

  const content = await readPublishedHunt(filePath);
  if (!content) {
    return new NextResponse('Hunt not found', { status: 404 });
  }

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'application/x-yaml; charset=utf-8',
      'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
