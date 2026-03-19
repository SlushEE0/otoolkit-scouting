"use client";
import { useState } from "react";
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
    <div className={`card border ${config.isActive ? "border-blue-500" : "border-slate-700"}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white truncate">{config.name}</h3>
          {config.eventKey && (
            <p className="text-xs text-slate-400">{config.eventKey}</p>
          )}
        </div>
        {config.isActive && (
          <span className="badge badge-blue text-xs whitespace-nowrap">Active</span>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
        <span>{config.fieldSchema.length} fields</span>
        <span>·</span>
        <span>{new Date(config.savedAt).toLocaleDateString()}</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {!config.isActive && (
          <button
            onClick={() => onSetActive(config.id)}
            className="btn-primary flex-1 h-10 text-sm"
          >
            Set Active
          </button>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="btn-secondary flex-1 h-10 text-sm flex items-center justify-center gap-2"
        >
          Fields {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {confirmDelete ? (
          <>
            <button
              onClick={() => onDelete(config.id)}
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
        <div className="mt-3 flex flex-col gap-2 pt-3 border-t border-slate-700">
          {config.fieldSchema.map((f) => (
            <div key={f.key} className="flex items-center gap-2 text-xs">
              <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-slate-700 text-slate-200">
                {f.type}
              </span>
              <span className="truncate text-slate-300">{f.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
