'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, BookMarked, Clock, Menu, X } from 'lucide-react';
import { ButterflyLogo } from './ButterflyLogo';

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  }

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <ButterflyLogo size={36} className="transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold gradient-text hidden sm:block">
              Titli Manga
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
            >
              Home
            </Link>
            <Link
              href="/search"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
            >
              Browse
            </Link>
            <Link
              href="/bookmarks"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium flex items-center gap-1.5"
            >
              <BookMarked size={16} />
              Bookmarks
            </Link>
            <Link
              href="/history"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium flex items-center gap-1.5"
            >
              <Clock size={16} />
              History
            </Link>
          </nav>

          {/* Search + Mobile Menu */}
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search manga..."
                  autoFocus
                  className="bg-bg-card border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple w-48 sm:w-64"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="ml-2 text-text-muted hover:text-text-primary"
                >
                  <X size={18} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-text-secondary hover:text-accent-purple transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-text-secondary hover:text-text-primary"
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-border-subtle pt-4 space-y-3 animate-fade-in">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="block text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              Home
            </Link>
            <Link
              href="/search"
              onClick={() => setMenuOpen(false)}
              className="block text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              Browse
            </Link>
            <Link
              href="/bookmarks"
              onClick={() => setMenuOpen(false)}
              className="block text-text-secondary hover:text-text-primary transition-colors text-sm flex items-center gap-1.5"
            >
              <BookMarked size={16} />
              Bookmarks
            </Link>
            <Link
              href="/history"
              onClick={() => setMenuOpen(false)}
              className="block text-text-secondary hover:text-text-primary transition-colors text-sm flex items-center gap-1.5"
            >
              <Clock size={16} />
              History
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
