"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PlayHistoryList } from "@/components/play-history-list";

type HoleTee = {
  teeId: string;
  par: number | null;
  distance: number | null;
  strokeIndex: number | null;
};
type HoleForScorecard = { id: string; holeIndex: number; holeTees: HoleTee[] };
type PlayWithScores = {
  id: string;
  playedAt: Date;
  tee: { id: string; name: string | null; gender: string | null };
  holesPlayed: string;
  overallScore: number | null;
  note: string | null;
  holeScores: { holeId: string; score: number; hole: { holeIndex: number } }[];
};

type PlayedCourseItemProps = {
  courseId: string;
  courseName: string;
  numbersOfHoles: number | null;
  courseLocation: string | null;
  imageUrl: string | null;
  plays: PlayWithScores[];
  holes: HoleForScorecard[];
};

export function PlayedCourseItem({
  courseId,
  courseName,
  numbersOfHoles,
  courseLocation,
  imageUrl,
  plays,
  holes,
}: PlayedCourseItemProps) {
  return (
    <div className="rounded-lg border bg-card">
      <Link href={`/courses/${courseId}`} className="flex gap-3 p-3">
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
              {courseLocation && <p className="text-sm text-muted-foreground">{courseLocation}</p>}
            </div>
            {numbersOfHoles != null && (
              <Badge variant="outline" className="shrink-0 text-xs">
                {numbersOfHoles} hole{numbersOfHoles !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
      </Link>
      <div className="border-t px-3 py-2">
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">
          Play history ({plays.length})
        </h3>
        <PlayHistoryList plays={plays} holes={holes} courseName={courseName} showEditDelete />
      </div>
    </div>
  );
}
