import { NextRequest, NextResponse } from 'next/server';
import { getChapterPages } from '@/lib/consumet';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> },
) {
  // The chapterId from the URL may be partial due to slashes in MangaPill IDs.
  // Check if there's a full 'id' query param, otherwise use the route param.
  const fullId = _request.nextUrl.searchParams.get('id');
  const { chapterId: routeId } = await params;
  
  // Ensure the ID is fully decoded. Sometimes Next.js passes %2F from route params.
  let chapterId = fullId || routeId;
  if (chapterId && chapterId.includes('%2F')) {
    chapterId = decodeURIComponent(chapterId);
  }

  if (!chapterId) {
    return NextResponse.json({ error: 'Missing chapterId' }, { status: 400 });
  }

  try {
    const pages = await getChapterPages(chapterId);
    return NextResponse.json(
      { pages },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      },
    );
  } catch {
    return NextResponse.json({ error: 'Failed to fetch chapter pages' }, { status: 500 });
  }
}
