"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateCoursePlay } from "@/app/actions/course-play";
import { toast } from "sonner";

type HoleForEdit = { id: string; holeIndex: number };
type HoleScoreForPlay = { holeId: string; score: number; hole: { holeIndex: number } };

type EditPlayModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  play: {
    id: string;
    playedAt: Date;
    tee: { name: string | null };
    holesPlayed: string;
    overallScore: number | null;
    note: string | null;
    holeScores: HoleScoreForPlay[];
  };
  holes: HoleForEdit[];
  onSuccess?: () => void;
};

export function EditPlayModal({
  open,
  onOpenChange,
  courseName,
  play,
  holes,
  onSuccess,
}: EditPlayModalProps) {
  const [overallScore, setOverallScore] = useState("");
  const [note, setNote] = useState("");
  const [holeScores, setHoleScores] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setOverallScore(play.overallScore != null ? String(play.overallScore) : "");
      setNote(play.note ?? "");
      const scores: Record<string, string> = {};
      for (const hs of play.holeScores) {
        scores[hs.holeId] = String(hs.score);
      }
      setHoleScores(scores);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, play.id]);

  const isFront = play.holesPlayed === "front";
  const isBack = play.holesPlayed === "back";
  const holesToShow = isFront
    ? holes.filter((h) => h.holeIndex < 9)
    : isBack
      ? holes.filter((h) => h.holeIndex >= 9)
      : holes;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const scoreNum = overallScore.trim() ? parseInt(overallScore, 10) : undefined;
    const holeScoresNum: Record<string, number> = {};
    for (const [hid, val] of Object.entries(holeScores)) {
      const n = parseInt(val, 10);
      if (Number.isFinite(n)) holeScoresNum[hid] = n;
    }

    // If both overall and per-hole are provided, validate they match
    const hasAllHoleScores =
      holesToShow.length > 0 &&
      holesToShow.every((h) => {
        const val = holeScores[h.id];
        const n = val != null ? parseInt(val, 10) : NaN;
        return Number.isFinite(n);
      });
    if (scoreNum != null && hasAllHoleScores) {
      const holeSum = holesToShow.reduce((sum, h) => sum + (holeScoresNum[h.id] ?? 0), 0);
      if (holeSum !== scoreNum) {
        toast.error(
          `Per-hole total (${holeSum}) doesn't match overall score (${scoreNum}). Please fix any typos.`
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const result = await updateCoursePlay({
        playId: play.id,
        overallScore: scoreNum ?? null,
        note: note.trim() || null,
        holeScores: holeScoresNum,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Play updated");
      onOpenChange(false);
      onSuccess?.();
    } finally {
      setSubmitting(false);
    }
  };

  const dateStr = new Date(play.playedAt).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit play — {courseName}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {dateStr} · {play.tee.name || "Tee"} ·{" "}
            {play.holesPlayed === "front"
              ? "Front 9"
              : play.holesPlayed === "back"
                ? "Back 9"
                : "Full 18"}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Overall score (optional)</label>
            <Input
              type="number"
              min={1}
              max={200}
              value={overallScore}
              onChange={(e) => setOverallScore(e.target.value)}
              placeholder="e.g. 85"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Per-hole scores (optional)</label>
            <p className="mb-2 text-xs text-muted-foreground">Add or edit scores for each hole</p>
            <div className="grid grid-cols-5 gap-1 sm:grid-cols-6">
              {holesToShow.map((hole) => (
                <div key={hole.id} className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">{hole.holeIndex + 1}</span>
                  <Input
                    type="number"
                    min={1}
                    max={15}
                    className="h-8 text-center text-sm"
                    value={holeScores[hole.id] ?? ""}
                    onChange={(e) =>
                      setHoleScores((prev) => ({
                        ...prev,
                        [hole.id]: e.target.value,
                      }))
                    }
                    placeholder="—"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Notes (optional)</label>
            <textarea
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Conditions, highlights..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
