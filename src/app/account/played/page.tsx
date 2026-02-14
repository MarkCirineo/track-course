import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PlayedCourseItem } from "@/components/played-course-item";

export const dynamic = "force-dynamic";

export default async function AccountPlayedPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const plays = await db.coursePlay.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          holes: {
            orderBy: { holeIndex: "asc" },
            include: { holeTees: true },
          },
        },
      },
      tee: true,
      holeScores: { include: { hole: { select: { holeIndex: true } } } },
    },
    orderBy: { playedAt: "desc" },
  });

  const courseIds = [...new Set(plays.map((p) => p.courseId))];

  const courses = await db.course.findMany({
    where: { id: { in: courseIds } },
    include: {
      holes: {
        orderBy: { holeIndex: "asc" },
        include: { holeTees: true },
      },
    },
  });
  const courseById = new Map(courses.map((c) => [c.id, c]));
  const playsByCourse = new Map<string, (typeof plays)[number][]>();
  for (const p of plays) {
    const list = playsByCourse.get(p.courseId) ?? ([] as (typeof plays)[number][]);
    list.push(p);
    playsByCourse.set(p.courseId, list);
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">My played courses</h1>
      <p className="mt-2 text-muted-foreground">
        {courseIds.length} course{courseIds.length !== 1 ? "s" : ""} played
      </p>
      {courseIds.length === 0 ? (
        <p className="mt-6 text-muted-foreground">
          Mark courses as played from the course list or course detail page to see them here.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {courseIds.map((courseId) => {
            const course = courseById.get(courseId);
            if (!course) return null;
            const coursePlays = playsByCourse.get(courseId) ?? [];
            return (
              <PlayedCourseItem
                key={courseId}
                courseId={course.id}
                courseName={course.displayName}
                numbersOfHoles={course.numbersOfHoles}
                courseLocation={course.courseLocation}
                imageUrl={course.imageUrl}
                plays={coursePlays.map((p) => ({
                  id: p.id,
                  playedAt: p.playedAt,
                  tee: p.tee,
                  holesPlayed: p.holesPlayed,
                  overallScore: p.overallScore,
                  note: p.note,
                  holeScores: p.holeScores.map((hs) => ({
                    holeId: hs.holeId,
                    score: hs.score,
                    hole: { holeIndex: hs.hole.holeIndex },
                  })),
                }))}
                holes={course.holes.map((h) => ({
                  id: h.id,
                  holeIndex: h.holeIndex,
                  holeTees: h.holeTees.map((ht) => ({
                    teeId: ht.teeId,
                    par: ht.par,
                    distance: ht.distance,
                    strokeIndex: ht.strokeIndex,
                  })),
                }))}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
