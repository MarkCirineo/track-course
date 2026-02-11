"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addBookmark(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await db.bookmark.upsert({
      where: {
        userId_courseId: { userId: session.user.id, courseId },
      },
      create: { userId: session.user.id, courseId },
      update: {},
    });
    revalidatePath("/courses");
    revalidatePath("/account/bookmarks");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to add bookmark" };
  }
}

export async function removeBookmark(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await db.bookmark.deleteMany({
      where: { userId: session.user.id, courseId },
    });
    revalidatePath("/courses");
    revalidatePath("/account/bookmarks");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to remove bookmark" };
  }
}

export async function updateBookmarkNote(courseId: string, note: string | null) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await db.bookmark.upsert({
      where: {
        userId_courseId: { userId: session.user.id, courseId },
      },
      create: { userId: session.user.id, courseId, note: note || null },
      update: { note: note || null },
    });
    revalidatePath("/courses");
    revalidatePath("/account/bookmarks");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update note" };
  }
}
