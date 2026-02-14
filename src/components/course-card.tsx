"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Bookmark,
  BookmarkCheck,
  Star,
  StarOff,
  CircleCheck,
  PlusCircle,
  FileText,
} from "lucide-react";
import { addBookmark, removeBookmark } from "@/app/actions/bookmarks";
import { addFavorite, removeFavorite } from "@/app/actions/favorites";
import { toast } from "sonner";
import { MarkAsPlayedModal } from "@/components/mark-as-played-modal";
import { BookmarkNoteModal } from "@/components/bookmark-note-modal";

export type TeeForCard = {
  id: string;
  name: string | null;
  gender: string | null;
  courseRating: number | null;
  slope: number | null;
};

export type HoleForCard = {
  id: string;
  holeIndex: number;
};

export type CourseForCard = {
  id: string;
  displayName: string;
  numbersOfHoles: number | null;
  courseLocation: string | null;
  imageUrl: string | null;
  tees: TeeForCard[];
  holes: HoleForCard[];
};

export type PlayedSummary = {
  played: boolean;
  lastHolesPlayed?: "front" | "back" | "full";
};

type CourseCardProps = {
  course: CourseForCard;
  isBookmarked: boolean;
  bookmarkNote: string | null;
  isFavorite: boolean;
  playedSummary: PlayedSummary;
  isLoggedIn?: boolean;
};

export function CourseCard({
  course,
  isBookmarked,
  bookmarkNote,
  isFavorite,
  playedSummary,
  isLoggedIn = true,
}: CourseCardProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [note, setNote] = useState(bookmarkNote);
  const [favorited, setFavorited] = useState(isFavorite);
  const [markAsPlayedOpen, setMarkAsPlayedOpen] = useState(false);
  const [bookmarkNoteOpen, setBookmarkNoteOpen] = useState(false);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarked) {
      const result = await removeBookmark(course.id);
      if (result.error) toast.error(result.error);
      else {
        setBookmarked(false);
        setNote(null);
        toast.success("Removed from bookmarks");
      }
    } else {
      const result = await addBookmark(course.id);
      if (result.error) toast.error(result.error);
      else {
        setBookmarked(true);
        toast.success("Course bookmarked", {
          action: {
            label: "Add a note",
            onClick: () => setBookmarkNoteOpen(true),
          },
        });
      }
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorited) {
      const result = await removeFavorite(course.id);
      if (result.error) toast.error(result.error);
      else {
        setFavorited(false);
        toast.success("Removed from favorites");
      }
    } else {
      const result = await addFavorite(course.id);
      if (result.error) toast.error(result.error);
      else {
        setFavorited(true);
        toast.success("Added to favorites");
      }
    }
  };

  const handleMarkAsPlayedSuccess = (addedToFavorites: boolean) => {
    if (addedToFavorites) setFavorited(true);
  };

  const canFavorite = playedSummary.played;

  return (
    <>
      <div className="relative h-full">
        <Link href={`/courses/${course.id}`} className="block h-full">
          <Card
            className={cn("h-full transition-colors hover:bg-muted/50", course.imageUrl && "pt-0")}
          >
            {course.imageUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={course.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold leading-tight pr-8">{course.displayName}</h2>
                {course.numbersOfHoles != null && (
                  <Badge variant="outline" className="shrink-0 bg-muted/50 text-xs">
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
                  <Badge key={tee.id} variant="secondary" className="bg-muted text-xs">
                    {tee.name || tee.gender || "Tee"}: {tee.courseRating ?? "—"} /{" "}
                    {tee.slope ?? "—"}
                  </Badge>
                ))}
                {course.tees.length > 5 && (
                  <Badge variant="outline" className="bg-muted/50 text-xs">
                    +{course.tees.length - 5} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
        {isLoggedIn && (
          <div className="absolute right-2 top-2 flex gap-1" onClick={(e) => e.preventDefault()}>
            <Button
              variant="secondary"
              size="icon-xs"
              className="size-8 rounded-full bg-white/90 text-gray-900 shadow dark:bg-black/85 dark:text-white"
              onClick={handleBookmarkClick}
              title={bookmarked ? "Remove bookmark" : "Bookmark"}
            >
              {bookmarked ? (
                <BookmarkCheck className="size-4 fill-gray-900 dark:fill-white" />
              ) : (
                <Bookmark className="size-4" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="icon-xs"
              className="size-8 rounded-full bg-white/90 text-gray-900 shadow dark:bg-black/85 dark:text-white"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMarkAsPlayedOpen(true);
              }}
              title="Mark as played"
            >
              <PlusCircle className="size-4" />
            </Button>
            {canFavorite && (
              <Button
                variant="secondary"
                size="icon-xs"
                className="size-8 rounded-full bg-white/90 text-gray-900 shadow dark:bg-black/85 dark:text-white"
                onClick={handleFavoriteClick}
                title={favorited ? "Remove from favorites" : "Add to favorites"}
              >
                {favorited ? (
                  <Star className="size-4 fill-gray-900 dark:fill-white" />
                ) : (
                  <StarOff className="size-4" />
                )}
              </Button>
            )}
            {bookmarked && (
              <Button
                variant="secondary"
                size="icon-xs"
                className="size-8 rounded-full bg-white/90 text-gray-900 shadow dark:bg-black/85 dark:text-white"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setBookmarkNoteOpen(true);
                }}
                title={note ? "Edit note" : "Add note"}
              >
                <FileText className={cn("size-4", note && "fill-gray-900 dark:fill-white")} />
              </Button>
            )}
          </div>
        )}
        {isLoggedIn && playedSummary.played && (
          <div
            className="absolute left-2 top-2 flex items-center gap-0.5 rounded bg-white/90 px-1.5 py-0.5 text-xs text-gray-900 shadow dark:bg-black/85 dark:text-white"
            title={
              playedSummary.lastHolesPlayed ? `Played ${playedSummary.lastHolesPlayed}` : "Played"
            }
          >
            <CircleCheck className="size-3.5" />
            {playedSummary.lastHolesPlayed === "front" && <span>F9</span>}
            {playedSummary.lastHolesPlayed === "back" && <span>B9</span>}
            {playedSummary.lastHolesPlayed === "full" && (
              <span>{course.numbersOfHoles === 9 ? "9" : "18"}</span>
            )}
          </div>
        )}
      </div>

      <MarkAsPlayedModal
        open={markAsPlayedOpen}
        onOpenChange={setMarkAsPlayedOpen}
        courseId={course.id}
        courseName={course.displayName}
        numbersOfHoles={course.numbersOfHoles}
        tees={course.tees}
        holes={course.holes}
        onSuccess={handleMarkAsPlayedSuccess}
      />

      <BookmarkNoteModal
        open={bookmarkNoteOpen}
        onOpenChange={setBookmarkNoteOpen}
        courseId={course.id}
        courseName={course.displayName}
        initialNote={note}
        onSuccess={(savedNote) => setNote(savedNote)}
      />
    </>
  );
}
