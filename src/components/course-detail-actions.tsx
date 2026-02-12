"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Star, StarOff, PlusCircle, FileText } from "lucide-react";
import { addBookmark, removeBookmark } from "@/app/actions/bookmarks";
import { addFavorite, removeFavorite } from "@/app/actions/favorites";
import { toast } from "sonner";
import { MarkAsPlayedModal } from "@/components/mark-as-played-modal";
import { BookmarkNoteModal } from "@/components/bookmark-note-modal";
import { cn } from "@/lib/utils";

type TeeForPlay = {
  id: string;
  name: string | null;
  gender: string | null;
  courseRating: number | null;
  slope: number | null;
};

type HoleForPlay = {
  id: string;
  holeIndex: number;
};

type CourseDetailActionsProps = {
  courseId: string;
  courseName: string;
  numbersOfHoles: number | null;
  tees: TeeForPlay[];
  holes: HoleForPlay[];
  initialBookmarked: boolean;
  initialBookmarkNote: string | null;
  initialFavorite: boolean;
  hasPlayed: boolean;
};

export function CourseDetailActions({
  courseId,
  courseName,
  numbersOfHoles,
  tees,
  holes,
  initialBookmarked,
  initialBookmarkNote,
  initialFavorite,
  hasPlayed,
}: CourseDetailActionsProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [note, setNote] = useState(initialBookmarkNote);
  const [favorited, setFavorited] = useState(initialFavorite);
  const [markAsPlayedOpen, setMarkAsPlayedOpen] = useState(false);
  const [bookmarkNoteOpen, setBookmarkNoteOpen] = useState(false);

  const handleBookmark = async () => {
    if (bookmarked) {
      const result = await removeBookmark(courseId);
      if (result.error) toast.error(result.error);
      else {
        setBookmarked(false);
        setNote(null);
        toast.success("Removed from bookmarks");
      }
    } else {
      const result = await addBookmark(courseId);
      if (result.error) toast.error(result.error);
      else {
        setBookmarked(true);
        toast.success("Course bookmarked", {
          action: { label: "Add a note", onClick: () => setBookmarkNoteOpen(true) },
        });
      }
    }
  };

  const handleFavorite = async () => {
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

  const canFavorite = hasPlayed;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleBookmark}>
          {bookmarked ? (
            <BookmarkCheck className="mr-1.5 size-4 text-primary" />
          ) : (
            <Bookmark className="mr-1.5 size-4" />
          )}
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setMarkAsPlayedOpen(true)}>
          <PlusCircle className="mr-1.5 size-4" />
          Mark as played
        </Button>
        {bookmarked && (
          <Button variant="outline" size="sm" onClick={() => setBookmarkNoteOpen(true)}>
            <FileText className={cn("mr-1.5 size-4", note && "text-primary")} />
            {note ? "Edit note" : "Add note"}
          </Button>
        )}
        {canFavorite && (
          <Button variant="outline" size="sm" onClick={handleFavorite}>
            {favorited ? (
              <Star className="mr-1.5 size-4 fill-primary text-primary" />
            ) : (
              <StarOff className="mr-1.5 size-4" />
            )}
            {favorited ? "Favorited" : "Add to favorites"}
          </Button>
        )}
      </div>

      <MarkAsPlayedModal
        open={markAsPlayedOpen}
        onOpenChange={setMarkAsPlayedOpen}
        courseId={courseId}
        courseName={courseName}
        numbersOfHoles={numbersOfHoles}
        tees={tees}
        holes={holes}
        onSuccess={(addedToFavorites) => {
          if (addedToFavorites) setFavorited(true);
        }}
      />

      <BookmarkNoteModal
        open={bookmarkNoteOpen}
        onOpenChange={setBookmarkNoteOpen}
        courseId={courseId}
        courseName={courseName}
        initialNote={note}
        onSuccess={(savedNote) => setNote(savedNote)}
      />
    </>
  );
}
