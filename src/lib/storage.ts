'use client';

import { ReadingHistoryEntry, Bookmark } from './types';

const HISTORY_KEY = 'titli-reading-history';
const BOOKMARKS_KEY = 'titli-bookmarks';
const MAX_HISTORY = 50;

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

export function getReadingHistory(): ReadingHistoryEntry[] {
  return getItem<ReadingHistoryEntry[]>(HISTORY_KEY, []);
}

export function addToReadingHistory(entry: ReadingHistoryEntry): void {
  const history = getReadingHistory();
  const filtered = history.filter(
    (h) => !(h.mangaId === entry.mangaId && h.chapterId === entry.chapterId),
  );
  filtered.unshift({ ...entry, timestamp: Date.now() });
  setItem(HISTORY_KEY, filtered.slice(0, MAX_HISTORY));
}

export function getBookmarks(): Bookmark[] {
  return getItem<Bookmark[]>(BOOKMARKS_KEY, []);
}

export function addBookmark(bookmark: Bookmark): void {
  const bookmarks = getBookmarks();
  if (bookmarks.some((b) => b.mangaId === bookmark.mangaId)) return;
  bookmarks.unshift({ ...bookmark, addedAt: Date.now() });
  setItem(BOOKMARKS_KEY, bookmarks);
}

export function removeBookmark(mangaId: string): void {
  const bookmarks = getBookmarks().filter((b) => b.mangaId !== mangaId);
  setItem(BOOKMARKS_KEY, bookmarks);
}

export function isBookmarked(mangaId: string): boolean {
  return getBookmarks().some((b) => b.mangaId === mangaId);
}
