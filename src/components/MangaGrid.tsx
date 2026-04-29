import { Manga } from '@/lib/types';
import { MangaCard, MangaCardSkeleton } from './MangaCard';

interface MangaGridProps {
  manga: Manga[];
  priorityCount?: number;
}

export function MangaGrid({ manga, priorityCount = 4 }: MangaGridProps) {
  if (manga.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        No manga found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
      {manga.map((m, i) => (
        <MangaCard key={`${m.source}-${m.id}`} manga={m} priority={i < priorityCount} />
      ))}
    </div>
  );
}

export function MangaGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MangaCardSkeleton key={i} />
      ))}
    </div>
  );
}
