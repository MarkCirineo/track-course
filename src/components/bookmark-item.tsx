"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookmarkCheck, FileText, Star, StarOff } from "lucide-react";
import { addFavorite, removeFavorite } from "@/app/actions/favorites";
import { removeBookmark } from "@/app/actions/bookmarks";
import { toast } from "sonner";
import { BookmarkNoteModal } from "@/components/bookmark-note-modal";
import { updateBookmarkNote } from "@/app/actions/bookmarks";
import { cn } from "@/lib/utils";

type BookmarkItemProps = {
  courseId: string;
  courseName: string;
  numbersOfHoles: number | null;
  courseLocation: string | null;
  imageUrl: string | null;
  note: string | null;
  isFavorite: boolean;
  canFavorite: boolean;
};

export function BookmarkItem({
  courseId,
  courseName,
  numbersOfHoles,
  courseLocation,
  imageUrl,
  note,
  isFavorite,
  canFavorite,
}: BookmarkItemProps) {
  const [favorited, setFavorited] = useState(isFavorite);
  const [noteValue, setNoteValue] = useState(note);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorited) {
      const result = await removeFavorite(courseId);
      if (result.error) toast.error(result.error);
      else {
        setFavorited(false);
        toast.success("Removed from favorites");
      }
    } else {
      const result = await addFavorite(courseId);
      if (result.error) toast.error(result.error);
      else {
        setFavorited(true);
        toast.success("Added to favorites");
      }
    }
  };

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <Link
          href={`/courses/${courseId}`}
          className="flex gap-3 p-3 transition-colors hover:bg-muted/50"
        >
          <div className="size-20 shrink-0 overflow-hidden rounded-md bg-muted">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground text-xs">
                No image
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold leading-tight">{courseName}</h2>
                {courseLocation && (
                  <p className="text-sm text-muted-foreground">{courseLocation}</p>
                )}
              </div>
              {numbersOfHoles != null && (
                <Badge variant="outline" className="shrink-0 text-xs">
                  {numbersOfHoles} hole{numbersOfHoles !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setNoteModalOpen(true);
                }}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <FileText className={cn("size-3.5", noteValue && "fill-current")} />
                {noteValue ? "Edit note" : "Add note"}
              </button>
              {canFavorite && (
                <button
                  type="button"
                  onClick={handleFavorite}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {favorited ? (
                    <Star className="size-3.5 fill-current" />
                  ) : (
                    <StarOff className="size-3.5" />
                  )}
                  {favorited ? "Favorited" : "Add to favorites"}
                </button>
              )}
            </div>
          </div>
        </Link>
        {noteValue && (
          <div className="border-t bg-muted/30 px-3 py-2">
            <p className="line-clamp-5 text-sm text-foreground/90">{noteValue}</p>
          </div>
        )}
      </div>

      <BookmarkNoteModal
        open={noteModalOpen}
        onOpenChange={setNoteModalOpen}
        courseId={courseId}
        courseName={courseName}
        initialNote={noteValue}
        onSuccess={(savedNote) => setNoteValue(savedNote)}
      />
    </>
  );
}
