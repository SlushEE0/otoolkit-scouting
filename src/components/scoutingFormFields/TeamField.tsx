import { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { BaseField } from "./BaseField";
import { TeamQuestionConfig, SelectOption } from "@/lib/types/scouting";

interface TeamFieldProps {
  question: TeamQuestionConfig;
  localOptions?: SelectOption[];
}

export function TeamField({ question, localOptions }: TeamFieldProps) {
  const {
    control,
    formState: { errors }
  } = useFormContext();
  const [options, setOptions] = useState<SelectOption[]>(localOptions || []);
  const [isLoading, setIsLoading] = useState(!localOptions);
  const error = errors[question.name]?.message as string | undefined;

  useEffect(() => {
    if (localOptions) {
      setOptions(localOptions);
      setIsLoading(false);
      return;
    }

    // Fallback: try loading from Supabase if no local options provided
    const loadOptions = async () => {
      setIsLoading(true);
      try {
        const { fetchTeamOptions } = await import("@/lib/db/scouting");
        const options = await fetchTeamOptions();
        setOptions(options ?? []);
      } catch {
        console.warn("Failed to load team options from Supabase");
      } finally {
        setIsLoading(false);
      }
    };

    loadOptions();
  }, [localOptions]);

  return (
    <BaseField
      label={question.name}
      required={!question.optional}
      description={question.description}
      error={error}>
      <Controller
        name={question.name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value || ""}
            onValueChange={field.onChange}
            disabled={isLoading}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  isLoading ? "Loading options..." : `Select ${question.name}`
                }
              />
            </SelectTrigger>
            <SelectContent>
              {options.length > 0 &&
                options.map(
                  (option) =>
                    option.value && (
                      <SelectItem
                        key={option.value}
                        value={JSON.stringify(option)}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{option.value}</span>
                          <span className="text-muted-foreground">
                            {option.name.length > 30
                              ? `${option.name.slice(0, 30)}...`
                              : option.name}
                          </span>
                        </div>
                      </SelectItem>
                    )
                )}
              {options.length === 0 && (
                <SelectItem value="noop" disabled>
                  No options available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        )}
      />
    </BaseField>
  );
}
