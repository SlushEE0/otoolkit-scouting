"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { ScoutingEntry, ScoutingConfig } from "@/lib/types";

interface Props {
  entry: ScoutingEntry;
  onShowQR: (entry: ScoutingEntry) => void;
  onDelete: (id: string) => void;
  config?: ScoutingConfig;
}

export default function EntryCard({ entry, onShowQR, onDelete, config }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base">M{entry.matchNumber}</span>
            <span className="font-bold text-base">#{entry.teamNumber}</span>
            <Badge
              className={entry.alliance === "red" ? "bg-red-600 text-white" : "bg-blue-600 text-white"}
            >
              {entry.alliance[0].toUpperCase() + entry.alliance.slice(1)} {entry.station}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {entry.exported && <Badge variant="secondary">Exported</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{entry.scoutName || "Unknown scout"}</span>
          <span>·</span>
          <span>{new Date(entry.submittedAt).toLocaleString()}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => onShowQR(entry)} className="gap-1">
            <QrCode size={14} /> QR
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)} className="gap-1">
            Data {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
          {confirmDelete ? (
            <>
              <Button size="sm" variant="destructive" onClick={() => onDelete(entry.id)}>Confirm</Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            </>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={14} />
            </Button>
          )}
        </div>
        {expanded && (
          <div className="mt-2 grid grid-cols-2 gap-1">
            {config
              ? config.fieldSchema.map((f) => (
                  <div key={f.key} className="text-xs">
                    <span className="text-muted-foreground">{f.label}: </span>
                    <span>{String(entry.data[f.key] ?? "—")}</span>
                  </div>
                ))
              : Object.entries(entry.data).map(([k, v]) => (
                  <div key={k} className="text-xs">
                    <span className="text-muted-foreground">{k}: </span>
                    <span>{String(v)}</span>
                  </div>
                ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
