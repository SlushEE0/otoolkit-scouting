import EntryCard from "./EntryCard";
import type { ScoutingEntry, ScoutingConfig } from "@/lib/types";

interface Props {
  entries: ScoutingEntry[];
  onShowQR: (entry: ScoutingEntry) => void;
  onDelete: (id: string) => void;
  configs?: ScoutingConfig[];
}

export default function EntryList({ entries, onShowQR, onDelete, configs }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No entries recorded yet.</p>
        <p className="text-sm mt-1">Start scouting to add entries.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {entries.map((e) => (
        <EntryCard key={e.id} entry={e} onShowQR={onShowQR} onDelete={onDelete} configs={configs} />
      ))}
    </div>
  );
}
