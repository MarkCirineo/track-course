import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TeeScorecardSection } from "@/components/tee-scorecard-modal";
import { HoleImagesModal } from "@/components/hole-images-modal";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const course = await db.course.findUnique({
    where: { id },
    include: {
      tees: true,
      holes: {
        orderBy: { holeIndex: "asc" },
        include: { holeTees: true },
      },
    },
  });

  if (!course) notFound();

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

        {course.holes.length > 0 &&
          course.holes.some((h) => h.imageUrls?.length > 0) && (
            <Card>
              <CardHeader className="pb-2">
                <h2 className="text-lg font-medium">Hole images</h2>
              </CardHeader>
              <CardContent>
                <HoleImagesModal
                  holes={course.holes.map((h) => ({
                    id: h.id,
                    name: h.name,
                    holeIndex: h.holeIndex,
                    imageUrls: h.imageUrls ?? [],
                  }))}
                />
              </CardContent>
            </Card>
          )}
      </div>
    </main>
  );
}
