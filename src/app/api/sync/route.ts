import { NextRequest, NextResponse } from "next/server";
import { getCoursesList, type TrackmanCourseItem } from "@/lib/trackman-api";
import { db } from "@/lib/db";

function getCronSecret(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return request.nextUrl.searchParams.get("secret") ?? null;
}

async function syncOneCourse(item: TrackmanCourseItem, now: Date) {
  const course = await db.course.upsert({
    where: { trackmanId: item.id },
    create: mapCourseCreate(item, now),
    update: mapCourseUpdate(item, now),
  });

  await db.hole.deleteMany({ where: { courseId: course.id } });
  await db.tee.deleteMany({ where: { courseId: course.id } });

  const tees = item.tees ?? [];
  let teeIds: string[] = [];
  if (tees.length > 0) {
    await db.tee.createMany({
      data: tees.map((t, idx) => ({
        courseId: course.id,
        teeIndex: idx,
        par: t.par ?? undefined,
        courseDistance: t.courseDistance ?? undefined,
        courseRating: t.courseRating ?? undefined,
        slope: t.slope ?? undefined,
        gender: t.gender ?? undefined,
        kind: t.kind ?? undefined,
        name: t.name ?? undefined,
      })),
    });
    const createdTees = await db.tee.findMany({
      where: { courseId: course.id },
      orderBy: { teeIndex: "asc" },
      select: { id: true },
    });
    teeIds = createdTees.map((t) => t.id);
  }

  const holes = item.holes ?? [];
  const createdHoles =
    holes.length === 0
      ? []
      : await Promise.all(
          holes.map((holeItem, i) =>
            db.hole.create({
              data: {
                courseId: course.id,
                name: holeItem.name ?? undefined,
                holeIndex: i,
              },
            })
          )
        );

  const holeTeesData: Array<{
    holeId: string;
    teeId: string;
    distance: number | undefined;
    strokeIndex: number | undefined;
    par: number | undefined;
  }> = [];
  for (let i = 0; i < createdHoles.length; i++) {
    const hole = createdHoles[i];
    const holeItem = holes[i];
    const holeTees = holeItem.tees ?? [];
    for (let j = 0; j < holeTees.length && j < teeIds.length; j++) {
      const ht = holeTees[j];
      holeTeesData.push({
        holeId: hole.id,
        teeId: teeIds[j],
        distance: ht.distance ?? undefined,
        strokeIndex: ht.strokeIndex ?? undefined,
        par: ht.par ?? undefined,
      });
    }
  }
  if (holeTeesData.length > 0) {
    await db.holeTee.createMany({
      data: holeTeesData,
    });
  }
}

export async function POST(request: NextRequest) {
  const secret = getCronSecret(request);
  const expected = process.env.CRON_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const CONCURRENCY = 10; // courses at a time

  try {
    const items = await getCoursesList(0, 8000);
    const now = new Date();

    for (let i = 0; i < items.length; i += CONCURRENCY) {
      const chunk = items.slice(i, i + CONCURRENCY);
      await Promise.all(chunk.map((item) => syncOneCourse(item, now)));
    }

    return NextResponse.json({
      ok: true,
      synced: items.length,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function mapCourseCreate(item: TrackmanCourseItem, syncedAt: Date) {
  const loc = item.worldLocation;
  return {
    trackmanId: item.id,
    dbId: item.dbId ?? undefined,
    createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
    description: item.description ?? undefined,
    displayName: item.displayName,
    numbersOfHoles: item.numbersOfHoles ?? undefined,
    courseLocation: item.courseLocation ?? undefined,
    difficulty: item.difficulty ?? undefined,
    tags: item.tags ?? [],
    imageUrl: item.image?.url ?? undefined,
    videoUrl: item.video?.url ?? undefined,
    latitude: loc?.latitude ?? undefined,
    longitude: loc?.longitude ?? undefined,
    googleMapUrl: loc?.googleMapUrl ?? undefined,
    syncedAt,
  };
}

function mapCourseUpdate(item: TrackmanCourseItem, syncedAt: Date) {
  const loc = item.worldLocation;
  return {
    dbId: item.dbId ?? undefined,
    description: item.description ?? undefined,
    displayName: item.displayName,
    numbersOfHoles: item.numbersOfHoles ?? undefined,
    courseLocation: item.courseLocation ?? undefined,
    difficulty: item.difficulty ?? undefined,
    tags: item.tags ?? [],
    imageUrl: item.image?.url ?? undefined,
    videoUrl: item.video?.url ?? undefined,
    latitude: loc?.latitude ?? undefined,
    longitude: loc?.longitude ?? undefined,
    googleMapUrl: loc?.googleMapUrl ?? undefined,
    syncedAt,
  };
}
