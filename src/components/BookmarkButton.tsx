'use client';

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { isBookmarked, addBookmark, removeBookmark } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  mangaId: string;
  title: string;
  coverImage: string;
  source: 'mal' | 'mangadex';


  className?: string;
}

export function BookmarkButton({ mangaId, title, coverImage, source, className }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(isBookmarked(mangaId));
  }, [mangaId]);

  function toggle() {
    if (bookmarked) {
      removeBookmark(mangaId);
      setBookmarked(false);
    } else {
      addBookmark({ mangaId, title, coverImage, addedAt: Date.now(), source });
      setBookmarked(true);
    }
  }

  return (
    <button
      onClick={toggle}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
        bookmarked
          ? 'bg-accent-purple text-white glow-purple'
          : 'bg-bg-card border border-border-subtle text-text-secondary hover:text-accent-purple hover:border-accent-purple',
        className,
      )}
    >
      {bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
      {bookmarked ? 'Bookmarked' : 'Bookmark'}
    </button>
  );
}
