"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const HOLES_PLAYED_VALUES = ["front", "back", "full"] as const;

type HolesPlayed = (typeof HOLES_PLAYED_VALUES)[number];

export type CreateCoursePlayInput = {
  courseId: string;
  teeId: string;
  holesPlayed: string;
  overallScore?: number | null;
  note?: string | null;
  holeScores?: Record<string, number>; // holeId -> score
  addToFavorites?: boolean;
};

export async function createCoursePlay(input: CreateCoursePlayInput) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const { courseId, teeId, holesPlayed, overallScore, note, holeScores, addToFavorites } = input;

  if (!HOLES_PLAYED_VALUES.includes(holesPlayed as HolesPlayed)) {
    return { error: "Invalid holes played" };
  }

  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: { tees: true, holes: { orderBy: { holeIndex: "asc" } } },
    });
    if (!course) return { error: "Course not found" };

    const tee = course.tees.find((t) => t.id === teeId);
    if (!tee) return { error: "Tee not found for this course" };

    const holesCount = course.numbersOfHoles ?? 18;
    if (holesCount === 9 && holesPlayed !== "full") {
      return { error: "9-hole courses only support full round" };
    }

    const play = await db.coursePlay.create({
      data: {
        userId: session.user.id,
        courseId,
        teeId,
        holesPlayed,
        overallScore: overallScore ?? undefined,
        note: note?.trim() || undefined,
      },
    });

    if (holeScores && Object.keys(holeScores).length > 0) {
      const holeIds = course.holes.map((h) => h.id);
      const validEntries = Object.entries(holeScores).filter(
        ([holeId, score]) => holeIds.includes(holeId) && Number.isFinite(score)
      );
      if (validEntries.length > 0) {
        await db.coursePlayHoleScore.createMany({
          data: validEntries.map(([holeId, score]) => ({
            coursePlayId: play.id,
            holeId,
            score: Number(score),
          })),
        });
      }
    }

    if (addToFavorites) {
      await db.favorite.upsert({
        where: {
          userId_courseId: { userId: session.user.id, courseId },
        },
        create: { userId: session.user.id, courseId },
        update: {},
      });
    }

    revalidatePath("/courses");
    revalidatePath("/account/played");
    revalidatePath("/account/favorites");
    revalidatePath(`/courses/${courseId}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to save play" };
  }
}

export type UpdateCoursePlayInput = {
  playId: string;
  overallScore?: number | null;
  note?: string | null;
  holeScores?: Record<string, number>;
};

export async function updateCoursePlay(input: UpdateCoursePlayInput) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const { playId, overallScore, note, holeScores } = input;

  try {
    const play = await db.coursePlay.findFirst({
      where: { id: playId, userId: session.user.id },
      include: { course: { include: { holes: { orderBy: { holeIndex: "asc" } } } } },
    });
    if (!play) return { error: "Play not found" };

    await db.coursePlay.update({
      where: { id: playId },
      data: {
        overallScore: overallScore === undefined ? null : overallScore,
        note: note === undefined ? null : (note?.trim() || null),
      },
    });

    if (holeScores !== undefined) {
      await db.coursePlayHoleScore.deleteMany({
        where: { coursePlayId: playId },
      });
      const holeIds = play.course.holes.map((h) => h.id);
      const validEntries = Object.entries(holeScores).filter(
        ([holeId, score]) => holeIds.includes(holeId) && Number.isFinite(score)
      );
      if (validEntries.length > 0) {
        await db.coursePlayHoleScore.createMany({
          data: validEntries.map(([holeId, score]) => ({
            coursePlayId: playId,
            holeId,
            score: Number(score),
          })),
        });
      }
    }

    revalidatePath("/courses");
    revalidatePath("/account/played");
    revalidatePath(`/courses/${play.courseId}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update play" };
  }
}

export async function deleteCoursePlay(playId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const play = await db.coursePlay.findFirst({
      where: { id: playId, userId: session.user.id },
    });
    if (!play) return { error: "Play not found" };

    await db.coursePlay.delete({
      where: { id: playId },
    });

    revalidatePath("/courses");
    revalidatePath("/account/played");
    revalidatePath(`/courses/${play.courseId}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to delete play" };
  }
}
