import { NextRequest, NextResponse } from 'next/server';
import { searchMangaMAL } from '@/lib/mal';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ mal: [] });
  }

  try {
    const malResults = await searchMangaMAL(q.trim(), 20);

    return NextResponse.json({
      mal: malResults,
    });
  } catch {
    return NextResponse.json({ mal: [] }, { status: 500 });
  }
}
