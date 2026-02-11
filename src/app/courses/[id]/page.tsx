import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TeeScorecardSection } from "@/components/tee-scorecard-modal";
import { HoleImagesModal } from "@/components/hole-images-modal";
import { CourseDetailActions } from "@/components/course-detail-actions";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  const userId = session?.user?.id;

  const [course, bookmark, favorite, plays] = await Promise.all([
    db.course.findUnique({
      where: { id },
      include: {
        tees: true,
        holes: {
          orderBy: { holeIndex: "asc" },
          include: { holeTees: true },
        },
      },
    }),
    userId
      ? db.bookmark.findUnique({
          where: { userId_courseId: { userId, courseId: id } },
          select: { note: true },
        })
      : Promise.resolve(null),
    userId
      ? db.favorite.findUnique({
          where: { userId_courseId: { userId, courseId: id } },
        })
      : Promise.resolve(null),
    userId
      ? db.coursePlay.findMany({
          where: { userId, courseId: id },
          include: { tee: true },
          orderBy: { playedAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  if (!course) notFound();

  const isBookmarked = !!bookmark;
  const bookmarkNote = bookmark?.note ?? null;
  const isFavorite = !!favorite;
  const hasPlayed = plays.length > 0;

  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/courses" className="mb-6 inline-block text-primary hover:underline">
        ← Back to courses
      </Link>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{course.displayName}</h1>
            {course.courseLocation && (
              <p className="text-muted-foreground">{course.courseLocation}</p>
            )}
            {course.numbersOfHoles != null && (
              <p className="text-sm text-muted-foreground">{course.numbersOfHoles} holes</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {userId && (
              <CourseDetailActions
                courseId={course.id}
                courseName={course.displayName}
                numbersOfHoles={course.numbersOfHoles}
                tees={course.tees.map((t) => ({
                  id: t.id,
                  name: t.name,
                  gender: t.gender,
                  courseRating: t.courseRating,
                  slope: t.slope,
                }))}
                holes={course.holes.map((h) => ({ id: h.id, holeIndex: h.holeIndex }))}
                initialBookmarked={isBookmarked}
                initialBookmarkNote={bookmarkNote}
                initialFavorite={isFavorite}
                hasPlayed={hasPlayed}
              />
            )}
            {course.googleMapUrl && (
              <Button asChild variant="outline">
                <a
                  href={course.googleMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Google Maps
                </a>
              </Button>
            )}
            {course.holes.length > 0 &&
              course.holes.some((h) => h.imageUrls?.length > 0) && (
                <HoleImagesModal
                  holes={course.holes.map((h) => ({
                    id: h.id,
                    name: h.name,
                    holeIndex: h.holeIndex,
                    imageUrls: h.imageUrls ?? [],
                    holeTees: h.holeTees,
                  }))}
                  tees={course.tees}
                />
              )}
          </div>
        </div>

        {course.imageUrl && (
          <div className="aspect-video max-w-2xl overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={course.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <Card>
          <CardHeader className="pb-2">
            <h2 className="text-lg font-medium">Tees &amp; ratings</h2>
          </CardHeader>
          <CardContent>
            <TeeScorecardSection
              course={{
                displayName: course.displayName,
                tees: course.tees,
                holes: course.holes,
              }}
            />
          </CardContent>
        </Card>

        {course.description && (
          <Card>
            <CardHeader className="pb-2">
              <h2 className="text-lg font-medium">Description</h2>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {course.description}
              </p>
            </CardContent>
          </Card>
        )}

        {userId && plays.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <h2 className="text-lg font-medium">Your play history</h2>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plays.map((play) => (
                  <li
                    key={play.id}
                    className="flex flex-wrap items-center gap-2 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {new Date(play.playedAt).toLocaleDateString()}
                    </span>
                    <span>
                      {play.tee.name || play.tee.gender || "Tee"} —
                      {play.holesPlayed === "front"
                        ? " Front 9"
                        : play.holesPlayed === "back"
                          ? " Back 9"
                          : " Full 18"}
                    </span>
                    {play.overallScore != null && (
                      <span className="font-medium">{play.overallScore}</span>
                    )}
                    {play.note && (
                      <span className="text-muted-foreground">· {play.note}</span>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
