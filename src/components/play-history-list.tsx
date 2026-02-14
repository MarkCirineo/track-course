"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlayScorecardModal } from "@/components/play-scorecard-modal";
import { EditPlayModal } from "@/components/edit-play-modal";
import { deleteCoursePlay } from "@/app/actions/course-play";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

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

type PlayHistoryListProps = {
  plays: PlayWithScores[];
  holes: HoleForScorecard[];
  courseName: string;
  showEditDelete?: boolean;
  onPlayUpdated?: () => void;
};

export function PlayHistoryList({
  plays,
  holes,
  courseName,
  showEditDelete = false,
  onPlayUpdated,
}: PlayHistoryListProps) {
  const router = useRouter();
  const [scorecardPlayId, setScorecardPlayId] = useState<string | null>(null);
  const [editPlayId, setEditPlayId] = useState<string | null>(null);
  const scorecardPlay = plays.find((p) => p.id === scorecardPlayId);
  const editPlay = plays.find((p) => p.id === editPlayId);

  const handleUpdated = () => {
    router.refresh();
    onPlayUpdated?.();
  };

  const handleDelete = async (playId: string) => {
    if (!confirm("Delete this play? This cannot be undone.")) return;
    const result = await deleteCoursePlay(playId);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Play deleted");
      handleUpdated();
    }
  };

  const holesForEdit = holes.map((h) => ({ id: h.id, holeIndex: h.holeIndex }));

  return (
    <>
      <ul className="space-y-3">
        {plays.map((play) => (
          <li
            key={play.id}
            className="flex flex-col gap-1 rounded-md border bg-muted/20 px-2 py-2 text-sm"
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium text-foreground">
                {new Date(play.playedAt).toLocaleDateString()}
              </span>
              <span className="text-muted-foreground">
                {play.tee.name || play.tee.gender || "Tee"} —
                {play.holesPlayed === "front"
                  ? " Front 9"
                  : play.holesPlayed === "back"
                    ? " Back 9"
                    : " Full 18"}
              </span>
              {play.overallScore != null && (
                <span className="font-medium">{play.overallScore}</span>
              )}
              {showEditDelete && (
                <span className="ml-auto flex shrink-0 gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="size-7"
                    onClick={() => setEditPlayId(play.id)}
                    title="Edit play"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="size-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(play.id)}
                    title="Delete play"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </span>
              )}
            </div>
            {play.note && <p className="text-muted-foreground text-xs">{play.note}</p>}
            <div>
              {play.holeScores.length > 0 ? (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-primary"
                  onClick={() => setScorecardPlayId(play.id)}
                >
                  View scorecard
                </Button>
              ) : showEditDelete ? (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-primary"
                  onClick={() => setEditPlayId(play.id)}
                >
                  Add per-hole scores
                </Button>
              ) : (
                <span className="text-muted-foreground text-xs">(no per-hole scores)</span>
              )}
            </div>
          </li>
        ))}
      </ul>
      {scorecardPlay && (
        <PlayScorecardModal
          open={scorecardPlayId === scorecardPlay.id}
          onOpenChange={(open) => !open && setScorecardPlayId(null)}
          courseName={courseName}
          play={{
            playedAt: scorecardPlay.playedAt,
            tee: scorecardPlay.tee,
            holesPlayed: scorecardPlay.holesPlayed,
            overallScore: scorecardPlay.overallScore,
            note: scorecardPlay.note,
            holeScores: scorecardPlay.holeScores,
          }}
          holes={holes}
        />
      )}
      {editPlay && (
        <EditPlayModal
          open={editPlayId === editPlay.id}
          onOpenChange={(open) => !open && setEditPlayId(null)}
          courseName={courseName}
          play={{
            id: editPlay.id,
            playedAt: editPlay.playedAt,
            tee: { name: editPlay.tee.name },
            holesPlayed: editPlay.holesPlayed,
            overallScore: editPlay.overallScore,
            note: editPlay.note,
            holeScores: editPlay.holeScores,
          }}
          holes={holesForEdit}
          onSuccess={() => {
            setEditPlayId(null);
            handleUpdated();
          }}
        />
      )}
    </>
  );
}
