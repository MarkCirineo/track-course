import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { CourseFilters } from "@/components/course-filters";
import { CourseCard } from "@/components/course-card";

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

  const teeConditions: {
    courseRating?: { gte?: number; lte?: number };
    slope?: { gte?: number; lte?: number };
    gender?: string;
  } = {};
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

  const session = await auth();
  const userId = session?.user?.id;

  const [courses, total, bookmarks, favorites, plays] = await Promise.all([
    db.course.findMany({
      where,
      include: {
        tees: true,
        holes: { orderBy: { holeIndex: "asc" }, select: { id: true, holeIndex: true } },
      },
      orderBy: { displayName: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.course.count({ where }),
    userId
      ? db.bookmark.findMany({
          where: { userId },
          select: { courseId: true, note: true },
        })
      : Promise.resolve([]),
    userId
      ? db.favorite.findMany({
          where: { userId },
          select: { courseId: true },
        })
      : Promise.resolve([]),
    userId
      ? db.coursePlay.findMany({
          where: { userId },
          select: { courseId: true, holesPlayed: true, playedAt: true },
          orderBy: { playedAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const bookmarkedSet = new Set(bookmarks.map((b) => b.courseId));
  const bookmarkNoteByCourse = new Map(bookmarks.map((b) => [b.courseId, b.note]));
  const favoriteSet = new Set(favorites.map((f) => f.courseId));
  const playByCourse = new Map<string, { holesPlayed: string }>();
  for (const p of plays) {
    if (!playByCourse.has(p.courseId)) {
      playByCourse.set(p.courseId, { holesPlayed: p.holesPlayed });
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Courses</h1>
      <CourseFilters />
      <p className="mt-4 text-muted-foreground">
        {total} course{total !== 1 ? "s" : ""} found
      </p>
      {courses.length === 0 ? (
        <p className="mt-6 text-muted-foreground">
          No courses match your filters. Try adjusting search or filter values, or run a sync to
          load data.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={{
                id: course.id,
                displayName: course.displayName,
                numbersOfHoles: course.numbersOfHoles,
                courseLocation: course.courseLocation,
                imageUrl: course.imageUrl,
                tees: course.tees.map((t) => ({
                  id: t.id,
                  name: t.name,
                  gender: t.gender,
                  courseRating: t.courseRating,
                  slope: t.slope,
                })),
                holes: course.holes,
              }}
              isBookmarked={bookmarkedSet.has(course.id)}
              bookmarkNote={bookmarkNoteByCourse.get(course.id) ?? null}
              isFavorite={favoriteSet.has(course.id)}
              playedSummary={{
                played: playByCourse.has(course.id),
                lastHolesPlayed: playByCourse.get(course.id)?.holesPlayed as
                  | "front"
                  | "back"
                  | "full"
                  | undefined,
              }}
              isLoggedIn={!!userId}
            />
          ))}
        </div>
      )}
      {totalPages > 1 && <PaginationLinks params={params} page={page} totalPages={totalPages} />}
    </main>
  );
}
