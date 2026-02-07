"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type HoleTee = {
  id: string;
  holeId: string;
  teeId: string;
  distance: number | null;
  strokeIndex: number | null;
  par: number | null;
};

type Hole = {
  id: string;
  name: string | null;
  holeIndex: number;
  holeTees: HoleTee[];
};

type Tee = {
  id: string;
  name: string | null;
  gender: string | null;
  par: number | null;
  courseDistance: number | null;
  courseRating: number | null;
  slope: number | null;
};

type CourseForScorecard = {
  displayName: string;
  tees: Tee[];
  holes: Hole[];
};

function TeeBadge({
  tee,
  onClick,
}: {
  tee: Tee;
  onClick: () => void;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "cursor-pointer text-sm transition-opacity hover:opacity-90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
      asChild
    >
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 font-normal"
      >
        {tee.name || "Tee"}: Rating {tee.courseRating ?? "—"} / Slope{" "}
        {tee.slope ?? "—"}
        {tee.par != null && ` · Par ${tee.par}`}
        {tee.courseDistance != null && ` · ${tee.courseDistance} yd`}
      </button>
    </Badge>
  );
}

export function TeeScorecardSection({
  course,
}: {
  course: CourseForScorecard;
}) {
  const [scorecardTee, setScorecardTee] = useState<Tee | null>(null);

  const menTees = course.tees.filter((t) => t.gender === "MALE");
  const womenTees = course.tees.filter((t) => t.gender === "FEMALE");
  const otherTees = course.tees.filter(
    (t) => t.gender !== "MALE" && t.gender !== "FEMALE"
  );

  const openScorecard = (tee: Tee) => setScorecardTee(tee);
  const closeScorecard = () => setScorecardTee(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Men&apos;s tees
          </h3>
          <div className="flex flex-wrap gap-2">
            {menTees.length > 0 ? (
              menTees.map((tee) => (
                <TeeBadge
                  key={tee.id}
                  tee={tee}
                  onClick={() => openScorecard(tee)}
                />
              ))
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Women&apos;s tees
          </h3>
          <div className="flex flex-wrap gap-2">
            {womenTees.length > 0 ? (
              womenTees.map((tee) => (
                <TeeBadge
                  key={tee.id}
                  tee={tee}
                  onClick={() => openScorecard(tee)}
                />
              ))
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>
        </div>
        {otherTees.length > 0 && (
          <div className="space-y-2 md:col-span-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Other tees
            </h3>
            <div className="flex flex-wrap gap-2">
              {otherTees.map((tee) => (
                <TeeBadge
                  key={tee.id}
                  tee={tee}
                  onClick={() => openScorecard(tee)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={scorecardTee !== null} onOpenChange={(open) => !open && closeScorecard()}>
        <DialogContent
          className="max-h-[90vh] max-w-2xl overflow-y-auto"
          aria-describedby={undefined}
        >
          {scorecardTee && (
            <>
              <DialogHeader>
                <DialogTitle id="scorecard-title">
                  Scorecard: {scorecardTee.name || "Tee"} — {course.displayName}
                </DialogTitle>
              </DialogHeader>
              {course.holes.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No hole data for this tee.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hole</TableHead>
                      <TableHead className="text-right">Par</TableHead>
                      <TableHead className="text-right">Stroke index</TableHead>
                      <TableHead className="text-right">Distance (yd)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {course.holes.map((hole) => {
                      const holeTee = hole.holeTees.find(
                        (ht) => ht.teeId === scorecardTee.id
                      );
                      return (
                        <TableRow key={hole.id}>
                          <TableCell>
                            {hole.holeIndex + 1}
                            {hole.name ? ` — ${hole.name}` : ""}
                          </TableCell>
                          <TableCell className="text-right">
                            {holeTee?.par ?? "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {holeTee?.strokeIndex ?? "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {holeTee?.distance ?? "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-medium">Total</TableCell>
                      <TableCell className="text-right">
                        {course.holes.reduce((sum, hole) => {
                          const ht = hole.holeTees.find(
                            (h) => h.teeId === scorecardTee.id
                          );
                          return sum + (ht?.par ?? 0);
                        }, 0) || "—"}
                      </TableCell>
                      <TableCell />
                      <TableCell className="text-right">
                        {course.holes.reduce((sum, hole) => {
                          const ht = hole.holeTees.find(
                            (h) => h.teeId === scorecardTee.id
                          );
                          return sum + (ht?.distance ?? 0);
                        }, 0) || "—"}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
