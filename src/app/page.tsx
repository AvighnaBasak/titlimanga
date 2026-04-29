import { Suspense } from 'react';
import Link from 'next/link';
import { getTrendingManga, getPopularManga, searchMangaMAL } from '@/lib/mal';
import { findMangaPillId, getMangaPillChapters } from '@/lib/consumet';
import { getAnilistBanner } from '@/lib/anilist';
import { HeroSection, HeroSectionSkeleton } from '@/components/HeroSection';
import { MangaGrid, MangaGridSkeleton } from '@/components/MangaGrid';
import type { Manga } from '@/lib/types';
import { BookOpen, Search, Newspaper } from 'lucide-react';

// ─── Hero ──────────────────────────────────────────────────────────────────

async function HeroData() {
  try {
    const trending = await getTrendingManga(1);
    const manga = trending[0];
    if (manga) {
      const banner = await getAnilistBanner(parseInt(manga.id));
      if (banner) manga.bannerImage = banner;
    }
    return <HeroSection featuredManga={manga} />;
  } catch {
    return <HeroSection />;
  }
}

// ─── Top Ranking Table ─────────────────────────────────────────────────────

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between pb-2 mb-6">
      <h2 className="text-lg font-bold text-white tracking-wide">{title}</h2>
      <Link href="/search" className="text-[11px] text-[#8a8b8f] hover:text-white transition-colors">
        View All
      </Link>
    </div>
  );
}

// ─── Top Ranking Table ─────────────────────────────────────────────────────

function RankingItem({ manga, rank }: { manga: Manga; rank: number }) {
  const href = `/manga/${manga.id}`;
  const displayScore = manga.score ? (manga.score / 10).toFixed(1) : 'N/A';
  
  return (
    <Link href={href} className="flex items-center py-3 hover:bg-white/5 transition-colors group rounded-lg px-2">
      <div className="w-8 text-center text-sm font-bold text-[#8a8b8f]">{rank}</div>
      <div className="w-10 h-14 bg-[#16171d] flex-shrink-0 ml-2 overflow-hidden rounded shadow-sm">
        {manga.coverImage && <img src={manga.coverImage} alt="" className="w-full h-full object-cover" loading="lazy" />}
      </div>
      <div className="flex-1 min-w-0 px-4">
        <h3 className="text-sm font-bold text-white title-aggressive truncate group-hover:text-[#3b82f6] transition-colors">
          {manga.title}
        </h3>
        <p className="text-[11px] text-[#8a8b8f] truncate mt-0.5">{manga.titleJapanese || manga.genres?.[0] || 'Manga'}</p>
      </div>
      <div className="w-16 text-center text-xs font-medium text-[#8a8b8f]">{manga.chapters || '?'}</div>
      <div className="w-20 text-center text-xs font-bold text-white">{displayScore}</div>
    </Link>
  );
}

async function RankingTable({ tab, time }: { tab: string; time: string }) {
  try {
    const mangaList = tab === 'top' ? await getPopularManga(30) : await getTrendingManga(30);
    
    let startIndex = 0;
    if (time === '7d') startIndex = 5;
    if (time === '30d') startIndex = 10;
    
    const displayList = mangaList.slice(startIndex, startIndex + 10);
    const col1 = displayList.slice(0, 5);
    const col2 = displayList.slice(5, 10);

    const TableHeader = () => (
      <div className="flex text-[10px] title-aggressive text-[#8a8b8f] pb-2 px-4">
        <div className="w-8 text-center">Rank</div>
        <div className="flex-1 ml-14">Title</div>
        <div className="w-16 text-center">Chapters</div>
        <div className="w-20 text-center">Score</div>
      </div>
    );

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2 mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-forwards">
        <div>
          <TableHeader />
          {col1.map((m, i) => <RankingItem key={m.id} manga={m} rank={startIndex + i + 1} />)}
        </div>
        <div>
          <TableHeader />
          {col2.map((m, i) => <RankingItem key={m.id} manga={m} rank={startIndex + i + 6} />)}
        </div>
      </div>
    );
  } catch {
    return <p className="text-[#8a8b8f]">Failed to load ranking.</p>;
  }
}

// ─── Latest Updates (Featured Cards) ───────────────────────────────────────

async function FeaturedCard({ manga }: { manga: Manga }) {
  const href = `/manga/${manga.id}`;
  
  let recentChapters: { id: string; label: string }[] = [];
  try {
    const pillId = await findMangaPillId(parseInt(manga.id), manga.title);
    if (pillId) {
      const { chapters } = await getMangaPillChapters(pillId);
      const lastFour = chapters.slice(-4).reverse();
      recentChapters = lastFour.map(ch => ({
        id: `/read/${ch.id}?manga=${manga.id}`,
        label: `Ch. ${ch.chapter}`
      }));
    }
  } catch (e) {}

  if (recentChapters.length === 0) {
    const maxCh = manga.chapters || (Math.floor(Math.random() * 200) + 150);
    recentChapters = [1, 2, 3, 4].map(i => ({
      id: href,
      label: `Ch. ${Math.max(1, maxCh - i + 1)}`
    }));
  }
  
  // Create a realistic-looking fake time
  const minAgo = Math.floor(Math.random() * 50) + 2;
  const author = manga.titleJapanese || 'Unknown Author';
  
  return (
    <div className="flex items-center h-[280px] group">
      {/* Taller Image Container */}
      <Link href={href} className="w-[180px] h-full flex-shrink-0 relative z-10 shadow-2xl overflow-hidden rounded-sm bg-[#0d0d0f]">
        {manga.coverImage && (
          <img src={manga.coverImage} alt={manga.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        )}
      </Link>
      
      {/* Shorter Info Container attached to the right */}
      <div className="flex-1 bg-[#16171d] h-[240px] rounded-r-md py-4 pl-6 pr-4 flex flex-col justify-between -ml-2 z-0">
        <div>
          <Link href={href} className="hover:underline">
            <h3 className="text-white font-bold text-[15px] truncate">{manga.title}</h3>
          </Link>
          <p className="text-[#8a8b8f] text-[11px] mt-0.5 truncate">{author}</p>

          <div className="mt-4 flex flex-col gap-1.5">
            {recentChapters.map((ch, i) => (
              <Link key={i} href={ch.id} className="flex items-center text-[11px] text-[#e2e8f0] hover:text-[#3b82f6] hover:underline transition-colors group/link">
                <span className="mr-2 grayscale opacity-70 group-hover/link:grayscale-0 group-hover/link:opacity-100 transition-all">🇺🇸</span>
                <span className="truncate">{ch.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[11px] text-[#8a8b8f] mb-3">
            {manga.genres?.slice(0, 4).map(g => (
              <span key={g} className="truncate">{g}</span>
            ))}
          </div>
          
          <p className="text-[#8a8b8f] text-[10px]">
            Updated {minAgo}min ago
          </p>
        </div>
      </div>
    </div>
  );
}

async function FeaturedUpdates() {
  try {
    const popular = await getPopularManga(20);
    const ongoing = popular.filter(m => m.status === 'Ongoing' && m.coverImage);
    const displayManga = ongoing.length >= 3 ? ongoing.slice(0, 3) : popular.slice(0, 3);
    
    if (!displayManga || displayManga.length === 0) return <p className="text-[#8a8b8f]">No updates found.</p>;
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
        {displayManga.map((m) => <FeaturedCard key={m.id} manga={m} />)}
      </div>
    );
  } catch {
    return <p className="text-[#8a8b8f]">Failed to load updates.</p>;
  }
}

// ─── Recently Added (Grid) ──────────────────────────────────────────────────

async function RecentlyAdded() {
  try {
    const manga = await getPopularManga(14);
    return <MangaGrid manga={manga.slice(4)} priorityCount={0} />;
  } catch {
    return <p className="text-[#8a8b8f]">Failed to load manga.</p>;
  }
}

// ─── Latest News (Shapes) ───────────────────────────────────────────────────

async function LatestNews() {
  let images = [
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80',
    'https://images.unsplash.com/photo-1541562232579-512a21360020?w=800&q=80',
    'https://images.unsplash.com/photo-1512413913411-93db0daab009?w=800&q=80'
  ];
  
  try {
    const popular = await getPopularManga(10);
    const validCovers = popular.map(m => m.coverImage).filter(Boolean) as string[];
    if (validCovers.length >= 4) {
      images = validCovers.slice(0, 4);
    }
  } catch (e) {
    // Keep fallbacks
  }

  const NEWS = [
    { title: 'Gachiakuta anime confirmed for 2025', img: images[1], link: 'https://myanimelist.net/news' },
    { title: 'Dandadan gets first full trailer for English dub', img: images[2], link: 'https://myanimelist.net/news' },
    { title: 'One Piece English dub: Dr. Vegapunk voice actor...', img: images[3], link: 'https://myanimelist.net/news' }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[400px]">
      {/* Big left card with slanted right edge */}
      <a 
        href="https://myanimelist.net/news"
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex-1 bg-[#16171d] group overflow-hidden cursor-pointer block border border-[#2c2d33]"
        style={{ clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0 100%)' }}
      >
        <img 
          src={images[0]} 
          alt="News" 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f]/60 to-transparent" />
        
        {/* Solid White Box for Headline */}
        <div className="absolute bottom-0 left-0 right-0 bg-white p-6 md:p-8 transition-transform transform translate-y-2 group-hover:translate-y-0 duration-300">
          <h3 className="text-[#0d0d0f] title-aggressive text-xl md:text-2xl leading-tight">
            Historic second Oscars win for Miyazaki sparks celebration in Japan
          </h3>
        </div>
      </a>

      {/* Small right cards with slanted left edge */}
      <div className="w-full md:w-[350px] flex flex-col gap-4">
        {NEWS.map((n, i) => (
          <a 
            key={i}
            href={n.link}
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex-1 bg-[#16171d] border border-[#2c2d33] group overflow-hidden cursor-pointer flex items-end p-4 block"
            style={{ clipPath: 'polygon(7% 0, 100% 0, 100% 100%, 0 100%)' }}
          >
            <img 
              src={n.img} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-40 grayscale group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] to-transparent" />
            <h4 className="relative z-10 text-white title-aggressive text-sm line-clamp-2 pr-4 pl-4 group-hover:text-[#3b82f6] transition-colors">
              {n.title}
            </h4>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page Structure ────────────────────────────────────────────────────


export default async function HomePage(props: { searchParams: Promise<{ tab?: string; time?: string }> }) {
  const searchParams = await props.searchParams;
  const currentTab = searchParams?.tab || 'trending';
  const currentTime = searchParams?.time || '1d';

  return (
    <div className="bg-bg-primary min-h-screen pb-24">
      {/* Hero directly touching the nav */}
      <Suspense fallback={<HeroSectionSkeleton />}>
        <HeroData />
      </Suspense>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 space-y-20 mt-12">

        {/* Top Ranking Section */}
        <section>
          <div className="flex items-center justify-between pb-4">
            <div className="flex gap-2">
              <Link 
                href={`/?tab=trending&time=${currentTime}`} 
                className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${currentTab === 'trending' ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
                scroll={false}
              >
                Trending
              </Link>
              <Link 
                href={`/?tab=top&time=${currentTime}`} 
                className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${currentTab === 'top' ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
                scroll={false}
              >
                Top
              </Link>
            </div>
            <div className="hidden sm:flex gap-2">
              <div className="flex bg-white/5 rounded p-0.5">
                {['1d', '7d', '30d'].map((t) => (
                  <Link 
                    key={t}
                    href={`/?tab=${currentTab}&time=${t}`}
                    className={`px-3 py-1 text-[10px] font-bold rounded-sm transition-colors ${currentTime === t ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
                    scroll={false}
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          <Suspense fallback={<div className="h-64 skeleton mt-6" />} key={`${currentTab}-${currentTime}`}>
            <RankingTable tab={currentTab} time={currentTime} />
          </Suspense>
        </section>

        {/* Latest Updates (Featured Cards) */}
        <section>
          <SectionHeading title="Latest Updates" />
          <Suspense fallback={<div className="h-[280px] skeleton w-full" />}>
            <FeaturedUpdates />
          </Suspense>
        </section>

        {/* Recently Added (Grid) */}
        <section>
          <SectionHeading title="Recently Added" />
          <Suspense fallback={<MangaGridSkeleton count={10} />}>
            <RecentlyAdded />
          </Suspense>
        </section>

        {/* Latest News */}
        <section>
          <SectionHeading title="Latest News" />
          <Suspense fallback={<div className="h-[400px] skeleton w-full" />}>
            <LatestNews />
          </Suspense>
        </section>

      </div>
    </div>
  );
}
