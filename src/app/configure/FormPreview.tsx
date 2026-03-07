"use client";

import { useForm, FormProvider, Controller } from "react-hook-form";
import type {
  ScoutingQuestionConfig,
  SelectOption
} from "@/lib/types/scouting";
import { createResolver } from "../(scouting)/schema";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { AlertCircle, Eye } from "lucide-react";

interface FormPreviewProps {
  config: ScoutingQuestionConfig[];
  teamOptions: SelectOption[];
  selectOptions: Record<string, SelectOption[]>;
}

/**
 * Real-time form preview that mirrors what the scouting form will
 * look like on a mobile device. Renders all field types with
 * their configured options.
 */
export default function FormPreview({
  config,
  teamOptions,
  selectOptions
}: FormPreviewProps) {
  const resolver = config.length > 0 ? createResolver(config) : undefined;

  const methods = useForm({
    resolver,
    mode: "onTouched"
  });

  if (config.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center text-muted-foreground">
          <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Enter a valid config JSON to see a live preview.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Form Preview
            <Badge variant="outline" className="ml-auto text-xs">
              {config.length} field{config.length !== 1 && "s"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {config.map((question, index) => (
            <div key={question.name + index}>
              <PreviewField
                question={question}
                teamOptions={teamOptions}
                selectOptions={selectOptions}
                control={methods.control}
              />
              {index < config.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          This is a read-only preview of the configured form.
        </CardFooter>
      </Card>
    </FormProvider>
  );
}

function PreviewField({
  question,
  teamOptions,
  selectOptions,
  control
}: {
  question: ScoutingQuestionConfig;
  teamOptions: SelectOption[];
  selectOptions: Record<string, SelectOption[]>;
  control: ReturnType<typeof useForm>["control"];
}) {
  const fieldLabel = question.name;
  const required = !question.optional;

  return (
    <div className="grid gap-2">
      <Label className="text-sm font-medium">
        {fieldLabel}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {question.description && (
        <p className="text-xs text-muted-foreground">{question.description}</p>
      )}

      {question.type === "team" && (
        <Controller
          name={question.name}
          control={control}
          render={({ field }) => (
            <Select value={field.value || ""} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select team..." />
              </SelectTrigger>
              <SelectContent>
                {teamOptions.length > 0 ? (
                  teamOptions.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={JSON.stringify(opt)}>
                      <span className="font-semibold">{opt.value}</span>{" "}
                      <span className="text-muted-foreground">{opt.name}</span>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-options" disabled>
                    No team options configured
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        />
      )}

      {question.type === "select" && (
        <Controller
          name={question.name}
          control={control}
          render={({ field }) => {
            const opts = selectOptions[question.select_key] || [];
            return (
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${fieldLabel}...`} />
                </SelectTrigger>
                <SelectContent>
                  {opts.length > 0 ? (
                    opts.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={JSON.stringify(opt)}>
                        <span className="font-semibold">{opt.value}</span>{" "}
                        <span className="text-muted-foreground">
                          {opt.name}
                        </span>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-options" disabled>
                      No options for key &quot;{question.select_key}&quot;
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            );
          }}
        />
      )}

      {question.type === "number" && (
        <Controller
          name={question.name}
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={question.min}
                max={question.max}
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
                placeholder={`${question.min} – ${question.max}`}
              />
              {question.unit && (
                <span className="text-sm text-muted-foreground">
                  {question.unit}
                </span>
              )}
            </div>
          )}
        />
      )}

      {question.type === "boolean" && (
        <Controller
          name={question.name}
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value ?? question.default ?? false}
              onCheckedChange={field.onChange}
            />
          )}
        />
      )}

      {question.type === "slider" && (
        <Controller
          name={question.name}
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Slider
                min={question.min}
                max={question.max}
                step={question.step ?? 1}
                value={[field.value ?? question.default ?? question.min]}
                onValueChange={([v]) => field.onChange(v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{question.min}</span>
                <span className="font-semibold">
                  {field.value ?? question.default ?? question.min}
                </span>
                <span>{question.max}</span>
              </div>
            </div>
          )}
        />
      )}

      {question.type === "text" && (
        <Controller
          name={question.name}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? ""}
              placeholder={question.placeholder || `Enter ${fieldLabel}...`}
              maxLength={question.maxLength}
            />
          )}
        />
      )}

      {question.type === "textarea" && (
        <Controller
          name={question.name}
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              value={field.value ?? ""}
              placeholder={question.placeholder || `Enter ${fieldLabel}...`}
              rows={question.rows ?? 3}
              maxLength={question.maxLength}
            />
          )}
        />
      )}
    </div>
  );
}
