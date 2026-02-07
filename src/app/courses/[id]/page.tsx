import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const course = await db.course.findUnique({
    where: { id },
    include: { tees: true },
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(() => {
                const menTees = course.tees.filter((t) => t.gender === "MALE");
                const womenTees = course.tees.filter((t) => t.gender === "FEMALE");
                const otherTees = course.tees.filter(
                  (t) => t.gender !== "MALE" && t.gender !== "FEMALE"
                );
                return (
                  <>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Men's tees
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {menTees.length > 0
                          ? menTees.map((tee) => (
                              <Badge
                                key={tee.id}
                                variant="secondary"
                                className="text-sm"
                              >
                                {tee.name || "Tee"}: Rating {tee.courseRating ?? "—"} / Slope{" "}
                                {tee.slope ?? "—"}
                                {tee.par != null && ` · Par ${tee.par}`}
                                {tee.courseDistance != null &&
                                  ` · ${tee.courseDistance} yd`}
                              </Badge>
                            ))
                          : (
                              <span className="text-sm text-muted-foreground">
                                —
                              </span>
                            )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Women's tees
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {womenTees.length > 0
                          ? womenTees.map((tee) => (
                              <Badge
                                key={tee.id}
                                variant="secondary"
                                className="text-sm"
                              >
                                {tee.name || "Tee"}: Rating {tee.courseRating ?? "—"} / Slope{" "}
                                {tee.slope ?? "—"}
                                {tee.par != null && ` · Par ${tee.par}`}
                                {tee.courseDistance != null &&
                                  ` · ${tee.courseDistance} yd`}
                              </Badge>
                            ))
                          : (
                              <span className="text-sm text-muted-foreground">
                                —
                              </span>
                            )}
                      </div>
                    </div>
                    {otherTees.length > 0 && (
                      <div className="space-y-2 md:col-span-2">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Other tees
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {otherTees.map((tee) => (
                            <Badge
                              key={tee.id}
                              variant="secondary"
                              className="text-sm"
                            >
                              {tee.name || tee.gender || "Tee"}: Rating{" "}
                              {tee.courseRating ?? "—"} / Slope {tee.slope ?? "—"}
                              {tee.par != null && ` · Par ${tee.par}`}
                              {tee.courseDistance != null &&
                                ` · ${tee.courseDistance} yd`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
