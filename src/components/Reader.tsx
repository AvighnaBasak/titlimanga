'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowUp, Loader2 } from 'lucide-react';
import { ChapterPage } from '@/lib/types';
import { proxyImageUrl, cn, isUUID } from '@/lib/utils';

import { addToReadingHistory } from '@/lib/storage';

interface ReaderProps {
  chapterId: string;
  mangaId?: string;
  mangaTitle?: string;
  chapterNumber?: string;
  coverImage?: string;
  prevChapterId?: string;
  nextChapterId?: string;
}

export function Reader({
  chapterId,
  mangaId,
  mangaTitle,
  chapterNumber,
  coverImage,
  prevChapterId,
  nextChapterId,
}: ReaderProps) {
  const [pages, setPages] = useState<ChapterPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTopButton, setShowTopButton] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const prefetchedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function fetchPages() {
      setLoading(true);
      setError(null);
      setLoadedImages(new Set());
      prefetchedRef.current = new Set();

      try {
        const res = await fetch(`/api/chapter/${chapterId}`);
        if (!res.ok) throw new Error('Failed to load chapter');
        const data = await res.json();
        if (!cancelled) setPages(data.pages);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load chapter');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPages();

    if (mangaId && mangaTitle && chapterNumber) {
      const source = isUUID(mangaId) ? 'mangadex' : 'mal';
      addToReadingHistory({
        mangaId,
        mangaTitle,
        chapterId,
        chapterNumber,
        coverImage: coverImage || '',
        timestamp: Date.now(),
        source,
      });
    }

    return () => {
      cancelled = true;
    };
  }, [chapterId, mangaId, mangaTitle, chapterNumber, coverImage]);

  // Pre-fetch logic
  const prefetchImage = useCallback(
    (index: number) => {
      if (prefetchedRef.current.has(index) || index >= pages.length) return;
      prefetchedRef.current.add(index);
      const img = new Image();
      img.src = proxyImageUrl(pages[index].url);
    },
    [pages],
  );

  // IntersectionObserver for lazy loading + prefetch
  useEffect(() => {
    if (pages.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');

          if (entry.isIntersecting) {
            const img = entry.target.querySelector('img');
            if (img && img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }

            // Pre-fetch next 2 pages
            prefetchImage(index + 1);
            prefetchImage(index + 2);
          }
        });
      },
      { rootMargin: '200px 0px 600px 0px', threshold: 0.01 },
    );

    const pageElements = containerRef.current?.querySelectorAll('[data-page]');
    pageElements?.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [pages, prefetchImage]);

  // Show/hide scroll-to-top button
  useEffect(() => {
    function handleScroll() {
      setShowTopButton(window.scrollY > 800);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function onImageLoad(index: number) {
    setLoadedImages((prev) => new Set(prev).add(index));
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 size={32} className="animate-spin text-accent-purple" />
        <p className="text-text-muted">Loading chapter...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-accent-purple rounded-lg text-white text-sm hover:bg-accent-violet transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Top navigation */}
      <div className="glass sticky top-16 z-40 border-b border-border-subtle">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-2">
          {prevChapterId ? (
            <Link
              href={`/read/${prevChapterId}${mangaId ? `?manga=${mangaId}` : ''}`}
              className="flex items-center gap-1 text-sm text-text-secondary hover:text-accent-purple transition-colors"
            >
              <ChevronLeft size={16} />
              Prev
            </Link>
          ) : (
            <span className="text-sm text-text-muted opacity-50">Prev</span>
          )}

          <div className="text-center">
            {mangaTitle && (
              <Link
                href={
                  mangaId
                    ? isUUID(mangaId)
                      ? `/manga/${mangaId}?source=md`
                      : `/manga/${mangaId}`
                    : '#'
                }
                className="text-xs text-text-muted hover:text-accent-purple transition-colors block"
              >
                {mangaTitle}
              </Link>
            )}
            <span className="text-sm font-medium text-text-primary">
              Chapter {chapterNumber || '?'}
            </span>
          </div>

          {nextChapterId ? (
            <Link
              href={`/read/${nextChapterId}${mangaId ? `?manga=${mangaId}` : ''}`}
              className="flex items-center gap-1 text-sm text-text-secondary hover:text-accent-purple transition-colors"
            >
              Next
              <ChevronRight size={16} />
            </Link>
          ) : (
            <span className="text-sm text-text-muted opacity-50">Next</span>
          )}
        </div>
      </div>

      {/* Reader content */}
      <div ref={containerRef} className="reader-container py-4">
        {pages.map((page) => (
          <div
            key={page.index}
            data-page
            data-index={page.index}
            className="relative w-full"
            style={{ aspectRatio: '2/3', minHeight: 200 }}
          >
            {!loadedImages.has(page.index) && (
              <div className="absolute inset-0 skeleton" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              data-src={proxyImageUrl(page.url)}
              src={page.index < 3 ? proxyImageUrl(page.url) : undefined}
              alt={`Page ${page.index + 1}`}
              className={cn(
                'w-full h-auto block transition-opacity duration-300',
                loadedImages.has(page.index) ? 'opacity-100' : 'opacity-0',
              )}
              onLoad={() => onImageLoad(page.index)}
              loading={page.index < 3 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* Bottom navigation */}
      <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-6 border-t border-border-subtle">
        {prevChapterId ? (
          <Link
            href={`/read/${prevChapterId}${mangaId ? `?manga=${mangaId}` : ''}`}
            className="flex items-center gap-2 px-4 py-2 bg-bg-card border border-border-subtle rounded-lg text-sm text-text-secondary hover:text-accent-purple hover:border-accent-purple transition-all"
          >
            <ChevronLeft size={16} />
            Previous Chapter
          </Link>
        ) : (
          <div />
        )}
        {nextChapterId ? (
          <Link
            href={`/read/${nextChapterId}${mangaId ? `?manga=${mangaId}` : ''}`}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-pink rounded-lg text-sm text-white font-medium hover:opacity-90 transition-opacity"
          >
            Next Chapter
            <ChevronRight size={16} />
          </Link>
        ) : (
          <Link
            href={
              mangaId
                ? isUUID(mangaId)
                  ? `/manga/${mangaId}?source=md`
                  : `/manga/${mangaId}`
                : '/'
            }
            className="flex items-center gap-2 px-4 py-2 bg-bg-card border border-border-subtle rounded-lg text-sm text-text-secondary hover:text-accent-purple transition-all"
          >
            Back to Manga
          </Link>
        )}
      </div>

      {/* Scroll to top */}
      {showTopButton && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3 bg-accent-purple rounded-full text-white shadow-lg hover:bg-accent-violet transition-colors glow-purple"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}
