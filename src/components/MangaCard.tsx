import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Manga } from '@/lib/types';
import { cn, truncate, proxyImageUrl } from '@/lib/utils';

interface MangaCardProps {
  manga: Manga;
  priority?: boolean;
  showScore?: boolean;
}

export function MangaCard({ manga, priority = false, showScore = true }: MangaCardProps) {
  const href = manga.source === 'anilist' ? `/manga/${manga.id}` : `/manga/${manga.id}?source=md`;
  const imgSrc =
    manga.source === 'mangadex' && manga.coverImage
      ? proxyImageUrl(manga.coverImage)
      : manga.coverImage;

  return (
    <Link href={href} className="group block manga-card-hover">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-bg-card border border-border-subtle">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={manga.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">
            No Cover
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Score badge */}
        {showScore && manga.score && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 rounded-full px-2 py-0.5 text-xs">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-100 font-medium">{(manga.score / 10).toFixed(1)}</span>
          </div>
        )}

        {/* Status badge */}
        {manga.status && (
          <div
            className={cn(
              'absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-medium',
              manga.status === 'RELEASING' || manga.status === 'ongoing'
                ? 'bg-accent-teal/80 text-white'
                : manga.status === 'FINISHED' || manga.status === 'completed'
                  ? 'bg-accent-purple/80 text-white'
                  : 'bg-bg-card/80 text-text-secondary',
            )}
          >
            {manga.status === 'RELEASING' || manga.status === 'ongoing'
              ? 'Ongoing'
              : manga.status === 'FINISHED' || manga.status === 'completed'
                ? 'Completed'
                : manga.status}
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
