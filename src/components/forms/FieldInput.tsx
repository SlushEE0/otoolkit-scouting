"use client";
import type { FieldDefinition } from "@/lib/types";

interface Props {
  field: FieldDefinition;
  value: any;
  onChange: (value: any) => void;
}

export default function FieldInput({ field, value, onChange }: Props) {
  if (field.type === "number") {
    const num = typeof value === "number" ? value : (typeof field.defaultValue === "number" ? field.defaultValue : 0);
    const min = field.min ?? -Infinity;
    const max = field.max ?? Infinity;

    return (
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-slate-200">{field.label}</label>
        <div className="flex items-center gap-3 justify-center">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, num - 1))}
            disabled={num <= min}
            className="w-14 h-14 rounded-lg bg-slate-700 text-white text-3xl font-bold flex items-center justify-center disabled:opacity-40 active:bg-slate-600 tap-highlight min-h-[44px]"
          >
            −
          </button>
          <span className="flex-1 text-center text-4xl font-bold text-white">{num}</span>
          <button
            type="button"
            onClick={() => onChange(Math.min(max, num + 1))}
            disabled={num >= max}
            className="w-14 h-14 rounded-lg bg-slate-700 text-white text-3xl font-bold flex items-center justify-center disabled:opacity-40 active:bg-slate-600 tap-highlight min-h-[44px]"
          >
            +
          </button>
        </div>
      </div>
    );
  }

  if (field.type === "boolean") {
    const isChecked = !!value;
    return (
      <div className="flex items-center justify-between gap-4 p-3 bg-slate-800 rounded-lg border border-slate-700">
        <label className="text-sm font-semibold text-slate-200">{field.label}</label>
        <button
          type="button"
          onClick={() => onChange(!isChecked)}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            isChecked ? "bg-blue-600" : "bg-slate-600"
          } tap-highlight min-h-[44px] min-w-[44px]`}
        >
          <div
            className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
              isChecked ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    );
  }

  if (field.type === "select") {
    const options = field.options ?? [];
    
    if (options.length <= 4) {
      return (
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-slate-200">{field.label}</label>
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] min-w-[44px] ${
                  value === opt
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 active:bg-slate-600"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-slate-200">{field.label}</label>
        <select
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 px-3 rounded-lg bg-slate-800 border border-slate-600 text-white text-base"
        >
          <option value="">Select…</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // text
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-slate-200">{field.label}</label>
      <textarea
        rows={3}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white text-base resize-none"
      />
    </div>
  );
}
