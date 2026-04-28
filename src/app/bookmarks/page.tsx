'use client';

import { useState, useEffect } from 'react';
import { BookMarked, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark } from '@/lib/types';
import { getBookmarks, removeBookmark } from '@/lib/storage';
import { proxyImageUrl, cn } from '@/lib/utils';
import { SectionHeader } from '@/components/SectionHeader';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  function handleRemove(mangaId: string) {
    removeBookmark(mangaId);
    setBookmarks(getBookmarks());
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <SectionHeader
        title="Bookmarks"
        subtitle={`${bookmarks.length} saved manga`}
      />

      {bookmarks.length === 0 ? (
        <div className="text-center py-20">
          <BookMarked size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
          <p className="text-text-muted">No bookmarks yet. Start adding manga to your collection!</p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-2 bg-accent-purple rounded-lg text-white text-sm hover:bg-accent-violet transition-colors"
          >
            Browse Manga
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {bookmarks.map((bm) => {
            const href =
              bm.source === 'anilist'
                ? `/manga/${bm.mangaId}`
                : `/manga/${bm.mangaId}?source=md`;
            const imgSrc =
              bm.source === 'mangadex' ? proxyImageUrl(bm.coverImage) : bm.coverImage;

            return (
              <div key={bm.mangaId} className="group relative">
                <Link href={href} className="block manga-card-hover">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-bg-card border border-border-subtle">
                    {imgSrc ? (
                      <Image
                        src={imgSrc}
                        alt={bm.title}
                        fill
                        sizes="(max-width: 640px) 45vw, 200px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">
                        No Cover
                      </div>
                    )}
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-text-primary line-clamp-2 group-hover:text-accent-purple transition-colors">
                    {bm.title}
                  </h3>
                </Link>
                <button
                  onClick={() => handleRemove(bm.mangaId)}
                  className={cn(
                    'absolute top-2 right-2 p-1.5 rounded-full',
                    'bg-black/60 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity',
                    'hover:bg-red-500 hover:text-white',
                  )}
                  aria-label="Remove bookmark"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
