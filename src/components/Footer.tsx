import Link from 'next/link';
import { ButterflyLogo } from './ButterflyLogo';

const FOOTER_LINKS = {
  Platform: [
    { label: 'Plans & Pricing', href: '#' },
    { label: 'Reading Features', href: '#' },
    { label: 'Updates & Releases', href: '#' },
    { label: 'Supported Devices', href: '#' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'News & Events', href: '#' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'FAQs', href: '#' },
    { label: 'Contact Support', href: '#' },
    { label: 'Community Forum', href: '#' },
  ],
  Legal: [
    { label: 'Terms of Service', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Copyright Information', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#0b101a] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        
        <div className="flex flex-col md:flex-row justify-between mb-16 gap-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-10">
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-white text-[13px] font-bold mb-4">{title}</h4>
                <ul className="space-y-3">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="text-[12px] text-white/50 hover:text-white transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-end max-w-xs">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <ButterflyLogo size={24} className="text-white" />
              <span className="text-lg font-bold text-white tracking-wide">
                TitliManga
              </span>
            </Link>
            <p className="text-[11px] text-white/40 text-right">
              世界中で最高のマンガをお届けします。
              <br />
              Bringing the best of manga to readers worldwide.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/40">© {new Date().getFullYear()} Titli Manga Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-white/40">
            {/* Social icons placeholder */}
            <span className="hover:text-white transition-colors cursor-pointer text-sm">IG</span>
            <span className="hover:text-white transition-colors cursor-pointer text-sm">YT</span>
            <span className="hover:text-white transition-colors cursor-pointer text-sm">X</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
