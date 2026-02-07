import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
import { CourseFilters } from "@/components/course-filters";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 50;

type SearchParams = { [key: string]: string | string[] | undefined };

function parseNum(value: string | string[] | undefined): number | undefined {
  if (value == null) return undefined;
  const s = typeof value === "string" ? value : value[0];
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function parseStr(value: string | string[] | undefined): string | undefined {
  if (value == null) return undefined;
  const s = typeof value === "string" ? value : value[0];
  return s?.trim() || undefined;
}

function buildQuery(params: SearchParams, page: number): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (k === "page" || v == null) continue;
    const s = Array.isArray(v) ? v[0] : v;
    if (s !== undefined && s !== "") search.set(k, s);
  }
  search.set("page", String(page));
  return search.toString();
}

function PaginationLinks({
  params,
  page,
  totalPages,
}: {
  params: SearchParams;
  page: number;
  totalPages: number;
}) {
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      {page > 1 && (
        <Link
          href={`/courses?${buildQuery(params, page - 1)}`}
          className="text-primary hover:underline"
        >
          Previous
        </Link>
      )}
      <span className="text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {page < totalPages && (
        <Link
          href={`/courses?${buildQuery(params, page + 1)}`}
          className="text-primary hover:underline"
        >
          Next
        </Link>
      )}
    </div>
  );
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = parseStr(params.q);
  const ratingMin = parseNum(params.ratingMin);
  const ratingMax = parseNum(params.ratingMax);
  const slopeMin = parseNum(params.slopeMin);
  const slopeMax = parseNum(params.slopeMax);
  const teeType = parseStr(params.teeType);
  const holes = parseNum(params.holes);
  const page = Math.max(1, parseNum(params.page) ?? 1);

  const teeConditions: { courseRating?: { gte?: number; lte?: number }; slope?: { gte?: number; lte?: number }; gender?: string } = {};
  if (ratingMin != null || ratingMax != null) {
    teeConditions.courseRating = {};
    if (ratingMin != null) teeConditions.courseRating.gte = ratingMin;
    if (ratingMax != null) teeConditions.courseRating.lte = ratingMax;
  }
  if (slopeMin != null || slopeMax != null) {
    teeConditions.slope = {};
    if (slopeMin != null) teeConditions.slope.gte = slopeMin;
    if (slopeMax != null) teeConditions.slope.lte = slopeMax;
  }
  if (teeType) teeConditions.gender = teeType;

  const where = {
    ...(q ? { displayName: { contains: q, mode: "insensitive" as const } } : {}),
    ...(Object.keys(teeConditions).length > 0 ? { tees: { some: teeConditions } } : {}),
    ...(holes != null ? { numbersOfHoles: holes } : {}),
  };

  const [courses, total] = await Promise.all([
    db.course.findMany({
      where,
      include: { tees: true },
      orderBy: { displayName: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.course.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Courses</h1>
      <CourseFilters />
      <p className="mt-4 text-muted-foreground">
        {total} course{total !== 1 ? "s" : ""} found
      </p>
      {courses.length === 0 ? (
        <p className="mt-6 text-muted-foreground">
          No courses match your filters. Try adjusting search or filter values, or run a sync to load data.
        </p>
      ) : (
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Link key={course.id} href={`/courses/${course.id}`}>
            <Card className={cn("h-full transition-colors hover:bg-muted/50", course.imageUrl && "pt-0")}>
              {course.imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold leading-tight">{course.displayName}</h2>
                  {course.numbersOfHoles != null && (
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {course.numbersOfHoles} hole{course.numbersOfHoles !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
                {course.courseLocation && (
                  <p className="text-sm text-muted-foreground">{course.courseLocation}</p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1">
                  {course.tees.slice(0, 5).map((tee) => (
                    <Badge key={tee.id} variant="secondary" className="text-xs">
                      {tee.name || tee.gender || "Tee"}: {tee.courseRating ?? "—"} / {tee.slope ?? "—"}
                    </Badge>
                  ))}
                  {course.tees.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{course.tees.length - 5} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      )}
      {totalPages > 1 && (
        <PaginationLinks params={params} page={page} totalPages={totalPages} />
      )}
    </main>
  );
}
