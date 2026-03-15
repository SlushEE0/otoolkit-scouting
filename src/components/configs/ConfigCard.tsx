"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import type { ScoutingConfig } from "@/lib/types";

interface Props {
  config: ScoutingConfig;
  onSetActive: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ConfigCard({ config, onSetActive, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Card className={`border ${config.isActive ? "border-primary" : "border-border"}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{config.name}</CardTitle>
            {config.eventKey && (
              <p className="text-xs text-muted-foreground">{config.eventKey}</p>
            )}
          </div>
          {config.isActive && <Badge variant="default">Active</Badge>}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{config.fieldSchema.length} fields</span>
          <span>·</span>
          <span>{new Date(config.savedAt).toLocaleDateString()}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!config.isActive && (
            <Button size="sm" onClick={() => onSetActive(config.id)} className="flex-1">
              Set Active
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            className="gap-1"
          >
            Fields {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
          {confirmDelete ? (
            <>
              <Button size="sm" variant="destructive" onClick={() => onDelete(config.id)}>
                Confirm
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={14} />
            </Button>
          )}
        </div>
        {expanded && (
          <div className="mt-2 flex flex-col gap-1">
            {config.fieldSchema.map((f) => (
              <div key={f.key} className="flex items-center gap-2 text-xs">
                <Badge variant="secondary" className="text-xs">{f.type}</Badge>
                <span className="truncate">{f.label}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
