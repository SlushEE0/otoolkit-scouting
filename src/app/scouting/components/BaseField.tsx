import React, { Attributes } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface BaseFieldProps {
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function BaseField({
  label,
  required = false,
  description,
  error,
  children,
  className,
  id
}: BaseFieldProps) {
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const descriptionId = `${fieldId}-description`;
  const errorId = `${fieldId}-error`;

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center justify-between">
        <Label
          htmlFor={fieldId}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && (
            <span className="ml-1 text-destructive" aria-label="required">
              *
            </span>
          )}
        </Label>
      </div>

      {description && (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}

      <div className="relative">
        {React.cloneElement(
          children as React.ReactElement,
          {
            id: fieldId,
            "aria-invalid": !!error,
            "aria-describedby":
              cn(description && descriptionId, error && errorId).trim() ||
              undefined
          } as Attributes
        )}
      </div>

      {error && (
        <p
          id={errorId}
          className="text-xs text-destructive font-medium"
          role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
