import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCoursesList, type TrackmanCourseItem } from "@/lib/trackman-api";
import { db } from "@/lib/db";

function normalize(s: string | null | undefined): string {
  if (s == null || s === "") return "";
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function computeFingerprint(item: TrackmanCourseItem): string {
  const loc = item.worldLocation;
  const name = normalize(item.displayName);
  const location = normalize(item.courseLocation ?? "");
  const lat = loc?.latitude ?? "";
  const lng = loc?.longitude ?? "";
  const holes = item.numbersOfHoles ?? "";
  const raw = `${name}|${location}|${lat}|${lng}|${holes}`;
  return createHash("sha256").update(raw).digest("hex").slice(0, 32);
}

function computeNameLocationKey(item: TrackmanCourseItem): string {
  const name = normalize(item.displayName);
  const location = normalize(item.courseLocation ?? "");
  return `${name}|${location}`;
}

/** Find existing course by layered matching, or create. Caller must then update with latest data. */
async function findOrCreateCourse(
  item: TrackmanCourseItem,
  now: Date
): Promise<{ id: string }> {
  // 1) By trackmanId
  const byTrackman = await db.course.findUnique({
    where: { trackmanId: item.id },
    select: { id: true },
  });
  if (byTrackman) return byTrackman;

  const fingerprint = computeFingerprint(item);
  const nameLocationKey = computeNameLocationKey(item);

  // 2) By name + location (merge same course when Trackman changes id; different names = different courses)
  const byNameLocation = await db.course.findFirst({
    where: { syncNameLocationKey: nameLocationKey },
    select: { id: true },
  });
  if (byNameLocation) return byNameLocation;

  // 3) By full fingerprint
  const byFingerprint = await db.course.findUnique({
    where: { syncFingerprint: fingerprint },
    select: { id: true },
  });
  if (byFingerprint) return byFingerprint;

  // 4) Create new (no coord-only match: East/West at same venue would wrongly merge)
  const createData = mapCourseCreate(item, now);
  const course = await db.course.create({
    data: {
      ...createData,
      syncFingerprint: fingerprint,
      syncNameLocationKey: nameLocationKey,
    },
    select: { id: true },
  });
  return course;
}

function getCronSecret(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return request.nextUrl.searchParams.get("secret") ?? null;
}

async function syncOneCourse(item: TrackmanCourseItem, now: Date) {
  const course = await findOrCreateCourse(item, now);
  const fingerprint = computeFingerprint(item);
  const nameLocationKey = computeNameLocationKey(item);

  await db.course.update({
    where: { id: course.id },
    data: {
      trackmanId: item.id,
      ...mapCourseUpdate(item, now),
      syncFingerprint: fingerprint,
      syncNameLocationKey: nameLocationKey,
    },
  });

  const tees = item.tees ?? [];
  const teeIds: string[] = [];
  for (let idx = 0; idx < tees.length; idx++) {
    const t = tees[idx];
    const tee = await db.tee.upsert({
      where: {
        courseId_teeIndex: { courseId: course.id, teeIndex: idx },
      },
      create: {
        courseId: course.id,
        teeIndex: idx,
        par: t.par ?? undefined,
        courseDistance: t.courseDistance ?? undefined,
        courseRating: t.courseRating ?? undefined,
        slope: t.slope ?? undefined,
        gender: t.gender ?? undefined,
        kind: t.kind ?? undefined,
        name: t.name ?? undefined,
      },
      update: {
        par: t.par ?? undefined,
        courseDistance: t.courseDistance ?? undefined,
        courseRating: t.courseRating ?? undefined,
        slope: t.slope ?? undefined,
        gender: t.gender ?? undefined,
        kind: t.kind ?? undefined,
        name: t.name ?? undefined,
      },
    });
    teeIds.push(tee.id);
  }

  const holes = item.holes ?? [];
  const holeIds: string[] = [];
  for (let i = 0; i < holes.length; i++) {
    const holeItem = holes[i];
    const imageUrls =
      holeItem.images?.map((img) => img.url).filter((u): u is string => Boolean(u)) ?? [];
    const hole = await db.hole.upsert({
      where: {
        courseId_holeIndex: { courseId: course.id, holeIndex: i },
      },
      create: {
        courseId: course.id,
        name: holeItem.name ?? undefined,
        holeIndex: i,
        imageUrls,
      },
      update: {
        name: holeItem.name ?? undefined,
        imageUrls,
      },
    });
    holeIds.push(hole.id);
  }

  for (let i = 0; i < holeIds.length && i < holes.length; i++) {
    const holeItem = holes[i];
    const holeTees = holeItem.tees ?? [];
    for (let j = 0; j < holeTees.length && j < teeIds.length; j++) {
      const ht = holeTees[j];
      await db.holeTee.upsert({
        where: {
          holeId_teeId: { holeId: holeIds[i], teeId: teeIds[j] },
        },
        create: {
          holeId: holeIds[i],
          teeId: teeIds[j],
          distance: ht.distance ?? undefined,
          strokeIndex: ht.strokeIndex ?? undefined,
          par: ht.par ?? undefined,
        },
        update: {
          distance: ht.distance ?? undefined,
          strokeIndex: ht.strokeIndex ?? undefined,
          par: ht.par ?? undefined,
        },
      });
    }
  }
}

const LOG_EVERY = 50;

/** Runs in background; do not await. Fetches course list then syncs with progress logging. */
function runSyncInBackground() {
  void (async () => {
    try {
      const start = Date.now();
      console.log("[sync] Fetching course list...");
      const items = await getCoursesList(0, 8000);
      const total = items.length;
      const now = new Date();
      console.log(`[sync] Started: ${total} courses to sync`);
      // Process sequentially so same (name+location) merges to one row: second item finds first and updates instead of creating duplicate
      for (let i = 0; i < items.length; i++) {
        await syncOneCourse(items[i], now);
        if ((i + 1) % LOG_EVERY === 0 || i + 1 === total) {
          console.log(`[sync] Progress: ${i + 1} / ${total} courses`);
        }
      }
      const duration = Date.now() - start;
      console.log(`[sync] Done: ${total} courses synced in ${duration}ms`);
    } catch (e) {
      console.error("[sync] Failed:", e instanceof Error ? e.message : e);
    }
  })();
}

export async function POST(request: NextRequest) {
  const secret = getCronSecret(request);
  const expected = process.env.CRON_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  runSyncInBackground();
  return NextResponse.json(
    { ok: true, message: "Sync started in background. Check server logs for progress." },
    { status: 202 }
  );
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
