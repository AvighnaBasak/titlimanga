import { NextRequest, NextResponse } from 'next/server';
import { getChapterPages } from '@/lib/mangadex';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> },
) {
  const { chapterId } = await params;

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
