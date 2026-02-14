"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateBookmarkNote } from "@/app/actions/bookmarks";
import { toast } from "sonner";

type BookmarkNoteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseName: string;
  initialNote: string | null;
  onSuccess?: (savedNote: string | null) => void;
};

export function BookmarkNoteModal({
  open,
  onOpenChange,
  courseId,
  courseName,
  initialNote,
  onSuccess,
}: BookmarkNoteModalProps) {
  const [note, setNote] = useState(initialNote ?? "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setNote(initialNote ?? "");
  }, [open, initialNote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await updateBookmarkNote(courseId, note.trim() || null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      const saved = note.trim() || null;
      toast.success("Note saved");
      onOpenChange(false);
      onSuccess?.(saved);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Note — {courseName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-[100px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note for this bookmark..."
            rows={4}
          />
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
