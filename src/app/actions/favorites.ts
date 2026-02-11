"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addFavorite(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    const hasPlayed = await db.coursePlay.findFirst({
      where: { userId: session.user.id, courseId },
    });
    if (!hasPlayed) {
      return { error: "You must mark this course as played before favoriting" };
    }
    await db.favorite.upsert({
      where: {
        userId_courseId: { userId: session.user.id, courseId },
      },
      create: { userId: session.user.id, courseId },
      update: {},
    });
    revalidatePath("/courses");
    revalidatePath("/account/favorites");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to add favorite" };
  }
}

export async function removeFavorite(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await db.favorite.deleteMany({
      where: { userId: session.user.id, courseId },
    });
    revalidatePath("/courses");
    revalidatePath("/account/favorites");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to remove favorite" };
  }
}
