'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, BookMarked, Clock, Menu, X, Compass } from 'lucide-react';
import { ButterflyLogo } from './ButterflyLogo';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: null },
  { href: '/search', label: 'Browse', icon: Compass },
  { href: '/bookmarks', label: 'Library', icon: BookMarked },
  { href: '/history', label: 'History', icon: Clock },
];

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

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
          <Link href="/" className="flex items-center gap-2.5 group">
            <ButterflyLogo size={32} className="transition-transform group-hover:scale-110" />
            <span className="text-lg font-bold gradient-text tracking-tight">
              Titli Manga
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                    active
                      ? 'text-accent-purple bg-accent-purple/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-card',
                  )}
                >
                  {Icon && <Icon size={15} />}
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2 animate-fade-in">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search manga..."
                  autoFocus
                  className="bg-bg-card border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple w-44 sm:w-56 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setQuery(''); }}
                  className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-card transition-colors"
                >
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-text-secondary hover:text-accent-purple hover:bg-bg-card rounded-lg transition-all"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-bg-card rounded-lg transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden pb-4 pt-2 animate-fade-in">
            <div className="bg-bg-card rounded-xl border border-border-subtle p-2 space-y-0.5">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'text-accent-purple bg-accent-purple/10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover',
                    )}
                  >
                    {Icon && <Icon size={16} />}
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
