"use client";

import { useState } from "react";
import type { ScoutingQuestionConfig } from "@/lib/types/scouting";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, GripVertical, Trash2, X } from "lucide-react";

type QuestionType = ScoutingQuestionConfig["type"];

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "team", label: "Team" },
  { value: "select", label: "Select" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "slider", label: "Slider" },
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" }
];

interface QuestionEditorProps {
  question: ScoutingQuestionConfig;
  index: number;
  total: number;
  onChange: (updated: ScoutingQuestionConfig) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

/**
 * Visual editor card for a single ScoutingQuestionConfig.
 * Renders shared fields (name, description, type, optional) plus
 * type-specific fields (min/max/unit for number, select_key for select, etc.)
 */
export default function QuestionEditor({
  question,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown
}: QuestionEditorProps) {
  const [collapsed, setCollapsed] = useState(false);

  const updateField = <K extends string>(key: K, value: unknown) => {
    onChange({ ...question, [key]: value } as ScoutingQuestionConfig);
  };

  const handleTypeChange = (newType: QuestionType) => {
    // Build a fresh config from scratch with the new type, preserving shared fields
    const base = {
      name: question.name,
      description: question.description,
      optional: question.optional
    };

    let newQ: ScoutingQuestionConfig;
    switch (newType) {
      case "team":
        newQ = { ...base, type: "team" };
        break;
      case "select":
        newQ = { ...base, type: "select", select_key: "" };
        break;
      case "number":
        newQ = { ...base, type: "number", min: 0, max: 100 };
        break;
      case "boolean":
        newQ = { ...base, type: "boolean" };
        break;
      case "slider":
        newQ = { ...base, type: "slider", min: 0, max: 10 };
        break;
      case "text":
        newQ = { ...base, type: "text" };
        break;
      case "textarea":
        newQ = { ...base, type: "textarea" };
        break;
      default:
        newQ = { ...base, type: "text" } as ScoutingQuestionConfig;
    }
    onChange(newQ);
  };

  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between gap-2 py-3 px-4">
        <div className="flex items-center gap-2 min-w-0">
          <GripVertical className="size-4 text-muted-foreground shrink-0" />
          <Badge variant="outline" className="shrink-0 text-xs">
            #{index + 1}
          </Badge>
          <CardTitle className="text-sm truncate">
            {question.name || "Untitled"}
          </CardTitle>
          <Badge variant="secondary" className="text-xs shrink-0">
            {question.type}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onMoveUp}
            disabled={index === 0}>
            <ChevronUp className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onMoveDown}
            disabled={index === total - 1}>
            <ChevronDown className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronUp className="size-3.5" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            onClick={onRemove}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="pt-0 px-4 pb-4 space-y-4">
          <Separator />

          {/* Shared fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Name *</Label>
              <Input
                value={question.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Field name"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={question.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Input
              value={question.description ?? ""}
              onChange={(e) =>
                updateField("description", e.target.value || undefined)
              }
              placeholder="Optional description"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={question.optional ?? false}
              onCheckedChange={(val) => updateField("optional", val)}
            />
            <Label className="text-xs">Optional</Label>
          </div>

          {/* Type-specific fields */}
          {question.type === "number" && (
            <TypeSpecificNumberFields question={question} onChange={onChange} />
          )}
          {question.type === "slider" && (
            <TypeSpecificSliderFields question={question} onChange={onChange} />
          )}
          {question.type === "select" && (
            <TypeSpecificSelectFields question={question} onChange={onChange} />
          )}
          {question.type === "text" && (
            <TypeSpecificTextFields question={question} onChange={onChange} />
          )}
          {question.type === "textarea" && (
            <TypeSpecificTextareaFields
              question={question}
              onChange={onChange}
            />
          )}
          {question.type === "boolean" && (
            <TypeSpecificBooleanFields
              question={question}
              onChange={onChange}
            />
          )}
        </CardContent>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Type-specific field groups                                         */
/* ------------------------------------------------------------------ */

function TypeSpecificNumberFields({
  question,
  onChange
}: {
  question: Extract<ScoutingQuestionConfig, { type: "number" }>;
  onChange: (q: ScoutingQuestionConfig) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Min</Label>
        <Input
          type="number"
          value={question.min}
          onChange={(e) =>
            onChange({ ...question, min: Number(e.target.value) })
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Max</Label>
        <Input
          type="number"
          value={question.max}
          onChange={(e) =>
            onChange({ ...question, max: Number(e.target.value) })
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Unit</Label>
        <Input
          value={question.unit ?? ""}
          onChange={(e) =>
            onChange({ ...question, unit: e.target.value || undefined })
          }
          placeholder="e.g. pts"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Default</Label>
        <Input
          type="number"
          value={question.default ?? ""}
          onChange={(e) =>
            onChange({
              ...question,
              default:
                e.target.value === "" ? undefined : Number(e.target.value)
            })
          }
          placeholder="No default"
        />
      </div>
    </div>
  );
}

function TypeSpecificSliderFields({
  question,
  onChange
}: {
  question: Extract<ScoutingQuestionConfig, { type: "slider" }>;
  onChange: (q: ScoutingQuestionConfig) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Min</Label>
        <Input
          type="number"
          value={question.min}
          onChange={(e) =>
            onChange({ ...question, min: Number(e.target.value) })
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Max</Label>
        <Input
          type="number"
          value={question.max}
          onChange={(e) =>
            onChange({ ...question, max: Number(e.target.value) })
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Step</Label>
        <Input
          type="number"
          value={question.step ?? 1}
          onChange={(e) =>
            onChange({
              ...question,
              step: e.target.value === "" ? undefined : Number(e.target.value)
            })
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Default</Label>
        <Input
          type="number"
          value={question.default ?? ""}
          onChange={(e) =>
            onChange({
              ...question,
              default:
                e.target.value === "" ? undefined : Number(e.target.value)
            })
          }
          placeholder="No default"
        />
      </div>
    </div>
  );
}

function TypeSpecificSelectFields({
  question,
  onChange
}: {
  question: Extract<ScoutingQuestionConfig, { type: "select" }>;
  onChange: (q: ScoutingQuestionConfig) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Select Key *</Label>
        <Input
          value={question.select_key}
          onChange={(e) =>
            onChange({ ...question, select_key: e.target.value })
          }
          placeholder="e.g. alliance_color"
        />
        <p className="text-[10px] text-muted-foreground">
          Must match a key in your Select Options map.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Default</Label>
        <Input
          value={question.default ?? ""}
          onChange={(e) =>
            onChange({ ...question, default: e.target.value || undefined })
          }
          placeholder="No default"
        />
      </div>
    </div>
  );
}

function TypeSpecificTextFields({
  question,
  onChange
}: {
  question: Extract<ScoutingQuestionConfig, { type: "text" }>;
  onChange: (q: ScoutingQuestionConfig) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Placeholder</Label>
        <Input
          value={question.placeholder ?? ""}
          onChange={(e) =>
            onChange({ ...question, placeholder: e.target.value || undefined })
          }
          placeholder="Hint text"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Max Length</Label>
        <Input
          type="number"
          value={question.maxLength ?? ""}
          onChange={(e) =>
            onChange({
              ...question,
              maxLength:
                e.target.value === "" ? undefined : Number(e.target.value)
            })
          }
          placeholder="No limit"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Default</Label>
        <Input
          value={question.default ?? ""}
          onChange={(e) =>
            onChange({ ...question, default: e.target.value || undefined })
          }
          placeholder="No default"
        />
      </div>
    </div>
  );
}

function TypeSpecificTextareaFields({
  question,
  onChange
}: {
  question: Extract<ScoutingQuestionConfig, { type: "textarea" }>;
  onChange: (q: ScoutingQuestionConfig) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Placeholder</Label>
        <Input
          value={question.placeholder ?? ""}
          onChange={(e) =>
            onChange({ ...question, placeholder: e.target.value || undefined })
          }
          placeholder="Hint text"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Max Length</Label>
        <Input
          type="number"
          value={question.maxLength ?? ""}
          onChange={(e) =>
            onChange({
              ...question,
              maxLength:
                e.target.value === "" ? undefined : Number(e.target.value)
            })
          }
          placeholder="No limit"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Rows</Label>
        <Input
          type="number"
          value={question.rows ?? 3}
          onChange={(e) =>
            onChange({
              ...question,
              rows: e.target.value === "" ? undefined : Number(e.target.value)
            })
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Default</Label>
        <Input
          value={question.default ?? ""}
          onChange={(e) =>
            onChange({ ...question, default: e.target.value || undefined })
          }
          placeholder="No default"
        />
      </div>
    </div>
  );
}

function TypeSpecificBooleanFields({
  question,
  onChange
}: {
  question: Extract<ScoutingQuestionConfig, { type: "boolean" }>;
  onChange: (q: ScoutingQuestionConfig) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={question.default ?? false}
        onCheckedChange={(val) => onChange({ ...question, default: val })}
      />
      <Label className="text-xs">Default value</Label>
    </div>
  );
}
