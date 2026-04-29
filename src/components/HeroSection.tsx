'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles } from 'lucide-react';
import { ButterflyLogo } from './ButterflyLogo';

const POPULAR_SEARCHES = ['One Piece', 'Jujutsu Kaisen', 'Chainsaw Man', 'Solo Leveling', 'Berserk'];

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
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-purple/8 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] rounded-full bg-accent-purple/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[250px] rounded-full bg-accent-pink/5 blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-14 sm:pt-16 sm:pb-18">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 mb-6">
            <ButterflyLogo size={18} />
            <span className="text-xs font-medium text-accent-purple">Your Manga Gateway</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
            Welcome to{' '}
            <span className="gradient-text">Titli Manga</span>
          </h1>

          <p className="mt-3 text-text-secondary text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            Discover and read thousands of manga titles for free with a beautiful reading experience.
          </p>

          <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto">
            <div className="flex items-center bg-bg-card border border-border-subtle rounded-xl overflow-hidden focus-within:border-accent-purple/50 focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all duration-200">
              <Search size={18} className="ml-4 text-text-muted flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for manga..."
                className="flex-1 bg-transparent px-3 py-3.5 text-text-primary placeholder:text-text-muted outline-none text-sm"
              />
              <button
                type="submit"
                className="px-5 py-3.5 btn-primary rounded-none text-sm"
              >
                Search
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-text-muted text-xs flex items-center gap-1">
              <Sparkles size={12} />
              Popular:
            </span>
            {POPULAR_SEARCHES.map((title) => (
              <button
                key={title}
                onClick={() => router.push(`/search?q=${encodeURIComponent(title)}`)}
                className="px-2.5 py-1 bg-bg-card/80 border border-border-subtle rounded-lg text-xs text-text-secondary hover:text-accent-purple hover:border-accent-purple/40 transition-all"
              >
                {title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
