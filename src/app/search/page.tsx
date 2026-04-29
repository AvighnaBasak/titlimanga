'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Loader2, Compass } from 'lucide-react';
import { Manga } from '@/lib/types';
import { MangaGrid, MangaGridSkeleton } from '@/components/MangaGrid';
import { SectionHeader } from '@/components/SectionHeader';
import Link from 'next/link';

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
      const malManga: Manga[] = data.mal || [];
      setResults(malManga);
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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-28 pb-10">
      <div className="mb-8">
        <SectionHeader title="Browse Manga" subtitle="Search across the MyAnimeList database" />
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mb-10">
        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden focus-within:border-white/20 transition-colors">
          <Search size={17} className="ml-4 text-white/40 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title..."
            className="flex-1 bg-transparent px-4 py-3 text-text-primary placeholder:text-text-muted outline-none text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 btn-primary rounded-none text-[13px] disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : 'Search'}
          </button>
        </div>
      </form>

      {loading && <MangaGridSkeleton count={12} />}

      {!loading && !searched && (
        <div className="text-center py-24 border border-dashed border-border-subtle rounded-2xl">
          <Compass size={36} className="mx-auto mb-3 text-text-muted opacity-40" />
          <p className="text-text-primary font-medium text-sm">Search for any manga</p>
          <p className="text-text-muted text-[12px] mt-1">Type a title above to get started</p>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-24 border border-dashed border-border-subtle rounded-2xl">
          <Search size={36} className="mx-auto mb-3 text-text-muted opacity-40" />
          <p className="text-text-primary font-medium text-sm mb-1">No results for &ldquo;{initialQuery}&rdquo;</p>
          <p className="text-text-muted text-[12px] mb-5">Try a different title or spelling</p>
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2 btn-primary rounded-xl text-sm">
            Back to Home
          </Link>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <div className="mb-5">
            <SectionHeader
              title={`Results for "${initialQuery}"`}
              subtitle={`${results.length} titles found`}
            />
          </div>
          <MangaGrid manga={results} />
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-28 pb-10">
        <div className="h-7 skeleton rounded w-40 mb-8" />
        <div className="h-12 skeleton rounded-xl w-full max-w-2xl mb-10" />
        <MangaGridSkeleton count={12} />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
