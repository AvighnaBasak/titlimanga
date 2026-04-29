'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import { ButterflyLogo } from './ButterflyLogo';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Browse' },
  { href: '/bookmarks', label: 'Library' },
  { href: '/history', label: 'History' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-50 pt-4">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <ButterflyLogo size={24} className="text-white" />
            <span className="text-lg font-bold text-white tracking-wide">
              TitliManga
            </span>
          </Link>

          {/* Center Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="flex items-center bg-white/10 rounded-md overflow-hidden transition-colors">
                <Search size={14} className="ml-3 text-white/60 flex-shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for a manga or author"
                  className="w-full bg-transparent px-3 py-2 text-[13px] text-white placeholder:text-white/60 focus:outline-none"
                />
              </div>
            </form>
          </div>

          {/* Right side navigation */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'text-[13px] font-medium transition-colors',
                      active ? 'text-white' : 'text-white/60 hover:text-white',
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden pb-4 pt-2 bg-[#0b131f]/95 backdrop-blur-md rounded-b-lg absolute left-0 right-0 px-4 shadow-xl border-b border-white/10 z-50">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex items-center bg-white/5 border border-white/10 rounded-md overflow-hidden">
                <Search size={14} className="ml-3 text-white/40" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-transparent px-3 py-2 text-[13px] text-white focus:outline-none"
                />
              </div>
            </form>
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
