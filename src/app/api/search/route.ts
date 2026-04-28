import { NextRequest, NextResponse } from 'next/server';
import { searchMangaMAL } from '@/lib/mal';
import { searchMangaDex } from '@/lib/mangadex';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ mal: [], mangadex: [] });
  }

  try {
    const [malResults, mangadexResults] = await Promise.allSettled([
      searchMangaMAL(q.trim(), 15),
      searchMangaDex(q.trim(), 10),
    ]);

    return NextResponse.json({
      mal: malResults.status === 'fulfilled' ? malResults.value : [],
      mangadex: mangadexResults.status === 'fulfilled' ? mangadexResults.value : [],
    });
  } catch {
    return NextResponse.json({ mal: [], mangadex: [] }, { status: 500 });
  }
}
