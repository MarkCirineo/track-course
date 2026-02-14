"use client";

import { Fragment } from "react";
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
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type HoleTee = { teeId: string; par: number | null; distance: number | null; strokeIndex: number | null };
type HoleForScorecard = { id: string; holeIndex: number; holeTees: HoleTee[] };
type HoleScoreForPlay = { holeId: string; score: number; hole: { holeIndex: number } };

type PlayScorecardModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  play: {
    playedAt: Date;
    tee: { id: string; name: string | null };
    holesPlayed: string;
    overallScore: number | null;
    note: string | null;
    holeScores: HoleScoreForPlay[];
  };
  holes: HoleForScorecard[];
};

export function PlayScorecardModal({
  open,
  onOpenChange,
  courseName,
  play,
  holes,
}: PlayScorecardModalProps) {
  const teeId = play.tee.id;
  const scoreByHoleId = new Map(play.holeScores.map((hs) => [hs.holeId, hs.score]));

  const isFront = play.holesPlayed === "front";
  const isBack = play.holesPlayed === "back";
  const holesToShow = isFront
    ? holes.filter((h) => h.holeIndex < 9)
    : isBack
      ? holes.filter((h) => h.holeIndex >= 9)
      : holes;

  const holeTee = (hole: HoleForScorecard) =>
    hole.holeTees.find((ht) => ht.teeId === teeId) ?? null;
  const getPar = (hole: HoleForScorecard) => holeTee(hole)?.par ?? null;
  const getDistance = (hole: HoleForScorecard) => holeTee(hole)?.distance ?? null;
  const getStrokeIndex = (hole: HoleForScorecard) => holeTee(hole)?.strokeIndex ?? null;
  const getScore = (hole: HoleForScorecard) => scoreByHoleId.get(hole.id) ?? null;

  const outHoles = holesToShow.filter((h) => h.holeIndex < 9);
  const inHoles = holesToShow.filter((h) => h.holeIndex >= 9);
  const isFull18 = outHoles.length > 0 && inHoles.length > 0;

  const sumPar = (holeList: HoleForScorecard[]) =>
    holeList.reduce((s, h) => s + (getPar(h) ?? 0), 0);
  const sumScore = (holeList: HoleForScorecard[]) =>
    holeList.reduce((s, h) => s + (getScore(h) ?? 0), 0);

  const totalPar = sumPar(holesToShow);
  const totalScore = sumScore(holesToShow);
  const totalToPar = totalPar > 0 ? totalScore - totalPar : null;

  const formatToPar = (n: number) => (n === 0 ? "E" : n > 0 ? `+${n}` : String(n));

  type ScoreStyle = "double-square" | "single-square" | "single-circle" | "double-circle" | null;
  const getScoreStyle = (par: number | null, score: number | null): ScoreStyle => {
    if (par == null || score == null) return null;
    const diff = score - par;
    if (diff >= 2) return "double-square";
    if (diff === 1) return "single-square";
    if (diff === 0) return null;
    if (diff === -1) return "single-circle";
    return "double-circle";
  };

  const border = "border-foreground";
  const ScoreCell = ({ par, score }: { par: number | null; score: number | null }) => {
    const style = getScoreStyle(par, score);
    const content = score ?? "—";
    if (content === "—") return <span>—</span>;
    const base = "inline-flex items-center justify-center font-medium tabular-nums";
    if (style === "double-square")
      return (
        <span className={cn(base, "size-8 rounded-sm border p-0.5", border)}>
          <span className={cn("flex size-6 items-center justify-center rounded-sm border text-sm", border)}>
            {content}
          </span>
        </span>
      );
    if (style === "single-square")
      return (
        <span className={cn(base, "size-7 rounded-sm border px-1 text-sm", border)}>
          {content}
        </span>
      );
    if (style === "single-circle")
      return (
        <span className={cn(base, "size-7 rounded-full border px-1 text-sm", border)}>
          {content}
        </span>
      );
    if (style === "double-circle")
      return (
        <span className={cn(base, "size-8 rounded-full border p-0.5", border)}>
          <span className={cn("flex size-5 items-center justify-center rounded-full border text-xs", border)}>
            {content}
          </span>
        </span>
      );
    return <span className={cn(base, "min-w-[1.5rem] text-sm")}>{content}</span>;
  };

  const dateStr = new Date(play.playedAt).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Scorecard — {courseName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {dateStr} · {play.tee.name || "Tee"} ·{" "}
            {play.holesPlayed === "front"
              ? "Front 9"
              : play.holesPlayed === "back"
                ? "Back 9"
                : "Full 18"}
          </p>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Hole</TableHead>
              <TableHead className="text-right">Par</TableHead>
              <TableHead className="text-right">SI</TableHead>
              <TableHead className="text-right">Dist</TableHead>
              <TableHead className="text-right">
                <span className="inline-flex items-center gap-1">
                  Score
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          tabIndex={-1}
                          className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label="Score legend"
                        >
                          <Info className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="max-w-[200px] p-3"
                      >
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex size-5 items-center justify-center rounded-full border-2 border-background p-0.5">
                              <span className="flex size-3 items-center justify-center rounded-full border border-background text-[10px]">2</span>
                            </span>
                            <span>Eagle or better</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex size-5 items-center justify-center rounded-full border-2 border-background text-[10px]">3</span>
                            <span>Birdie</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex min-w-[1rem] items-center justify-center text-[10px]">4</span>
                            <span>Par</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex size-5 items-center justify-center rounded-sm border-2 border-background px-0.5 text-[10px]">5</span>
                            <span>Bogey</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex size-5 items-center justify-center rounded-sm border-2 border-background p-0.5">
                              <span className="flex size-3 items-center justify-center rounded-sm border border-background text-[10px]">6</span>
                            </span>
                            <span>Double bogey+</span>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holesToShow.map((hole) => {
              const holeNum = hole.holeIndex + 1;
              const par = getPar(hole);
              const score = getScore(hole);
              const isHole9 = isFull18 && hole.holeIndex === 8;
              return (
                <Fragment key={hole.id}>
                  <TableRow>
                    <TableCell>{holeNum}</TableCell>
                    <TableCell className="text-right">{par ?? "—"}</TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">
                      {getStrokeIndex(hole) ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">
                      {getDistance(hole) != null ? `${getDistance(hole)} yd` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <ScoreCell par={par} score={score} />
                    </TableCell>
                  </TableRow>
                  {isHole9 && (
                    <TableRow
                      className="border-t-2 border-border bg-muted/30 font-medium"
                    >
                      <TableCell>Out</TableCell>
                      <TableCell className="text-right">
                        {sumPar(outHoles) || "—"}
                      </TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell className="text-right">
                        {sumScore(outHoles) || "—"}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
          <TableFooter>
            {isFull18 && (
              <TableRow className="border-t-2 border-border font-medium">
                <TableCell>In</TableCell>
                <TableCell className="text-right">
                  {sumPar(inHoles) || "—"}
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell className="text-right">
                  {sumScore(inHoles) || "—"}
                </TableCell>
              </TableRow>
            )}
            <TableRow className="border-t border-border font-medium">
              <TableCell>Total</TableCell>
              <TableCell className="text-right">{totalPar || "—"}</TableCell>
              <TableCell />
              <TableCell />
              <TableCell className="text-right">{totalScore || "—"}</TableCell>
            </TableRow>
            <TableRow className="border-t-2 border-border font-medium">
              <TableCell>Net</TableCell>
              <TableCell />
              <TableCell />
              <TableCell />
              <TableCell
                className={cn(
                  "text-right tabular-nums font-medium",
                  totalToPar != null &&
                    (totalToPar > 0
                      ? "text-destructive"
                      : totalToPar < 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-muted-foreground")
                )}
              >
                {totalToPar != null ? formatToPar(totalToPar) : "—"}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
        {play.overallScore != null && (
          <p className="text-sm text-muted-foreground">
            Overall score: {play.overallScore}
          </p>
        )}
        {play.note && (
          <p className="text-sm text-muted-foreground">
            Note: {play.note}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
