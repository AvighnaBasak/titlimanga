import { Manga } from './types';

const MAL_API = 'https://api.myanimelist.net/v2';
const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID || '';

const MANGA_FIELDS = 'id,title,main_picture,alternative_titles,synopsis,mean,genres,status,num_chapters,num_volumes,start_date,media_type';

async function fetchMAL(path: string, params: Record<string, string> = {}): Promise<unknown> {
  const url = new URL(`${MAL_API}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      'X-MAL-CLIENT-ID': MAL_CLIENT_ID,
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`MAL API error: ${res.status}`);
  return res.json();
}

interface MALNode {
  id: number;
  title: string;
  main_picture?: { medium?: string; large?: string };
  alternative_titles?: { en?: string; ja?: string; synonyms?: string[] };
  synopsis?: string;
  mean?: number;
  genres?: { id: number; name: string }[];
  status?: string;
  num_chapters?: number;
  num_volumes?: number;
  start_date?: string;
  media_type?: string;
}

function mapMALStatus(status?: string): string | undefined {
  if (!status) return undefined;
  switch (status) {
    case 'currently_publishing': return 'Ongoing';
    case 'finished': return 'Completed';
    case 'not_yet_published': return 'Upcoming';
    default: return status;
  }
}

function mapMALManga(node: MALNode): Manga {
  const year = node.start_date ? parseInt(node.start_date.split('-')[0]) : undefined;

  return {
    id: String(node.id),
    title: node.title,
    titleJapanese: node.alternative_titles?.ja || undefined,
    description: node.synopsis || '',
    coverImage: node.main_picture?.large || node.main_picture?.medium || '',
    status: mapMALStatus(node.status),
    genres: node.genres?.map((g) => g.name) || [],
    score: node.mean ? node.mean * 10 : undefined,
    chapters: node.num_chapters || undefined,
    year,
    source: 'mal',
  };
}

export async function getTrendingManga(limit = 12): Promise<Manga[]> {
  const data = (await fetchMAL('/manga/ranking', {
    ranking_type: 'all',
    limit: String(limit),
    fields: MANGA_FIELDS,
  })) as { data: { node: MALNode }[] };

  return data.data.map((item) => mapMALManga(item.node));
}

export async function getPopularManga(limit = 12): Promise<Manga[]> {
  const data = (await fetchMAL('/manga/ranking', {
    ranking_type: 'bypopularity',
    limit: String(limit),
    fields: MANGA_FIELDS,
  })) as { data: { node: MALNode }[] };

  return data.data.map((item) => mapMALManga(item.node));
}

export async function searchMangaMAL(query: string, limit = 20): Promise<Manga[]> {
  const data = (await fetchMAL('/manga', {
    q: query,
    limit: String(limit),
    fields: MANGA_FIELDS,
  })) as { data: { node: MALNode }[] };

  return data.data.map((item) => mapMALManga(item.node));
}

export async function getMangaById(id: number): Promise<Manga> {
  const data = (await fetchMAL(`/manga/${id}`, {
    fields: MANGA_FIELDS,
  })) as MALNode;

  return mapMALManga(data);
}
