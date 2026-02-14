import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CourseCard } from "@/components/course-card";

export const dynamic = "force-dynamic";

export default async function AccountFavoritesPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const favorites = await db.favorite.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          tees: true,
          holes: { orderBy: { holeIndex: "asc" }, select: { id: true, holeIndex: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const bookmarks = await db.bookmark.findMany({
    where: { userId },
    select: { courseId: true, note: true },
  });
  const bookmarkNoteByCourse = new Map(bookmarks.map((b) => [b.courseId, b.note]));
  const plays = await db.coursePlay.findMany({
    where: { userId },
    select: { courseId: true, holesPlayed: true },
    orderBy: { playedAt: "asc" },
  });
  const playByCourse = new Map(plays.map((p) => [p.courseId, { holesPlayed: p.holesPlayed }]));

  return (
    <>
      <h1 className="text-2xl font-semibold">My favorites</h1>
      <p className="mt-2 text-muted-foreground">
        {favorites.length} favorite course{favorites.length !== 1 ? "s" : ""}
      </p>
      {favorites.length === 0 ? (
        <p className="mt-6 text-muted-foreground">
          Mark courses as played to add them to favorites. Then they&apos;ll appear here.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((f) => (
            <CourseCard
              key={f.id}
              course={{
                id: f.course.id,
                displayName: f.course.displayName,
                numbersOfHoles: f.course.numbersOfHoles,
                courseLocation: f.course.courseLocation,
                imageUrl: f.course.imageUrl,
                tees: f.course.tees.map((t) => ({
                  id: t.id,
                  name: t.name,
                  gender: t.gender,
                  courseRating: t.courseRating,
                  slope: t.slope,
                })),
                holes: f.course.holes,
              }}
              isBookmarked={bookmarkNoteByCourse.has(f.courseId)}
              bookmarkNote={bookmarkNoteByCourse.get(f.courseId) ?? null}
              isFavorite={true}
              playedSummary={{
                played: true,
                lastHolesPlayed: playByCourse.get(f.courseId)?.holesPlayed as
                  | "front"
                  | "back"
                  | "full"
                  | undefined,
              }}
              isLoggedIn={true}
            />
          ))}
        </div>
      )}
    </>
  );
}
