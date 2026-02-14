"use client";

import { useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type HoleTee = {
  id: string;
  holeId: string;
  teeId: string;
  distance: number | null;
  strokeIndex: number | null;
  par: number | null;
};

type Tee = {
  id: string;
  name: string | null;
  courseDistance: number | null;
  teeIndex: number;
};

type HoleForImages = {
  id: string;
  name: string | null;
  holeIndex: number;
  imageUrls: string[];
  holeTees: HoleTee[];
};

function getHoleLabel(hole: HoleForImages): string {
  const holeNum = hole.holeIndex + 1;
  const name = hole.name?.trim();
  return name && name !== String(holeNum) ? `${holeNum} — ${hole.name}` : String(holeNum);
}

function getFarthestTee(tees: Tee[]): Tee | undefined {
  return [...tees].sort((a, b) => {
    const distA = a.courseDistance ?? 0;
    const distB = b.courseDistance ?? 0;
    if (distB !== distA) return distB - distA;
    return a.teeIndex - b.teeIndex;
  })[0];
}

export function HoleImagesModal({
  holes,
  tees,
  triggerLabel = "View hole images",
}: {
  holes: HoleForImages[];
  tees: Tee[];
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const farthestTee = useMemo(() => getFarthestTee(tees), [tees]);
  const [selectedTee, setSelectedTee] = useState<Tee | null>(farthestTee ?? null);

  const hole = holes[currentIndex];
  const holeTee = hole ? hole.holeTees.find((ht) => ht.teeId === selectedTee?.id) : undefined;
  const hasImages = holes.some((h) => h.imageUrls.length > 0);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < holes.length - 1;

  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goNext = () => setCurrentIndex((i) => Math.min(holes.length - 1, i + 1));

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setCurrentIndex(0);
    if (next && farthestTee) setSelectedTee(farthestTee);
  };

  if (!hasImages) return null;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label={triggerLabel}
      >
        {triggerLabel}
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="flex max-h-[90vh] max-w-2xl flex-col gap-4 overflow-hidden"
          aria-describedby={undefined}
        >
          <DialogTitle id="hole-images-title">Hole images</DialogTitle>
          <DialogHeader>
            {tees.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {tees.map((tee) => (
                  <Badge
                    key={tee.id}
                    variant={selectedTee?.id === tee.id ? "default" : "secondary"}
                    className={cn(
                      "cursor-pointer text-sm font-normal transition-opacity hover:opacity-90",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                    asChild
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedTee(tee)}
                      className="inline-flex items-center gap-1"
                    >
                      {tee.name || "Tee"}
                      {tee.courseDistance != null && ` · ${tee.courseDistance} yd`}
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </DialogHeader>

          {holes.length === 0 ? (
            <p className="text-muted-foreground text-sm">No holes.</p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={goPrev}
                  disabled={!canGoPrev}
                  aria-label="Previous hole"
                >
                  <ChevronLeftIcon className="size-4" />
                </Button>
                <div className="min-w-0 flex-1 text-center">
                  <div>
                    <span className="font-medium">Hole {getHoleLabel(hole)}</span>
                    {selectedTee && (
                      <p className="text-muted-foreground mt-1 text-sm">
                        Par {holeTee?.par ?? "—"} · {holeTee?.distance ?? "—"} yd · SI{" "}
                        {holeTee?.strokeIndex ?? "—"}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={goNext}
                  disabled={!canGoNext}
                  aria-label="Next hole"
                >
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {hole.imageUrls.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center text-sm">
                    No images for this hole.
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {hole.imageUrls.map((url, i) => (
                      <div
                        key={`${hole.id}-${i}`}
                        className="overflow-hidden rounded-lg border bg-muted/30"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Hole ${getHoleLabel(hole)} image ${i + 1}`}
                          className="h-auto w-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-center gap-1 border-t pt-2">
                {holes.map((_, i) => (
                  <button
                    key={holes[i].id}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    className={cn(
                      "h-7 min-w-7 rounded-md text-xs font-medium transition-colors",
                      i === currentIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    )}
                    aria-label={`Go to hole ${i + 1}`}
                    aria-current={i === currentIndex ? "true" : undefined}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
