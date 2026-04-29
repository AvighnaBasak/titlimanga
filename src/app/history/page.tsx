'use client';

import { useState, useEffect } from 'react';
import { Clock, Trash2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { ReadingHistoryEntry } from '@/lib/types';
import { getReadingHistory } from '@/lib/storage';
import { SectionHeader } from '@/components/SectionHeader';

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ReadingHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getReadingHistory());
  }, []);

  function clearHistory() {
    localStorage.removeItem('titli-reading-history');
    setHistory([]);
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-28 pb-10 min-h-[60vh]">
      <div className="flex items-start justify-between mb-8">
        <SectionHeader
          title="Reading History"
          subtitle={history.length === 0 ? 'Nothing read yet' : `${history.length} chapters read`}
          className="mb-0"
        />
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors flex-shrink-0 ml-4"
          >
            <Trash2 size={12} />
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-lg bg-[#141b29]">
          <Clock size={36} className="mx-auto mb-3 text-white/40" />
          <p className="text-white font-medium text-sm mb-1">No history yet</p>
          <p className="text-white/40 text-[12px] mb-5">Chapters you read will appear here</p>
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2 bg-white text-black font-bold rounded hover:bg-white/90 text-sm transition-colors">
            <BookOpen size={14} />
            Start Reading
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((entry, i) => (
            <Link
              key={`${entry.chapterId}-${i}`}
              href={`/read/${entry.chapterId}?manga=${entry.mangaId}`}
              className="flex items-center gap-4 p-3 bg-[#141b29] border border-white/5 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <div className="w-11 h-[58px] flex-shrink-0 rounded overflow-hidden bg-bg-surface">
                {entry.coverImage ? (
                  <img src={entry.coverImage} alt={entry.mangaTitle} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">?</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                  {entry.mangaTitle}
                </h3>
                <p className="text-[11px] text-white/40 mt-0.5">Chapter {entry.chapterNumber}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 text-[11px] text-white/40">
                <Clock size={11} />
                {timeAgo(entry.timestamp)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
