import Link from 'next/link';
import { ButterflyLogo } from './ButterflyLogo';

export function Footer() {
  return (
    <footer className="border-t border-border-subtle mt-16 bg-bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ButterflyLogo size={24} />
            <span className="text-sm font-semibold gradient-text">Titli Manga</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-text-muted">
            <Link href="/" className="hover:text-text-secondary transition-colors">Home</Link>
            <Link href="/search" className="hover:text-text-secondary transition-colors">Browse</Link>
            <Link href="/bookmarks" className="hover:text-text-secondary transition-colors">Library</Link>
          </div>

          <div className="flex items-center gap-3 text-xs text-text-muted">
            <a
              href="https://myanimelist.net"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-purple transition-colors"
            >
              MAL
            </a>
            <span className="text-border-subtle">·</span>
            <a
              href="https://mangadex.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-pink transition-colors"
            >
              MangaDex
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
