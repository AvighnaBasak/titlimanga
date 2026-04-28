import { Chapter, ChapterPage, Manga, MangaDexSearchResult } from './types';

const MANGADEX_API = 'https://api.mangadex.org';

async function fetchMangaDex(path: string, params: Record<string, string> = {}): Promise<unknown> {
  const url = new URL(`${MANGADEX_API}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));

  const res = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`MangaDex API error: ${res.status}`);
  return res.json();
}

function extractRelationship(relationships: unknown[], type: string): Record<string, unknown> | null {
  if (!Array.isArray(relationships)) return null;
  const rel = relationships.find((r) => (r as Record<string, unknown>).type === type);
  return (rel as Record<string, unknown>) || null;
}

function getCoverUrl(mangaId: string, coverFileName: string | undefined, size: 256 | 512 = 512): string {
  if (!coverFileName) return '';
  return `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}.${size}.jpg`;
}

export async function searchMangaDex(title: string, limit = 10): Promise<MangaDexSearchResult[]> {
  const data = (await fetchMangaDex('/manga', {
    title,
    limit: String(limit),
    'includes[]': 'cover_art',
    'contentRating[]': 'safe',
    'order[relevance]': 'desc',
  })) as { data: Record<string, unknown>[] };

  return data.data.map((manga) => {
    const attrs = manga.attributes as Record<string, unknown>;
    const titles = attrs.title as Record<string, string>;
    const coverRel = extractRelationship(manga.relationships as unknown[], 'cover_art');
    const coverFileName = coverRel
      ? (coverRel.attributes as Record<string, unknown>)?.fileName as string
      : undefined;

    return {
      id: manga.id as string,
      title: titles.en || titles['ja-ro'] || Object.values(titles)[0] || 'Unknown',
      coverFileName,
    };
  });
}

export async function getMangaDexManga(mangaId: string): Promise<Manga> {
  const data = (await fetchMangaDex(`/manga/${mangaId}`, {
    'includes[]': 'cover_art',
  })) as { data: Record<string, unknown> };

  const manga = data.data;
  const attrs = manga.attributes as Record<string, unknown>;
  const titles = attrs.title as Record<string, string>;
  const desc = attrs.description as Record<string, string>;
  const tags = (attrs.tags as Record<string, unknown>[]) || [];
  const coverRel = extractRelationship(manga.relationships as unknown[], 'cover_art');
  const coverFileName = coverRel
    ? (coverRel.attributes as Record<string, unknown>)?.fileName as string
    : undefined;

  return {
    id: mangaId,
    title: titles.en || titles['ja-ro'] || Object.values(titles)[0] || 'Unknown',
    titleJapanese: titles.ja || titles['ja-ro'] || undefined,
    description: desc?.en || Object.values(desc || {})[0] || '',
    coverImage: getCoverUrl(mangaId, coverFileName),
    status: (attrs.status as string) || undefined,
    genres: tags
      .map((t) => ((t.attributes as Record<string, unknown>)?.name as Record<string, string>)?.en)
      .filter(Boolean),
    year: (attrs.year as number) || undefined,
    source: 'mangadex',
  };
}

export async function getLatestUpdates(limit = 20): Promise<Manga[]> {
  const data = (await fetchMangaDex('/manga', {
    limit: String(limit),
    'includes[]': 'cover_art',
    'contentRating[]': 'safe',
    'order[latestUploadedChapter]': 'desc',
    'availableTranslatedLanguage[]': 'en',
    'hasAvailableChapters': 'true',
  })) as { data: Record<string, unknown>[] };

  return data.data.map((manga) => {
    const attrs = manga.attributes as Record<string, unknown>;
    const titles = attrs.title as Record<string, string>;
    const coverRel = extractRelationship(manga.relationships as unknown[], 'cover_art');
    const coverFileName = coverRel
      ? (coverRel.attributes as Record<string, unknown>)?.fileName as string
      : undefined;

    return {
      id: manga.id as string,
      title: titles.en || titles['ja-ro'] || Object.values(titles)[0] || 'Unknown',
      coverImage: getCoverUrl(manga.id as string, coverFileName),
      source: 'mangadex' as const,
      status: (attrs.status as string) || undefined,
      description: '',
    };
  });
}

export async function getMangaChapters(
  mangaId: string,
  lang = 'en',
  offset = 0,
  limit = 100,
): Promise<{ chapters: Chapter[]; total: number }> {
  const data = (await fetchMangaDex(`/manga/${mangaId}/feed`, {
    'translatedLanguage[]': lang,
    'order[chapter]': 'asc',
    limit: String(limit),
    offset: String(offset),
    'includes[]': 'scanlation_group',
  })) as { data: Record<string, unknown>[]; total: number };

  const chapters: Chapter[] = data.data.map((ch) => {
    const attrs = ch.attributes as Record<string, unknown>;
    const groupRel = extractRelationship(ch.relationships as unknown[], 'scanlation_group');
    const groupName = groupRel
      ? ((groupRel.attributes as Record<string, unknown>)?.name as string)
      : undefined;

    return {
      id: ch.id as string,
      title: (attrs.title as string) || undefined,
      chapter: (attrs.chapter as string) || '0',
      volume: (attrs.volume as string) || undefined,
      pages: (attrs.pages as number) || 0,
      translatedLanguage: (attrs.translatedLanguage as string) || lang,
      publishAt: (attrs.publishAt as string) || '',
      scanlationGroup: groupName,
    };
  });

  return { chapters, total: data.total };
}

export async function getChapterPages(chapterId: string): Promise<ChapterPage[]> {
  const data = (await fetchMangaDex(`/at-home/server/${chapterId}`, {})) as {
    baseUrl: string;
    chapter: { hash: string; data: string[]; dataSaver: string[] };
  };

  return data.chapter.data.map((filename, index) => ({
    url: `${data.baseUrl}/data/${data.chapter.hash}/${filename}`,
    index,
  }));
}

export async function getChapterNavigation(
  chapterId: string,
): Promise<{ mangaId: string; mangaTitle: string; prevChapter?: string; nextChapter?: string }> {
  const chapterData = (await fetchMangaDex(`/chapter/${chapterId}`, {
    'includes[]': 'manga',
  })) as { data: Record<string, unknown> };

  const attrs = chapterData.data.attributes as Record<string, unknown>;
  const currentChapter = (attrs.chapter as string) || '0';
  const mangaRel = extractRelationship(chapterData.data.relationships as unknown[], 'manga');
  const mangaId = (mangaRel?.id as string) || '';
  const mangaAttrs = mangaRel?.attributes as Record<string, unknown> | undefined;
  const mangaTitles = mangaAttrs?.title as Record<string, string> | undefined;
  const mangaTitle = mangaTitles?.en || mangaTitles?.['ja-ro'] || Object.values(mangaTitles || {})[0] || 'Unknown';

  const chapNum = parseFloat(currentChapter);

  const prevData = (await fetchMangaDex(`/manga/${mangaId}/feed`, {
    'translatedLanguage[]': 'en',
    'order[chapter]': 'desc',
    limit: '1',
    'chapter': String(chapNum - 1 >= 0 ? chapNum - 1 : 0),
  }).catch(() => null)) as { data: Record<string, unknown>[] } | null;

  const nextData = (await fetchMangaDex(`/manga/${mangaId}/feed`, {
    'translatedLanguage[]': 'en',
    'order[chapter]': 'asc',
    limit: '1',
    offset: '0',
    'chapter': String(chapNum + 1),
  }).catch(() => null)) as { data: Record<string, unknown>[] } | null;

  return {
    mangaId,
    mangaTitle,
    prevChapter: prevData?.data?.[0]?.id as string | undefined,
    nextChapter: nextData?.data?.[0]?.id as string | undefined,
  };
}
