"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type HoleForImages = {
  id: string;
  name: string | null;
  holeIndex: number;
  imageUrls: string[];
};

export function HoleImagesModal({
  holes,
  triggerLabel = "View hole images",
}: {
  holes: HoleForImages[];
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const hole = holes[currentIndex];
  const hasImages = holes.some((h) => h.imageUrls.length > 0);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < holes.length - 1;

  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goNext = () => setCurrentIndex((i) => Math.min(holes.length - 1, i + 1));

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setCurrentIndex(0);
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
          <DialogHeader>
            <DialogTitle id="hole-images-title">Hole images</DialogTitle>
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
                  <span className="font-medium">
                    Hole {hole.holeIndex + 1}
                    {hole.name ? ` — ${hole.name}` : ""}
                  </span>
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
                          alt={
                            hole.name
                              ? `${hole.name} image ${i + 1}`
                              : `Hole ${hole.holeIndex + 1} image ${i + 1}`
                          }
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
