import { Manga } from './types';

const ANILIST_API = 'https://graphql.anilist.co';

const MANGA_FIELDS = `
  id
  title {
    english
    romaji
    native
  }
  description(asHtml: false)
  coverImage {
    extraLarge
    large
  }
  bannerImage
  status
  genres
  averageScore
  chapters
  startDate {
    year
  }
  countryOfOrigin
`;

async function queryAniList(query: string, variables: Record<string, unknown> = {}): Promise<unknown> {
  const res = await fetch(ANILIST_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`AniList API error: ${res.status}`);
  const data = await res.json();
  if (data.errors) throw new Error(data.errors[0]?.message || 'AniList error');
  return data.data;
}

function mapAniListManga(media: Record<string, unknown>): Manga {
  const title = media.title as Record<string, string>;
  const coverImage = media.coverImage as Record<string, string>;
  const startDate = media.startDate as Record<string, number> | null;

  return {
    id: String(media.id),
    title: title.english || title.romaji || 'Unknown',
    titleJapanese: title.native || undefined,
    description: (media.description as string) || '',
    coverImage: coverImage.extraLarge || coverImage.large || '',
    bannerImage: (media.bannerImage as string) || undefined,
    status: (media.status as string) || undefined,
    genres: (media.genres as string[]) || [],
    score: (media.averageScore as number) || undefined,
    chapters: (media.chapters as number) || undefined,
    year: startDate?.year || undefined,
    source: 'anilist',
  };
}

export async function getTrendingManga(page = 1, perPage = 20): Promise<Manga[]> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, sort: TRENDING_DESC, isAdult: false) {
          ${MANGA_FIELDS}
        }
      }
    }
  `;
  const data = (await queryAniList(query, { page, perPage })) as {
    Page: { media: Record<string, unknown>[] };
  };
  return data.Page.media.map(mapAniListManga);
}

export async function getPopularManga(page = 1, perPage = 20): Promise<Manga[]> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, sort: POPULARITY_DESC, isAdult: false) {
          ${MANGA_FIELDS}
        }
      }
    }
  `;
  const data = (await queryAniList(query, { page, perPage })) as {
    Page: { media: Record<string, unknown>[] };
  };
  return data.Page.media.map(mapAniListManga);
}

export async function getPopularThisSeason(perPage = 20): Promise<Manga[]> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const season = month <= 3 ? 'WINTER' : month <= 6 ? 'SPRING' : month <= 9 ? 'SUMMER' : 'FALL';

  const query = `
    query ($season: MediaSeason, $year: Int, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: MANGA, sort: POPULARITY_DESC, season: $season, seasonYear: $year, isAdult: false) {
          ${MANGA_FIELDS}
        }
      }
    }
  `;
  const data = (await queryAniList(query, { season, year, perPage })) as {
    Page: { media: Record<string, unknown>[] };
  };
  return data.Page.media.map(mapAniListManga);
}

export async function searchMangaAniList(searchQuery: string, perPage = 20): Promise<Manga[]> {
  const query = `
    query ($search: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: MANGA, search: $search, sort: SEARCH_MATCH, isAdult: false) {
          ${MANGA_FIELDS}
        }
      }
    }
  `;
  const data = (await queryAniList(query, { search: searchQuery, perPage })) as {
    Page: { media: Record<string, unknown>[] };
  };
  return data.Page.media.map(mapAniListManga);
}

export async function getMangaById(id: number): Promise<Manga> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: MANGA) {
        ${MANGA_FIELDS}
      }
    }
  `;
  const data = (await queryAniList(query, { id })) as {
    Media: Record<string, unknown>;
  };
  return mapAniListManga(data.Media);
}
