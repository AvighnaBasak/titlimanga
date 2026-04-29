import { NextRequest, NextResponse } from 'next/server';

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const h = parsed.hostname;
    return (
      // MangaPill CDN
      h === 'cdn.readdetectiveconan.com' ||
      h.endsWith('.readdetectiveconan.com') ||
      // MAL CDN
      h === 'cdn.myanimelist.net' ||
      // Anilist CDN
      h === 's4.anilist.co' ||
      h === 'img.anili.st' ||
      // MangaPill direct
      h === 'mangapill.com' ||
      h.endsWith('.mangapill.com') ||
      // MangaNato CDN (fallback)
      h.endsWith('.2xstorage.com')
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  if (!isAllowedUrl(url)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
  }

  try {
    const parsed = new URL(url);

    let referer = parsed.origin;
    if (parsed.hostname.includes('readdetectiveconan.com') || parsed.hostname.includes('mangapill')) {
      referer = 'https://mangapill.com/';
    }

    const response = await fetch(url, {
      headers: {
        Referer: referer,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Upstream fetch failed' }, { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('Content-Type') || 'image/jpeg';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}
