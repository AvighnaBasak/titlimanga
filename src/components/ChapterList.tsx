'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown, BookOpen, ExternalLink, Search } from 'lucide-react';
import { Chapter } from '@/lib/types';
import { formatDate, cn } from '@/lib/utils';

interface ChapterListProps {
  chapters: Chapter[];
  mangaId: string;
}

export function ChapterList({ chapters, mangaId }: ChapterListProps) {
  const [sortAsc, setSortAsc] = useState(true);
  const [search, setSearch] = useState('');

  const sorted = useMemo(() => {
    let filtered = [...chapters];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (ch) =>
          ch.chapter.includes(q) ||
          ch.title?.toLowerCase().includes(q) ||
          ch.scanlationGroup?.toLowerCase().includes(q),
      );
    }

    filtered.sort((a, b) => {
      const diff = parseFloat(a.chapter) - parseFloat(b.chapter);
      return sortAsc ? diff : -diff;
    });

    return filtered;
  }, [chapters, sortAsc, search]);

  if (chapters.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <BookOpen size={32} className="mx-auto mb-3 opacity-50" />
        <p>No English chapters available on MangaDex.</p>
        <p className="text-xs mt-2">Licensed manga may only be available on official platforms.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          {chapters.length} Chapter{chapters.length !== 1 ? 's' : ''}
        </h3>
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-accent-purple transition-colors"
        >
          {sortAsc ? (
            <>
              Ascending <ChevronUp size={16} />
            </>
          ) : (
            <>
              Descending <ChevronDown size={16} />
            </>
          )}
        </button>
      </div>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search chapters..."
          className="w-full pl-9 pr-3 py-2 bg-bg-card border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple transition-colors"
        />
      </div>

      <div className="border border-border-subtle rounded-xl overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto divide-y divide-border-subtle">
          {sorted.length === 0 ? (
            <div className="px-4 py-8 text-center text-text-muted text-sm">
              No chapters match your search.
            </div>
          ) : (
            sorted.map((ch) => {
              const isExternal = !!ch.externalUrl;

              if (isExternal) {
                return (
                  <a
                    key={ch.id}
                    href={ch.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center justify-between px-4 py-3',
                      'hover:bg-bg-card-hover transition-colors group',
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-text-primary group-hover:text-accent-purple transition-colors">
                        Ch. {ch.chapter}
                        {ch.title && (
                          <span className="text-text-muted ml-2">— {ch.title}</span>
                        )}
                      </span>
                      <p className="text-xs text-text-muted mt-0.5 truncate flex items-center gap-1">
                        <ExternalLink size={10} />
                        {ch.scanlationGroup || 'Official'} (external)
                      </p>
                    </div>
                    <span className="text-xs text-text-muted ml-4 flex-shrink-0">
                      {ch.publishAt ? formatDate(ch.publishAt) : ''}
                    </span>
                  </a>
                );
              }

              return (
                <Link
                  key={ch.id}
                  href={`/read/${ch.id}?manga=${mangaId}`}
                  className={cn(
                    'flex items-center justify-between px-4 py-3',
                    'hover:bg-bg-card-hover transition-colors group',
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-text-primary group-hover:text-accent-purple transition-colors">
                      Ch. {ch.chapter}
                      {ch.title && (
                        <span className="text-text-muted ml-2">— {ch.title}</span>
                      )}
                    </span>
                    {ch.scanlationGroup && (
                      <p className="text-xs text-text-muted mt-0.5 truncate">
                        {ch.scanlationGroup}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-text-muted ml-4 flex-shrink-0">
                    {ch.publishAt ? formatDate(ch.publishAt) : ''}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
