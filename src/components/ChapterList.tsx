'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { Chapter } from '@/lib/types';
import { formatDate, cn } from '@/lib/utils';

interface ChapterListProps {
  chapters: Chapter[];
  mangaId: string;
}

export function ChapterList({ chapters, mangaId }: ChapterListProps) {
  const [sortAsc, setSortAsc] = useState(true);
  const [expandedVolumes, setExpandedVolumes] = useState<Set<string>>(new Set(['all']));

  const grouped = useMemo(() => {
    const sorted = [...chapters].sort((a, b) => {
      const diff = parseFloat(a.chapter) - parseFloat(b.chapter);
      return sortAsc ? diff : -diff;
    });

    const groups: Record<string, Chapter[]> = {};
    for (const ch of sorted) {
      const vol = ch.volume || 'No Volume';
      if (!groups[vol]) groups[vol] = [];
      groups[vol].push(ch);
    }
    return groups;
  }, [chapters, sortAsc]);

  const volumeKeys = Object.keys(grouped);

  function toggleVolume(vol: string) {
    setExpandedVolumes((prev) => {
      const next = new Set(prev);
      if (next.has(vol)) next.delete(vol);
      else next.add(vol);
      return next;
    });
  }

  if (chapters.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <BookOpen size={32} className="mx-auto mb-3 opacity-50" />
        <p>No English chapters available yet.</p>
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

      <div className="space-y-3">
        {volumeKeys.map((vol) => (
          <div key={vol} className="border border-border-subtle rounded-xl overflow-hidden">
            <button
              onClick={() => toggleVolume(vol)}
              className="w-full flex items-center justify-between px-4 py-3 bg-bg-card hover:bg-bg-card-hover transition-colors"
            >
              <span className="font-medium text-text-primary text-sm">
                {vol === 'No Volume' ? 'Chapters' : `Volume ${vol}`}
              </span>
              <span className="flex items-center gap-2 text-text-muted text-xs">
                {grouped[vol].length} ch.
                {expandedVolumes.has(vol) || expandedVolumes.has('all') ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </span>
            </button>

            {(expandedVolumes.has(vol) || expandedVolumes.has('all')) && (
              <div className="divide-y divide-border-subtle">
                {grouped[vol].map((ch) => (
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
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
