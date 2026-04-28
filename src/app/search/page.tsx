'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { Manga, MangaDexSearchResult } from '@/lib/types';
import { MangaGrid } from '@/components/MangaGrid';
import { SectionHeader } from '@/components/SectionHeader';
import { Suspense } from 'react';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) return;
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      const anilistManga: Manga[] = data.anilist || [];
      const mdResults: MangaDexSearchResult[] = data.mangadex || [];

      // Merge, prioritizing AniList results
      const seen = new Set(anilistManga.map((m: Manga) => m.title.toLowerCase()));
      const mdManga: Manga[] = mdResults
        .filter((m: MangaDexSearchResult) => !seen.has(m.title.toLowerCase()))
        .map((m: MangaDexSearchResult) => ({
          id: m.id,
          title: m.title,
          coverImage: m.coverFileName
            ? `https://uploads.mangadex.org/covers/${m.id}/${m.coverFileName}.512.jpg`
            : '',
          source: 'mangadex' as const,
          description: '',
        }));

      setResults([...anilistManga, ...mdManga]);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) doSearch(initialQuery);
  }, [initialQuery, doSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      doSearch(query.trim());
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <SectionHeader title="Search Manga" subtitle="Find your next favorite read" />

      <form onSubmit={handleSubmit} className="max-w-2xl mb-8">
        <div className="flex items-center bg-bg-card border border-border-subtle rounded-xl overflow-hidden focus-within:border-accent-purple transition-colors">
          <Search size={20} className="ml-4 text-text-muted flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title..."
            className="flex-1 bg-transparent px-4 py-3 text-text-primary placeholder:text-text-muted outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-accent-purple text-white font-medium hover:bg-accent-violet transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Search'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-accent-purple" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          No results found for &ldquo;{initialQuery}&rdquo;
        </div>
      )}

      {!loading && results.length > 0 && (
        <MangaGrid manga={results} />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-32">
          <Loader2 size={28} className="animate-spin text-accent-purple" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
