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
import { Star, BookOpen, Calendar, Tag, Loader2 } from 'lucide-react';

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

  const firstReadable = chapters.find((ch) => ch.pages > 0);
  const firstExternal = chapters.find((ch) => ch.externalUrl);

  return (
    <div className="animate-fade-in">
      {/* Banner */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        {manga.bannerImage ? (
          <img
            src={manga.bannerImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : manga.coverImage ? (
          <img
            src={manga.coverImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-40"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/15 to-accent-pink/15" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/70 to-bg-primary/20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-28 sm:-mt-32 relative z-10">
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-8">
          {/* Cover */}
          <div className="flex-shrink-0 w-36 sm:w-48">
            <div className="aspect-[3/4] relative rounded-xl overflow-hidden border border-border-subtle shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
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

          {/* Info */}
          <div className="flex-1 pt-0 sm:pt-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary leading-tight tracking-tight">
              {manga.title}
            </h1>
            {manga.titleJapanese && (
              <p className="text-text-muted text-sm mt-1">{manga.titleJapanese}</p>
            )}

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              {manga.score && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-400/10 rounded-lg">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-300 text-sm font-semibold">{(manga.score / 10).toFixed(1)}</span>
                </div>
              )}
              {manga.status && (
                <div className="flex items-center gap-1.5 text-sm">
                  <BookOpen size={14} className="text-accent-teal" />
                  <span className="text-text-secondary">{manga.status}</span>
                </div>
              )}
              {manga.year && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Calendar size={14} className="text-text-muted" />
                  <span className="text-text-secondary">{manga.year}</span>
                </div>
              )}
              {manga.chapters && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Tag size={14} className="text-text-muted" />
                  <span className="text-text-secondary">{manga.chapters} ch.</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {manga.genres && manga.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {manga.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-2.5 py-1 bg-bg-card border border-border-subtle rounded-lg text-[11px] text-text-secondary font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2.5 mt-5">
              <BookmarkButton
                mangaId={manga.id}
                title={manga.title}
                coverImage={manga.coverImage}
                source={manga.source}
              />
              {firstReadable ? (
                <a
                  href={`/read/${firstReadable.id}?manga=${mangadexId || id}`}
                  className="flex items-center gap-2 px-4 py-2 btn-primary text-sm"
                >
                  <BookOpen size={16} />
                  Start Reading
                </a>
              ) : firstExternal ? (
                <a
                  href={firstExternal.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 btn-primary text-sm"
                >
                  <BookOpen size={16} />
                  Read on Official Site
                </a>
              ) : null}
            </div>

            {/* Description */}
            {description && (
              <p className="mt-5 text-text-secondary text-sm leading-relaxed line-clamp-4">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Chapters */}
        <div className="mt-10 mb-8">
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
          <Loader2 size={28} className="animate-spin text-accent-purple" />
        </div>
      }
    >
      <MangaContent id={id} source={source} />
    </Suspense>
  );
}
