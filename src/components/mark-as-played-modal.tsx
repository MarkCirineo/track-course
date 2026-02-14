"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCoursePlay } from "@/app/actions/course-play";
import { toast } from "sonner";

export type TeeForPlay = {
  id: string;
  name: string | null;
  gender: string | null;
  courseRating: number | null;
  slope: number | null;
};

export type HoleForPlay = {
  id: string;
  holeIndex: number;
};

type MarkAsPlayedModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseName: string;
  numbersOfHoles: number | null;
  tees: TeeForPlay[];
  holes: HoleForPlay[];
  onSuccess?: (addedToFavorites: boolean) => void;
};

export function MarkAsPlayedModal({
  open,
  onOpenChange,
  courseId,
  courseName,
  numbersOfHoles,
  tees,
  holes,
  onSuccess,
}: MarkAsPlayedModalProps) {
  const [teeId, setTeeId] = useState<string>("");
  const [holesPlayed, setHolesPlayed] = useState<"front" | "back" | "full">("full");
  const [overallScore, setOverallScore] = useState<string>("");
  const [note, setNote] = useState("");
  const [addToFavorites, setAddToFavorites] = useState(false);
  const [holeScores, setHoleScores] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const is9Hole = numbersOfHoles === 9;
  const holesToShow =
    holesPlayed === "front"
      ? holes.filter((h) => h.holeIndex < 9)
      : holesPlayed === "back"
        ? holes.filter((h) => h.holeIndex >= 9)
        : holes;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teeId) {
      toast.error("Please select tees");
      return;
    }
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
      const result = await createCoursePlay({
        courseId,
        teeId,
        holesPlayed,
        overallScore: scoreNum,
        note: note.trim() || null,
        holeScores: Object.keys(holeScoresNum).length > 0 ? holeScoresNum : undefined,
        addToFavorites,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Marked as played");
      if (addToFavorites) toast.success("Added to favorites");
      onOpenChange(false);
      setTeeId("");
      setHolesPlayed("full");
      setOverallScore("");
      setNote("");
      setAddToFavorites(false);
      setHoleScores({});
      onSuccess?.(addToFavorites);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mark as played — {courseName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Tees *</label>
            <Select value={teeId} onValueChange={setTeeId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select tees" />
              </SelectTrigger>
              <SelectContent>
                {tees.map((tee) => (
                  <SelectItem key={tee.id} value={tee.id}>
                    {tee.name || tee.gender || "Tee"}: {tee.courseRating ?? "—"} /{" "}
                    {tee.slope ?? "—"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!is9Hole && (
            <div>
              <label className="mb-1 block text-sm font-medium">Holes played</label>
              <Select
                value={holesPlayed}
                onValueChange={(v) => setHolesPlayed(v as "front" | "back" | "full")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front">Front 9</SelectItem>
                  <SelectItem value="back">Back 9</SelectItem>
                  <SelectItem value="full">Full 18</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

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

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={addToFavorites}
              onChange={(e) => setAddToFavorites(e.target.checked)}
              className="rounded border-input"
            />
            <span className="text-sm">Add to favorites</span>
          </label>

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
