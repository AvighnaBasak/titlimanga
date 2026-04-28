import { Suspense } from 'react';
import { getTrendingManga, getPopularManga } from '@/lib/anilist';
import { getLatestUpdates } from '@/lib/mangadex';
import { HeroSection } from '@/components/HeroSection';
import { MangaGrid, MangaGridSkeleton } from '@/components/MangaGrid';
import { SectionHeader } from '@/components/SectionHeader';

async function TrendingSection() {
  try {
    const manga = await getTrendingManga(1, 12);
    return <MangaGrid manga={manga} />;
  } catch {
    return <p className="text-text-muted text-center py-8">Failed to load trending manga.</p>;
  }
}

async function PopularSection() {
  try {
    const manga = await getPopularManga(1, 12);
    return <MangaGrid manga={manga} />;
  } catch {
    return <p className="text-text-muted text-center py-8">Failed to load popular manga.</p>;
  }
}

async function LatestSection() {
  try {
    const manga = await getLatestUpdates(18);
    return <MangaGrid manga={manga} priorityCount={0} />;
  } catch {
    return <p className="text-text-muted text-center py-8">Failed to load latest updates.</p>;
  }
}

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 pb-16">
        <section>
          <SectionHeader
            title="Trending Now"
            subtitle="The hottest manga everyone is reading"
          />
          <Suspense fallback={<MangaGridSkeleton count={12} />}>
            <TrendingSection />
          </Suspense>
        </section>

        <section>
          <SectionHeader
            title="Popular This Season"
            subtitle="Top picks by the community"
          />
          <Suspense fallback={<MangaGridSkeleton count={12} />}>
            <PopularSection />
          </Suspense>
        </section>

        <section>
          <SectionHeader
            title="Latest Updates"
            subtitle="Freshly uploaded chapters from MangaDex"
          />
          <Suspense fallback={<MangaGridSkeleton count={18} />}>
            <LatestSection />
          </Suspense>
        </section>
      </div>
    </>
  );
}
