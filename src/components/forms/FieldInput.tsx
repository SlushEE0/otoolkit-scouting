"use client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { FieldDefinition } from "@/lib/types";

interface Props {
  field: FieldDefinition;
  value: any;
  onChange: (value: any) => void;
}

export default function FieldInput({ field, value, onChange }: Props) {
  if (field.type === "number") {
    const num = typeof value === "number" ? value : (field.defaultValue ?? 0);
    const min = field.min ?? -Infinity;
    const max = field.max ?? Infinity;
    return (
      <div className="flex flex-col gap-1">
        <Label className="text-sm font-medium">{field.label}</Label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, num - 1))}
            disabled={num <= min}
            className="w-12 h-12 rounded-lg bg-secondary text-foreground text-2xl font-bold flex items-center justify-center disabled:opacity-40 active:bg-muted"
          >
            −
          </button>
          <span className="flex-1 text-center text-2xl font-bold">{num}</span>
          <button
            type="button"
            onClick={() => onChange(Math.min(max, num + 1))}
            disabled={num >= max}
            className="w-12 h-12 rounded-lg bg-secondary text-foreground text-2xl font-bold flex items-center justify-center disabled:opacity-40 active:bg-muted"
          >
            +
          </button>
        </div>
      </div>
    );
  }

  if (field.type === "boolean") {
    return (
      <div className="flex items-center justify-between py-2">
        <Label className="text-sm font-medium">{field.label}</Label>
        <Switch
          checked={!!value}
          onCheckedChange={onChange}
          className="scale-110"
        />
      </div>
    );
  }

  if (field.type === "select") {
    const options = field.options ?? [];
    if (options.length <= 4) {
      return (
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-medium">{field.label}</Label>
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors min-h-[44px] ${
                  value === opt
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-foreground border-border hover:bg-muted"
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
      <div className="flex flex-col gap-1">
        <Label className="text-sm font-medium">{field.label}</Label>
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 px-3 rounded-md bg-secondary border border-border text-foreground"
        >
          <option value="">Select…</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  // text
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-sm font-medium">{field.label}</Label>
      <textarea
        rows={3}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-foreground resize-none"
      />
    </div>
  );
}
