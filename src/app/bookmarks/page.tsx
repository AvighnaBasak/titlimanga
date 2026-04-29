'use client';

import { useState, useEffect } from 'react';
import { BookMarked, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Bookmark } from '@/lib/types';
import { getBookmarks, removeBookmark } from '@/lib/storage';
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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-28 pb-10 min-h-[60vh]">
      <div className="mb-8">
        <SectionHeader
          title="Library"
          subtitle={bookmarks.length === 0 ? 'No bookmarks yet' : `${bookmarks.length} saved manga`}
        />
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-lg bg-[#141b29]">
          <BookMarked size={36} className="mx-auto mb-3 text-white/40" />
          <p className="text-white font-medium text-sm mb-1">Your library is empty</p>
          <p className="text-white/40 text-[12px] mb-5">Bookmark manga to save them here</p>
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2 bg-white text-black font-bold rounded hover:bg-white/90 text-sm transition-colors">
            <BookMarked size={14} />
            Browse Manga
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
          {bookmarks.map((bm, i) => {
            const href = bm.source === 'mal'
              ? `/manga/${bm.mangaId}`
              : `/manga/${bm.mangaId}?source=md`;
            return (
              <div key={`${bm.mangaId}-${i}`} className="group relative">
                <Link href={href} className="block w-full">
                  <div className="relative aspect-[3/4] rounded shadow-sm overflow-hidden border border-white/5 bg-[#141b29]">
                    {bm.coverImage ? (
                      <img src={bm.coverImage} alt={bm.title} loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">No Cover</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="mt-2.5 text-center px-1">
                    <h3 className="text-[13px] font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                      {bm.title}
                    </h3>
                  </div>
                </Link>
                <button
                  onClick={() => handleRemove(bm.mangaId)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-500 hover:text-white"
                  aria-label="Remove bookmark"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
