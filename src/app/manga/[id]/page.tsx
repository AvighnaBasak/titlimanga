import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getMangaById } from '@/lib/mal';
import {
  getMangaDexManga,
  getMangaChapters,
  findMangaDexMatch,
} from '@/lib/mangadex';
import { isUUID, stripHtml } from '@/lib/utils';
import { Manga, Chapter } from '@/lib/types';
import { ChapterList } from '@/components/ChapterList';
import { BookmarkButton } from '@/components/BookmarkButton';
import { Star, BookOpen, Calendar, Tag } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ source?: string }>;
}

async function fetchMangaData(
  id: string,
  source?: string,
): Promise<{ manga: Manga; chapters: Chapter[]; mangadexId: string }> {
  const isMangaDex = isUUID(id) || source === 'md';

  if (isMangaDex) {
    const [manga, chapData] = await Promise.all([
      getMangaDexManga(id),
      getMangaChapters(id),
    ]);
    return { manga, chapters: chapData.chapters, mangadexId: id };
  }

  const malId = parseInt(id);
  if (isNaN(malId)) notFound();

  const manga = await getMangaById(malId);

  let chapters: Chapter[] = [];
  let mangadexId = '';
  try {
    const matchId = await findMangaDexMatch(manga.title, manga.titleJapanese);
    if (matchId) {
      mangadexId = matchId;
      const chapData = await getMangaChapters(mangadexId);
      chapters = chapData.chapters;
    }
  } catch {
    // MangaDex unavailable
  }

  return { manga, chapters, mangadexId };
}

async function MangaContent({ id, source }: { id: string; source?: string }) {
  let data;
  try {
    data = await fetchMangaData(id, source);
  } catch {
    notFound();
  }

  const { manga, chapters, mangadexId } = data;
  const description = manga.description ? stripHtml(manga.description) : '';

  return (
    <div>
      <div className="relative h-64 sm:h-80 overflow-hidden">
        {manga.bannerImage ? (
          <img
            src={manga.bannerImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 to-accent-pink/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-32 relative z-10">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0 w-40 sm:w-52">
            <div className="aspect-[3/4] relative rounded-xl overflow-hidden border-2 border-border-subtle shadow-2xl">
              {manga.coverImage ? (
                <img
                  src={manga.coverImage}
                  alt={manga.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-bg-card flex items-center justify-center text-text-muted">
                  No Cover
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 pt-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              {manga.title}
            </h1>
            {manga.titleJapanese && (
              <p className="text-text-muted text-sm mt-1">{manga.titleJapanese}</p>
            )}

            <div className="flex flex-wrap gap-3 mt-4">
              {manga.score && (
                <div className="flex items-center gap-1.5 text-yellow-400 text-sm">
                  <Star size={16} className="fill-yellow-400" />
                  <span className="font-medium">{(manga.score / 10).toFixed(1)}</span>
                </div>
              )}
              {manga.status && (
                <div className="flex items-center gap-1.5 text-accent-teal text-sm">
                  <BookOpen size={16} />
                  <span>{manga.status}</span>
                </div>
              )}
              {manga.year && (
                <div className="flex items-center gap-1.5 text-text-secondary text-sm">
                  <Calendar size={16} />
                  <span>{manga.year}</span>
                </div>
              )}
              {manga.chapters && (
                <div className="flex items-center gap-1.5 text-text-secondary text-sm">
                  <Tag size={16} />
                  <span>{manga.chapters} chapters</span>
                </div>
              )}
            </div>

            {manga.genres && manga.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {manga.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-bg-card border border-border-subtle rounded-full text-xs text-text-secondary"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <BookmarkButton
                mangaId={manga.id}
                title={manga.title}
                coverImage={manga.coverImage}
                source={manga.source}
              />
              {chapters.length > 0 && (
                <a
                  href={`/read/${chapters[0].id}?manga=${mangadexId || id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-pink rounded-lg text-sm text-white font-medium hover:opacity-90 transition-opacity"
                >
                  <BookOpen size={18} />
                  Start Reading
                </a>
              )}
            </div>

            {description && (
              <div className="mt-6">
                <p className="text-text-secondary text-sm leading-relaxed line-clamp-6">
                  {description}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10">
          <ChapterList chapters={chapters} mangaId={mangadexId || id} />
        </div>
      </div>
    </div>
  );
}

export default async function MangaPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { source } = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MangaContent id={id} source={source} />
    </Suspense>
  );
}
