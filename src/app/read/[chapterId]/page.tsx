import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Reader } from '@/components/Reader';
import { getChapterNavigation } from '@/lib/mangadex';

interface PageProps {
  params: Promise<{ chapterId: string }>;
  searchParams: Promise<{ manga?: string }>;
}

async function ReaderWrapper({
  chapterId,
  mangaIdParam,
}: {
  chapterId: string;
  mangaIdParam?: string;
}) {
  let mangaId = mangaIdParam || '';
  let mangaTitle = '';
  let chapterNumber = '';
  let prevChapter: string | undefined;
  let nextChapter: string | undefined;

  try {
    const nav = await getChapterNavigation(chapterId, mangaIdParam);
    mangaId = nav.mangaId;
    mangaTitle = nav.mangaTitle;
    chapterNumber = nav.chapterNumber;
    prevChapter = nav.prevChapter;
    nextChapter = nav.nextChapter;
  } catch {
    // Navigation failed, reader still works without prev/next
  }

  return (
    <Reader
      chapterId={chapterId}
      mangaId={mangaId}
      mangaTitle={mangaTitle}
      chapterNumber={chapterNumber}
      prevChapterId={prevChapter}
      nextChapterId={nextChapter}
    />
  );
}

export default async function ReadPage({ params, searchParams }: PageProps) {
  const { chapterId } = await params;
  const { manga } = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 size={32} className="animate-spin text-accent-purple" />
          <p className="text-text-muted">Preparing reader...</p>
        </div>
      }
    >
      <ReaderWrapper chapterId={chapterId} mangaIdParam={manga} />
    </Suspense>
  );
}
