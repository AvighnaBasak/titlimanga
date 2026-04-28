export interface Manga {
  id: string;
  mangadexId?: string;
  title: string;
  titleJapanese?: string;
  description?: string;
  coverImage: string;
  bannerImage?: string;
  status?: string;
  genres?: string[];
  score?: number;
  chapters?: number;
  year?: number;
  source: 'mal' | 'mangadex' | 'anilist';
}

export interface Chapter {
  id: string;
  title?: string;
  chapter: string;
  volume?: string;
  pages: number;
  translatedLanguage: string;
  publishAt: string;
  scanlationGroup?: string;
}

export interface ChapterPage {
  url: string;
  index: number;
  width?: number;
  height?: number;
}

export interface ReadingHistoryEntry {
  mangaId: string;
  mangaTitle: string;
  chapterId: string;
  chapterNumber: string;
  coverImage: string;
  timestamp: number;
  source: 'mal' | 'mangadex' | 'anilist';
}

export interface Bookmark {
  mangaId: string;
  title: string;
  coverImage: string;
  addedAt: number;
  source: 'mal' | 'mangadex' | 'anilist';
}

export interface MangaDexSearchResult {
  id: string;
  title: string;
  coverFileName?: string;
}
