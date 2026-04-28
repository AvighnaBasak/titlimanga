'use client';

import { useState, useEffect } from 'react';
import { Clock, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ReadingHistoryEntry } from '@/lib/types';
import { getReadingHistory } from '@/lib/storage';
import { proxyImageUrl } from '@/lib/utils';
import { SectionHeader } from '@/components/SectionHeader';

export default function HistoryPage() {
  const [history, setHistory] = useState<ReadingHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getReadingHistory());
  }, []);

  function clearHistory() {
    localStorage.removeItem('titli-reading-history');
    setHistory([]);
  }

  function timeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <SectionHeader
          title="Reading History"
          subtitle={`${history.length} entries`}
          className="mb-0"
        />
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-colors"
          >
            <Trash2 size={14} />
            Clear
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20">
          <Clock size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
          <p className="text-text-muted">No reading history yet. Start reading some manga!</p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-2 bg-accent-purple rounded-lg text-white text-sm hover:bg-accent-violet transition-colors"
          >
            Browse Manga
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry, i) => {
            const imgSrc = entry.coverImage
              ? entry.source === 'mangadex'
                ? proxyImageUrl(entry.coverImage)
                : entry.coverImage
              : '';

            return (
              <Link
                key={`${entry.chapterId}-${i}`}
                href={`/read/${entry.chapterId}?manga=${entry.mangaId}`}
                className="flex items-center gap-4 p-3 bg-bg-card border border-border-subtle rounded-xl hover:bg-bg-card-hover hover:border-accent-purple/30 transition-all group"
              >
                <div className="relative w-12 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-bg-surface">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={entry.mangaTitle}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                      ?
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-text-primary truncate group-hover:text-accent-purple transition-colors">
                    {entry.mangaTitle}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Chapter {entry.chapterNumber}
                  </p>
                </div>
                <span className="text-xs text-text-muted flex-shrink-0">
                  {timeAgo(entry.timestamp)}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
