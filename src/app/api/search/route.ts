import { NextRequest, NextResponse } from 'next/server';
import { searchMangaAniList } from '@/lib/anilist';
import { searchMangaDex } from '@/lib/mangadex';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ anilist: [], mangadex: [] });
  }

  try {
    const [anilistResults, mangadexResults] = await Promise.allSettled([
      searchMangaAniList(q.trim(), 15),
      searchMangaDex(q.trim(), 10),
    ]);

    return NextResponse.json({
      anilist: anilistResults.status === 'fulfilled' ? anilistResults.value : [],
      mangadex: mangadexResults.status === 'fulfilled' ? mangadexResults.value : [],
    });
  } catch {
    return NextResponse.json({ anilist: [], mangadex: [] }, { status: 500 });
  }
}
