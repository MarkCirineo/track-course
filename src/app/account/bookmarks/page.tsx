import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookmarkItem } from "@/components/bookmark-item";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AccountBookmarksPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const bookmarks = await db.bookmark.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          displayName: true,
          numbersOfHoles: true,
          courseLocation: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const [favoriteSet, plays] = await Promise.all([
    db.favorite
      .findMany({ where: { userId }, select: { courseId: true } })
      .then((f) => new Set(f.map((x) => x.courseId))),
    db.coursePlay.findMany({
      where: { userId },
      select: { courseId: true },
    }),
  ]);
  const playedCourseIds = new Set(plays.map((p) => p.courseId));

  return (
    <>
      <h1 className="text-2xl font-semibold">My bookmarks</h1>
      <p className="mt-2 text-muted-foreground">
        {bookmarks.length} bookmarked course
        {bookmarks.length !== 1 ? "s" : ""}
      </p>
      {bookmarks.length === 0 ? (
        <p className="mt-6 text-muted-foreground">
          You haven&apos;t bookmarked any courses yet. Bookmark courses from the{" "}
          <Link href="/courses" className="text-primary hover:underline">
            course list
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {bookmarks.map((b) => (
            <BookmarkItem
              key={b.id}
              courseId={b.course.id}
              courseName={b.course.displayName}
              numbersOfHoles={b.course.numbersOfHoles}
              courseLocation={b.course.courseLocation}
              imageUrl={b.course.imageUrl}
              note={b.note}
              isFavorite={favoriteSet.has(b.courseId)}
              canFavorite={playedCourseIds.has(b.courseId)}
            />
          ))}
        </div>
      )}
    </>
  );
}
