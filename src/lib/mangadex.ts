import { Chapter, ChapterPage, Manga, MangaDexSearchResult } from './types';

const MANGADEX_API = 'https://api.mangadex.org';

async function fetchMangaDex(
  path: string,
  params: Record<string, string | string[]> = {},
  cache: { revalidate: number } = { revalidate: 300 },
): Promise<unknown> {
  const url = new URL(`${MANGADEX_API}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) {
      for (const val of v) url.searchParams.append(k, val);
    } else {
      url.searchParams.append(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: cache.revalidate },
  });

  if (!res.ok) throw new Error(`MangaDex API error: ${res.status}`);
  return res.json();
}

function extractRelationship(
  relationships: unknown[],
  type: string,
): Record<string, unknown> | null {
  if (!Array.isArray(relationships)) return null;
  const rel = relationships.find((r) => (r as Record<string, unknown>).type === type);
  return (rel as Record<string, unknown>) || null;
}

function getCoverUrl(mangaId: string, coverFileName: string | undefined): string {
  if (!coverFileName) return '';
  return `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}.512.jpg`;
}

function getMangaTitleEn(attrs: Record<string, unknown>): string {
  const titles = attrs.title as Record<string, string>;
  const altTitles = (attrs.altTitles as Record<string, string>[]) || [];
  if (titles.en) return titles.en;
  const enAlt = altTitles.find((a) => a.en);
  if (enAlt) return enAlt.en;
  return titles['ja-ro'] || Object.values(titles)[0] || 'Unknown';
}

function hasDoujinshiTag(attrs: Record<string, unknown>): boolean {
  const tags = (attrs.tags as Record<string, unknown>[]) || [];
  return tags.some((t) => {
    const name = ((t.attributes as Record<string, unknown>)?.name as Record<string, string>)?.en;
    return name?.toLowerCase() === 'doujinshi';
  });
}

// --- Search ---

export async function searchMangaDex(
  title: string,
  limit = 10,
): Promise<MangaDexSearchResult[]> {
  const data = (await fetchMangaDex('/manga', {
    title,
    limit: String(limit),
    'includes[]': 'cover_art',
    'contentRating[]': ['safe', 'suggestive', 'erotica'],
    'order[relevance]': 'desc',
  })) as { data: Record<string, unknown>[] };

  return data.data.map((manga) => {
    const attrs = manga.attributes as Record<string, unknown>;
    const coverRel = extractRelationship(manga.relationships as unknown[], 'cover_art');
    const coverFileName = coverRel
      ? ((coverRel.attributes as Record<string, unknown>)?.fileName as string)
      : undefined;

    return {
      id: manga.id as string,
      title: getMangaTitleEn(attrs),
      coverFileName,
    };
  });
}

export async function findMangaDexMatch(
  title: string,
  japaneseTitle?: string,
): Promise<string | null> {
  const data = (await fetchMangaDex('/manga', {
    title,
    limit: '15',
    'includes[]': 'cover_art',
    'contentRating[]': ['safe', 'suggestive', 'erotica'],
    'order[relevance]': 'desc',
  })) as { data: Record<string, unknown>[] };

  if (!data.data || data.data.length === 0) return null;

  const titleLower = title.toLowerCase().trim();

  type ScoredResult = { id: string; score: number };
  const scored: ScoredResult[] = data.data.map((manga) => {
    const attrs = manga.attributes as Record<string, unknown>;
    const mdTitle = getMangaTitleEn(attrs).toLowerCase().trim();
    const titles = attrs.title as Record<string, string>;
    const allTitles = [
      titles.en,
      titles['ja-ro'],
      ...Object.values(titles),
    ]
      .filter(Boolean)
      .map((t) => t.toLowerCase().trim());

    let score = 0;

    if (mdTitle === titleLower || allTitles.includes(titleLower)) {
      score += 100;
    } else if (mdTitle.includes(titleLower) || titleLower.includes(mdTitle)) {
      score += 50;
    }

    if (japaneseTitle && titles.ja === japaneseTitle) {
      score += 80;
    }

    if (hasDoujinshiTag(attrs)) {
      score -= 200;
    }

    const status = attrs.status as string;
    if (status === 'completed' || status === 'ongoing') {
      score += 10;
    }

    return { id: manga.id as string, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.score > 0 ? scored[0].id : (data.data[0]?.id as string) || null;
}

// --- Manga details ---

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
    ? ((coverRel.attributes as Record<string, unknown>)?.fileName as string)
    : undefined;

  return {
    id: mangaId,
    title: getMangaTitleEn(attrs),
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

// --- Latest updates ---

export async function getLatestUpdates(limit = 20): Promise<Manga[]> {
  const data = (await fetchMangaDex('/manga', {
    limit: String(limit),
    'includes[]': 'cover_art',
    'contentRating[]': ['safe', 'suggestive'],
    'order[latestUploadedChapter]': 'desc',
    'availableTranslatedLanguage[]': 'en',
    hasAvailableChapters: 'true',
  })) as { data: Record<string, unknown>[] };

  return data.data.map((manga) => {
    const attrs = manga.attributes as Record<string, unknown>;
    const coverRel = extractRelationship(manga.relationships as unknown[], 'cover_art');
    const coverFileName = coverRel
      ? ((coverRel.attributes as Record<string, unknown>)?.fileName as string)
      : undefined;

    return {
      id: manga.id as string,
      title: getMangaTitleEn(attrs),
      coverImage: getCoverUrl(manga.id as string, coverFileName),
      source: 'mangadex' as const,
      status: (attrs.status as string) || undefined,
      description: '',
    };
  });
}

// --- Chapters (with full pagination + dedup) ---

async function fetchAllChapters(
  mangaId: string,
  lang: string,
): Promise<Chapter[]> {
  const allChapters: Chapter[] = [];
  let offset = 0;
  const limit = 500;
  let total = Infinity;

  while (offset < total) {
    const data = (await fetchMangaDex(`/manga/${mangaId}/feed`, {
      'translatedLanguage[]': lang,
      'order[chapter]': 'asc',
      limit: String(limit),
      offset: String(offset),
      'includes[]': 'scanlation_group',
      'contentRating[]': ['safe', 'suggestive', 'erotica'],
    })) as { data: Record<string, unknown>[]; total: number };

    total = data.total;

    for (const ch of data.data) {
      const attrs = ch.attributes as Record<string, unknown>;
      const groupRel = extractRelationship(ch.relationships as unknown[], 'scanlation_group');
      const groupName = groupRel
        ? ((groupRel.attributes as Record<string, unknown>)?.name as string)
        : undefined;

      allChapters.push({
        id: ch.id as string,
        title: (attrs.title as string) || undefined,
        chapter: (attrs.chapter as string) || '0',
        volume: (attrs.volume as string) || undefined,
        pages: (attrs.pages as number) || 0,
        translatedLanguage: (attrs.translatedLanguage as string) || lang,
        publishAt: (attrs.publishAt as string) || '',
        scanlationGroup: groupName,
      });
    }

    offset += limit;
    if (data.data.length === 0) break;
  }

  return allChapters;
}

function deduplicateChapters(chapters: Chapter[]): Chapter[] {
  const grouped = new Map<string, Chapter[]>();

  for (const ch of chapters) {
    const key = ch.chapter;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(ch);
  }

  const deduped: Chapter[] = [];
  for (const [, group] of grouped) {
    group.sort((a, b) => {
      if (b.pages !== a.pages) return b.pages - a.pages;
      return new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime();
    });
    deduped.push(group[0]);
  }

  deduped.sort((a, b) => parseFloat(a.chapter) - parseFloat(b.chapter));
  return deduped;
}

export async function getMangaChapters(
  mangaId: string,
  lang = 'en',
): Promise<{ chapters: Chapter[]; total: number }> {
  const all = await fetchAllChapters(mangaId, lang);
  const chapters = deduplicateChapters(all);
  return { chapters, total: chapters.length };
}

// --- Chapter pages ---

export async function getChapterPages(chapterId: string): Promise<ChapterPage[]> {
  const data = (await fetchMangaDex(
    `/at-home/server/${chapterId}`,
    {},
    { revalidate: 60 },
  )) as {
    baseUrl: string;
    chapter: { hash: string; data: string[]; dataSaver: string[] };
  };

  return data.chapter.data.map((filename, index) => ({
    url: `${data.baseUrl}/data/${data.chapter.hash}/${filename}`,
    index,
  }));
}

// --- Chapter navigation ---

export async function getChapterInfo(chapterId: string): Promise<{
  mangaId: string;
  mangaTitle: string;
  chapterNumber: string;
}> {
  const data = (await fetchMangaDex(`/chapter/${chapterId}`, {
    'includes[]': 'manga',
  })) as { data: Record<string, unknown> };

  const attrs = data.data.attributes as Record<string, unknown>;
  const mangaRel = extractRelationship(data.data.relationships as unknown[], 'manga');
  const mangaId = (mangaRel?.id as string) || '';
  const mangaAttrs = mangaRel?.attributes as Record<string, unknown> | undefined;

  let mangaTitle = 'Unknown';
  if (mangaAttrs?.title) {
    const titles = mangaAttrs.title as Record<string, string>;
    mangaTitle =
      titles.en || titles['ja-ro'] || Object.values(titles)[0] || 'Unknown';
  }

  return {
    mangaId,
    mangaTitle,
    chapterNumber: (attrs.chapter as string) || '0',
  };
}

export async function getChapterNavigation(
  chapterId: string,
  mangaIdHint?: string,
): Promise<{
  mangaId: string;
  mangaTitle: string;
  chapterNumber: string;
  prevChapter?: string;
  nextChapter?: string;
}> {
  const info = await getChapterInfo(chapterId);
  const mangaId = mangaIdHint || info.mangaId;

  const { chapters } = await getMangaChapters(mangaId);

  const currentIndex = chapters.findIndex((ch) => ch.id === chapterId);

  let prevChapter: string | undefined;
  let nextChapter: string | undefined;

  if (currentIndex > 0) {
    prevChapter = chapters[currentIndex - 1].id;
  }
  if (currentIndex >= 0 && currentIndex < chapters.length - 1) {
    nextChapter = chapters[currentIndex + 1].id;
  }

  if (currentIndex === -1 && chapters.length > 0) {
    const currentNum = parseFloat(info.chapterNumber);
    for (let i = 0; i < chapters.length; i++) {
      const num = parseFloat(chapters[i].chapter);
      if (num > currentNum) {
        nextChapter = chapters[i].id;
        if (i > 0) prevChapter = chapters[i - 1].id;
        break;
      }
    }
  }

  return {
    mangaId,
    mangaTitle: info.mangaTitle,
    chapterNumber: info.chapterNumber,
    prevChapter,
    nextChapter,
  };
}
