import ConfigCard from "./ConfigCard";
import type { ScoutingConfig } from "@/lib/types";

interface Props {
  configs: ScoutingConfig[];
  onSetActive: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ConfigList({ configs, onSetActive, onDelete }: Props) {
  if (configs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No configs saved yet.</p>
        <p className="text-sm mt-1">Scan a config QR code to get started.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {configs.map((c) => (
        <ConfigCard key={c.id} config={c} onSetActive={onSetActive} onDelete={onDelete} />
      ))}
    </div>
  );
}
