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
    <Link href={href} className="group block w-full">
      <div className="relative aspect-[3/4] rounded shadow-sm overflow-hidden border border-white/5 bg-[#141b29]">
        {manga.coverImage ? (
          <img
            src={manga.coverImage}
            alt={manga.title}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
            No Cover
          </div>
        )}

        {/* Top score badge */}
        {showScore && manga.score && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
            {(manga.score / 10).toFixed(1)}
          </div>
        )}

        {manga.status && (
          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 to-transparent">
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/20 text-white backdrop-blur-sm">
              {manga.status}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2.5 text-center px-1">
        <h3 className="text-[13px] font-bold text-white truncate group-hover:text-blue-400 transition-colors">
          {manga.title}
        </h3>
        {manga.genres && manga.genres.length > 0 && (
          <p className="text-[10px] text-white/40 mt-0.5 truncate">
            {manga.genres.slice(0, 2).join(' / ')}
          </p>
        )}
      </div>
    </Link>
  );
}

export function MangaCardSkeleton() {
  return (
    <div>
      <div className="aspect-[3/4] skeleton rounded shadow-sm border border-white/5 bg-[#141b29]" />
      <div className="mt-2.5 flex flex-col items-center px-1">
        <div className="h-3.5 skeleton w-3/4 rounded mb-1.5" />
        <div className="h-2.5 skeleton w-1/2 rounded" />
      </div>
    </div>
  );
}
