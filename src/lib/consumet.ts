import { MANGA } from '@consumet/extensions';
import type { Chapter, ChapterPage } from './types';

// ─── MangaPill Provider ─────────────────────────────────────────────────────
// MangaPill provides clean, sequential chapters with direct image URLs.
// No DMCA issues, no decimal hell, no missing pages.

const mangaPill = new MANGA.MangaPill();

// ─── MALSync Bridge ─────────────────────────────────────────────────────────
// Maps MAL IDs to provider-specific IDs via MALSync API.

const MALSYNC_API = 'https://api.malsync.moe';

interface MALSyncSite {
  identifier: string;
  title: string;
  url: string;
  image?: string;
  malId?: number;
}

interface MALSyncResponse {
  id: number;
  type: string;
  title: string;
  url: string;
  image: string;
  Sites: Record<string, Record<string, MALSyncSite>>;
}

async function fetchMALSync(malId: number): Promise<MALSyncResponse | null> {
  try {
    const res = await fetch(`${MALSYNC_API}/mal/manga/${malId}`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── Search MangaPill ────────────────────────────────────────────────────────

export interface MangaPillSearchResult {
  id: string;
  title: string;
  image: string;
}

export async function searchMangaPill(
  query: string,
  limit = 15,
): Promise<MangaPillSearchResult[]> {
  try {
    const results = await mangaPill.search(query);
    return (results.results || []).slice(0, limit).map((r) => ({
      id: r.id as string,
      title: r.title as string,
      image: (r.image as string) || '',
    }));
  } catch {
    return [];
  }
}

// ─── Find MangaPill match via MALSync ────────────────────────────────────────
// Given a MAL ID, look up MangaPill ID via MALSync's mapping data.
// Falls back to searching MangaPill by title if MALSync doesn't have a mapping.

export async function findMangaPillId(
  malId: number,
  title: string,
): Promise<string | null> {
  // Try MALSync first
  const syncData = await fetchMALSync(malId);

  if (syncData?.Sites) {
    // MangaPill isn't directly in MALSync, but we can use the manga slug
    // from other providers to search. Try the title directly.
  }

  // Search MangaPill by title
  try {
    const results = await mangaPill.search(title);
    if (results.results && results.results.length > 0) {
      // Try exact match first
      const titleLower = title.toLowerCase().trim();
      const exactMatch = results.results.find(
        (r) => (r.title as string).toLowerCase().trim() === titleLower,
      );
      if (exactMatch) return exactMatch.id as string;

      // Try partial match
      const partialMatch = results.results.find((r) => {
        const rTitle = (r.title as string).toLowerCase().trim();
        return rTitle.includes(titleLower) || titleLower.includes(rTitle);
      });
      if (partialMatch) return partialMatch.id as string;

      // Fallback to first result
      return results.results[0].id as string;
    }
  } catch {
    // Search failed
  }

  return null;
}

// ─── Fetch Manga Info (chapters) ─────────────────────────────────────────────

export async function getMangaPillChapters(
  mangaPillId: string,
): Promise<{ chapters: Chapter[]; total: number }> {
  try {
    const info = await mangaPill.fetchMangaInfo(mangaPillId);
    const rawChapters = info.chapters || [];

    // MangaPill returns chapters in descending order, reverse to ascending
    const chapters: Chapter[] = rawChapters
      .map((ch) => ({
        id: ch.id as string,
        title: (ch.title as string) || undefined,
        chapter: (ch.chapter as string) || '0',
        volume: undefined,
        pages: 0, // Will be fetched when reading
        translatedLanguage: 'en',
        publishAt: '',
        scanlationGroup: undefined,
        externalUrl: undefined,
      }))
      .reverse(); // Ascending order

    return { chapters, total: chapters.length };
  } catch {
    return { chapters: [], total: 0 };
  }
}

// ─── Fetch Chapter Pages ─────────────────────────────────────────────────────

export async function getChapterPages(
  chapterId: string,
): Promise<ChapterPage[]> {
  try {
    const pages = await mangaPill.fetchChapterPages(chapterId);
    return pages.map((p) => ({
      url: p.img,
      index: p.page - 1, // Convert 1-indexed to 0-indexed
    }));
  } catch (error) {
    console.error(`Failed to fetch chapter pages for ${chapterId}:`, error);
    return [];
  }
}

// ─── Chapter Navigation ──────────────────────────────────────────────────────
// Given a chapter ID and the manga's MangaPill ID, find prev/next chapters.

export async function getChapterNavigation(
  chapterId: string,
  mangaPillId: string,
): Promise<{
  mangaPillId: string;
  chapterNumber: string;
  prevChapter?: string;
  nextChapter?: string;
}> {
  const { chapters } = await getMangaPillChapters(mangaPillId);

  const currentIndex = chapters.findIndex((ch) => ch.id === chapterId);

  // Extract chapter number from the chapter object or ID
  let chapterNumber = '?';
  if (currentIndex >= 0) {
    chapterNumber = chapters[currentIndex].chapter;
  } else {
    // Try to parse from ID (e.g., "2-10001000/one-piece-chapter-1")
    const match = chapterId.match(/chapter-(\d+(?:\.\d+)?)/);
    if (match) chapterNumber = match[1];
  }

  let prevChapter: string | undefined;
  let nextChapter: string | undefined;

  if (currentIndex > 0) {
    prevChapter = chapters[currentIndex - 1].id;
  }
  if (currentIndex >= 0 && currentIndex < chapters.length - 1) {
    nextChapter = chapters[currentIndex + 1].id;
  }

  // If chapter wasn't found by exact ID match, try by number
  if (currentIndex === -1 && chapters.length > 0) {
    const currentNum = parseFloat(chapterNumber);
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
    mangaPillId,
    chapterNumber,
    prevChapter,
    nextChapter,
  };
}

// ─── Latest Updated Manga from MangaPill ─────────────────────────────────────

export async function getLatestMangaPill(
  limit = 20,
): Promise<MangaPillSearchResult[]> {
  // MangaPill doesn't have a dedicated "latest updates" endpoint in consumet,
  // so we search for popular/trending terms as a workaround.
  // The home page will primarily use MAL trending + popular.
  try {
    const results = await mangaPill.search('');
    return (results.results || []).slice(0, limit).map((r) => ({
      id: r.id as string,
      title: r.title as string,
      image: (r.image as string) || '',
    }));
  } catch {
    return [];
  }
}
