import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Reader } from '@/components/Reader';
import { getChapterNavigation } from '@/lib/consumet';
import { getMangaById } from '@/lib/mal';

interface PageProps {
  params: Promise<{ chapterId: string }>;
  searchParams: Promise<{ manga?: string; mpid?: string }>;
}

async function ReaderWrapper({
  chapterId,
  malId,
  mangaPillId,
}: {
  chapterId: string;
  malId?: string;
  mangaPillId?: string;
}) {
  let mangaTitle = '';
  let chapterNumber = '';
  let prevChapter: string | undefined;
  let nextChapter: string | undefined;
  let coverImage = '';

  // Get manga title from MAL
  if (malId) {
    try {
      const malIdNum = parseInt(malId);
      if (!isNaN(malIdNum)) {
        const manga = await getMangaById(malIdNum);
        mangaTitle = manga.title;
        coverImage = manga.coverImage;
      }
    } catch {
      // MAL unavailable
    }
  }

  // Get chapter navigation from MangaPill
  if (mangaPillId) {
    try {
      const nav = await getChapterNavigation(chapterId, mangaPillId);
      chapterNumber = nav.chapterNumber;
      prevChapter = nav.prevChapter;
      nextChapter = nav.nextChapter;
    } catch {
      // Navigation failed, reader still works without prev/next
    }
  }

  // If we couldn't get chapter number, try to extract from ID
  if (!chapterNumber || chapterNumber === '?') {
    const match = chapterId.match(/chapter-(\d+(?:\.\d+)?)/);
    if (match) chapterNumber = match[1];
  }

  return (
    <Reader
      chapterId={chapterId}
      mangaId={malId}
      mangaPillId={mangaPillId}
      mangaTitle={mangaTitle}
      chapterNumber={chapterNumber}
      coverImage={coverImage}
      prevChapterId={prevChapter}
      nextChapterId={nextChapter}
    />
  );
}

export default async function ReadPage({ params, searchParams }: PageProps) {
  const { chapterId } = await params;
  const decodedChapterId = decodeURIComponent(chapterId);
  const { manga: malId, mpid } = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 size={32} className="animate-spin text-accent-purple" />
          <p className="text-text-muted">Preparing reader...</p>
        </div>
      }
    >
      <ReaderWrapper chapterId={decodedChapterId} malId={malId} mangaPillId={mpid} />
    </Suspense>
  );
}
