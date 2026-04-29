import Link from 'next/link';
import { Star } from 'lucide-react';
import { Manga } from '@/lib/types';
import { truncate } from '@/lib/utils';

interface MangaCardProps {
  manga: Manga;
  showScore?: boolean;
  priority?: boolean;
}

export function MangaCard({ manga, showScore = true, priority = false }: MangaCardProps) {
  const href = manga.source === 'mal' ? `/manga/${manga.id}` : `/manga/${manga.id}?source=md`;

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-bg-card border border-border-subtle transition-all duration-300 group-hover:border-accent-purple/30 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] group-hover:-translate-y-1">
        {manga.coverImage ? (
          <img
            src={manga.coverImage}
            alt={manga.title}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted text-sm bg-bg-elevated">
            No Cover
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {showScore && manga.score && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-xs">
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-100 font-medium">{(manga.score / 10).toFixed(1)}</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {manga.status && (
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent-purple/80 text-white mb-1">
              {manga.status}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-medium text-text-primary line-clamp-2 leading-snug group-hover:text-accent-purple transition-colors">
          {truncate(manga.title, 60)}
        </h3>
        {manga.genres && manga.genres.length > 0 && (
          <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">
            {manga.genres.slice(0, 3).join(' · ')}
          </p>
        )}
      </div>
    </Link>
  );
}

export function MangaCardSkeleton() {
  return (
    <div>
      <div className="aspect-[3/4] skeleton rounded-xl" />
      <div className="mt-2 h-4 skeleton w-3/4 rounded" />
      <div className="mt-1.5 h-3 skeleton w-1/2 rounded" />
    </div>
  );
}
