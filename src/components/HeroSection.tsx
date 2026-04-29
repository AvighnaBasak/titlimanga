'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Manga } from '@/lib/types';
import { stripHtml } from '@/lib/utils';
import { BookmarkButton } from './BookmarkButton';

interface HeroSectionProps {
  featuredManga?: Manga;
}

export function HeroSection({ featuredManga }: HeroSectionProps) {
  if (!featuredManga) return <HeroSectionSkeleton />;

  const href = featuredManga.source === 'mal' ? `/manga/${featuredManga.id}` : `/manga/${featuredManga.id}?source=md`;
  const desc = featuredManga.description ? stripHtml(featuredManga.description) : '';

  return (
    <section className="relative w-full h-[500px] md:h-[600px] flex items-center border-b border-[#2c2d33]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {featuredManga.bannerImage || featuredManga.coverImage ? (
          <img
            src={featuredManga.bannerImage || featuredManga.coverImage}
            alt={featuredManga.title}
            className="w-full h-full object-cover opacity-80"
            style={{ objectPosition: 'center 20%' }}
          />
        ) : (
          <div className="w-full h-full bg-[#0d0d0f]" />
        )}
        
        {/* Vagabond Header Gradient (Vignette) */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, #0d0d0f 100%), linear-gradient(to right, #0d0d0f 0%, transparent 50%)'
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 w-full pt-16">
        <h2 className="text-white text-lg title-aggressive mb-4 text-[#8a8b8f]">Trending Now</h2>

        {featuredManga.genres && featuredManga.genres.length > 0 && (
          <div className="flex gap-2 mb-6">
            {featuredManga.genres.slice(0, 4).map((g) => (
              <span key={g} className="px-3 py-1 bg-[#16171d]/80 border border-[#2c2d33] rounded text-[11px] font-bold text-[#e2e8f0] uppercase tracking-wider">
                {g}
              </span>
            ))}
          </div>
        )}

        <p className="text-[#8a8b8f] text-sm md:text-[15px] leading-relaxed max-w-2xl mb-8 line-clamp-3 md:line-clamp-4">
          {desc}
        </p>

        <h1 className="text-5xl md:text-7xl lg:text-8xl title-aggressive text-white mb-2 leading-none">
          {featuredManga.title}
        </h1>
        {featuredManga.titleJapanese && (
          <h2 className="text-xl md:text-2xl text-[#8a8b8f] font-bold mb-10 tracking-widest uppercase">
            {featuredManga.titleJapanese}
          </h2>
        )}

        <div className="flex items-center gap-3">
          <Link
            href={href}
            className="inline-flex items-center gap-2 bg-white text-[#0d0d0f] px-8 py-3 title-aggressive text-sm hover:bg-gray-200 transition-colors"
          >
            Chapter 1 <ArrowRight size={16} />
          </Link>
          <div className="bg-[#16171d]/80 border border-[#2c2d33] hover:bg-[#2c2d33] transition-colors flex items-center justify-center p-0.5">
             <BookmarkButton 
               mangaId={featuredManga.id} 
               title={featuredManga.title} 
               coverImage={featuredManga.coverImage || ''} 
               source="mal" 
               className="bg-transparent border-none px-3 py-2 h-full"
             />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroSectionSkeleton() {
  return (
    <section className="relative w-full h-[500px] md:h-[600px] flex items-center bg-bg-primary">
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 w-full pt-16">
        <div className="h-8 skeleton w-48 mb-4" />
        <div className="flex gap-2 mb-6">
          <div className="h-6 skeleton w-16" />
          <div className="h-6 skeleton w-20" />
        </div>
        <div className="h-4 skeleton w-full max-w-2xl mb-2" />
        <div className="h-4 skeleton w-full max-w-xl mb-8" />
        <div className="h-16 skeleton w-3/4 max-w-3xl mb-4" />
        <div className="h-8 skeleton w-64 mb-10" />
        <div className="flex items-center gap-3">
          <div className="h-10 skeleton w-32" />
          <div className="h-10 skeleton w-10" />
        </div>
      </div>
    </section>
  );
}
