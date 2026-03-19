"use client";
import { useState } from "react";
import { QrCode, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { ScoutingEntry, ScoutingConfig } from "@/lib/types";

interface Props {
  entry: ScoutingEntry;
  onShowQR: (entry: ScoutingEntry) => void;
  onDelete: (id: string) => void;
  configs?: ScoutingConfig[];
}

export default function EntryCard({ entry, onShowQR, onDelete, configs }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const config = configs?.find((c) => c.id === entry.configId);

  const allianceColor = entry.alliance === "red" ? "bg-red-600" : "bg-blue-600";

  return (
    <div className={`card border border-slate-700`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-white">M{entry.matchNumber}</span>
          <span className="font-bold text-lg text-white">#{entry.teamNumber}</span>
          <span className={`${allianceColor} text-white text-sm font-semibold px-2 py-1 rounded`}>
            {entry.alliance === "red" ? "Red" : "Blue"} {entry.station}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {entry.exported && (
            <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
              Exported
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
        <span>{entry.scoutName || "Unknown scout"}</span>
        <span>·</span>
        <span>{new Date(entry.submittedAt).toLocaleString()}</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onShowQR(entry)}
          className="btn-secondary h-10 text-sm flex items-center gap-1"
        >
          <QrCode size={16} /> QR
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          className="btn-secondary h-10 text-sm flex items-center gap-1"
        >
          Data {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {confirmDelete ? (
          <>
            <button
              onClick={() => onDelete(entry.id)}
              className="btn-danger h-10 text-sm"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="btn-secondary h-10 text-sm"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="btn-secondary h-10 w-10 flex items-center justify-center text-sm"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-700 grid grid-cols-2 gap-2 text-xs">
          {config
            ? config.fieldSchema.map((f) => (
                <div key={f.key}>
                  <span className="text-slate-400">{f.label}:</span>
                  <div className="text-white font-medium break-words">
                    {String(entry.data[f.key] ?? "—")}
                  </div>
                </div>
              ))
            : Object.entries(entry.data).map(([k, v]) => (
                <div key={k}>
                  <span className="text-slate-400">{k}:</span>
                  <div className="text-white font-medium break-words">{String(v)}</div>
                </div>
              ))}
        </div>
      )}
    </div>
  );
}
