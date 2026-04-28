import Link from 'next/link';
import { Star } from 'lucide-react';
import { Manga } from '@/lib/types';
import { cn, truncate } from '@/lib/utils';

interface MangaCardProps {
  manga: Manga;
  showScore?: boolean;
  priority?: boolean;
}

export function MangaCard({ manga, showScore = true, priority = false }: MangaCardProps) {
  const href = manga.source === 'mal' ? `/manga/${manga.id}` : `/manga/${manga.id}?source=md`;

  return (
    <Link href={href} className="group block manga-card-hover">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-bg-card border border-border-subtle">
        {manga.coverImage ? (
          <img
            src={manga.coverImage}
            alt={manga.title}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">
            No Cover
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {showScore && manga.score && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 rounded-full px-2 py-0.5 text-xs">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-100 font-medium">{(manga.score / 10).toFixed(1)}</span>
          </div>
        )}

        {manga.status && (
          <div
            className={cn(
              'absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-medium',
              manga.status === 'Ongoing'
                ? 'bg-accent-teal/80 text-white'
                : manga.status === 'Completed'
                  ? 'bg-accent-purple/80 text-white'
                  : 'bg-bg-card/80 text-text-secondary',
            )}
          >
            {manga.status}
          </div>
        )}
      </div>

      <h3 className="mt-2 text-sm font-medium text-text-primary line-clamp-2 group-hover:text-accent-purple transition-colors">
        {truncate(manga.title, 50)}
      </h3>
      {manga.genres && manga.genres.length > 0 && (
        <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
          {manga.genres.slice(0, 3).join(' · ')}
        </p>
      )}
    </Link>
  );
}

export function MangaCardSkeleton() {
  return (
    <div>
      <div className="aspect-[3/4] skeleton rounded-xl" />
      <div className="mt-2 h-4 skeleton w-3/4" />
      <div className="mt-1 h-3 skeleton w-1/2" />
    </div>
  );
}
