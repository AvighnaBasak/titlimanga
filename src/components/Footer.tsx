import { ButterflyLogo } from './ButterflyLogo';

export function Footer() {
  return (
    <footer className="border-t border-border-subtle mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ButterflyLogo size={28} />
            <span className="text-lg font-bold gradient-text">Titli Manga</span>
          </div>

          <p className="text-text-muted text-xs text-center">
            Powered by AniList & MangaDex. Images are not hosted on this site.
          </p>

          <div className="flex gap-4 text-text-muted text-xs">
            <a
              href="https://anilist.co"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-purple transition-colors"
            >
              AniList
            </a>
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
