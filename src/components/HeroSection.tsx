'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, Sparkles } from 'lucide-react';
import { ButterflyLogo, ButterflyDecoration } from './ButterflyLogo';

export function HeroSection() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-accent-purple/10 blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-accent-pink/10 blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-accent-teal/5 blur-[120px]" />
      </div>

      {/* Floating butterflies */}
      <ButterflyDecoration className="absolute top-12 right-[15%] hidden lg:block" />
      <ButterflyDecoration className="absolute bottom-16 left-[10%] hidden lg:block" />
      <ButterflyDecoration className="absolute top-1/3 left-[5%] hidden xl:block" />

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <ButterflyLogo size={64} className="animate-float" />
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
          <span className="gradient-text">Titli Manga</span>
        </h1>

        <p className="mt-4 text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto">
          Your butterfly gateway to the world of manga. Read thousands of titles for free.
        </p>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="mt-8 max-w-xl mx-auto relative"
        >
          <div className="flex items-center bg-bg-card border border-border-subtle rounded-2xl overflow-hidden focus-within:border-accent-purple focus-within:glow-purple transition-all duration-300">
            <Search size={20} className="ml-4 text-text-muted flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for manga..."
              className="flex-1 bg-transparent px-4 py-4 text-text-primary placeholder:text-text-muted outline-none text-base"
            />
            <button
              type="submit"
              className="px-6 py-4 bg-gradient-to-r from-accent-purple to-accent-pink text-white font-medium hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </div>
        </form>

        {/* Quick links */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="text-text-muted text-sm flex items-center gap-1">
            <Sparkles size={14} />
            Popular:
          </span>
          {['One Piece', 'Jujutsu Kaisen', 'Chainsaw Man', 'Solo Leveling'].map((title) => (
            <button
              key={title}
              onClick={() => router.push(`/search?q=${encodeURIComponent(title)}`)}
              className="px-3 py-1.5 bg-bg-card border border-border-subtle rounded-full text-xs text-text-secondary hover:text-accent-purple hover:border-accent-purple transition-all"
            >
              {title}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-10 flex justify-center gap-8 sm:gap-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-accent-purple">
              <TrendingUp size={16} />
              <span className="text-lg font-bold">100K+</span>
            </div>
            <p className="text-text-muted text-xs mt-0.5">Manga Titles</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-accent-pink">
              <Sparkles size={16} />
              <span className="text-lg font-bold">Free</span>
            </div>
            <p className="text-text-muted text-xs mt-0.5">Always & Forever</p>
          </div>
        </div>
      </div>
    </section>
  );
}
