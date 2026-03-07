"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent
} from "react";
import { toast } from "sonner";
import { LocalhostScoutingDB } from "@/lib/db/host/scouting";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet
} from "@/components/ui/field";
import {
  clearLocalSettings,
  hasLocalSettingsChanges,
  loadLocalSettings,
  saveLocalSettings,
  validateLocalSettings
} from "@/lib/db/settings";
import z from "zod";

type FormErrors = {
  hostUrl?: string;
  config?: string;
};

export default function SettingsPage() {
  const [hostUrl, setHostUrl] = useState("");
  const [config, setConfig] = useState("{}");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const ws = useMemo(
    () =>
      typeof window !== "undefined" ? new LocalhostScoutingDB() : null,
    []
  );

  const hasUnsavedChanges = useMemo(() => {
    if (typeof window === "undefined") return false;
    return hasLocalSettingsChanges({ hostUrl, config });
  }, [hostUrl, config]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const validationResult = validateLocalSettings({ hostUrl, config });

    if (!validationResult.success) {
      const fieldErrors = z.treeifyError(validationResult.error).properties;
      setErrors({
        hostUrl: fieldErrors?.hostUrl?.errors.at(0),
        config: fieldErrors?.config?.errors.at(0)
      });
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      const nextValues = validationResult.data;
      saveLocalSettings(nextValues);
      setHostUrl(nextValues.hostUrl);
      setConfig(nextValues.config || "{}");
      toast.success("Settings saved locally.");
    } catch {
      toast.error("Unable to save settings. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToStored = useCallback(() => {
    const stored = loadLocalSettings();
    setHostUrl(stored.hostUrl);
    setConfig(stored.config || "{}");
    setErrors({});
    toast.info("Reverted to saved values.");
  }, []);

  const handleClear = () => {
    clearLocalSettings();
    setHostUrl("");
    setConfig("{}");
    setErrors({});
    toast.success("Local settings cleared.");
  };

  const handleHostChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHostUrl(event.target.value);
    if (errors.hostUrl) {
      setErrors((prev) => ({ ...prev, hostUrl: undefined }));
    }
  };

  const handleConfigChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setConfig(event.target.value);
    if (errors.config) {
      setErrors((prev) => ({ ...prev, config: undefined }));
    }
  };

  useEffect(() => {
    handleResetToStored();
  }, [handleResetToStored]);

  return (
    <div className="w-full h-full container mx-auto flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          These preferences live in your browser&apos;s local storage and stay
          on this device only.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Scouting Service</CardTitle>
            <CardDescription>
              Configure how this app connects to your scouting backend and
              passes request payloads.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <Field data-invalid={Boolean(errors.hostUrl)}>
                <FieldLabel htmlFor="hostUrl">Host URL</FieldLabel>
                <FieldContent>
                  <FieldDescription>
                    Provide the root URL for your scouting backend (include
                    protocol).
                  </FieldDescription>
                  <Input
                    id="hostUrl"
                    type="url"
                    placeholder="https://100.0.0.1:3749"
                    value={hostUrl}
                    aria-invalid={Boolean(errors.hostUrl)}
                    onChange={handleHostChange}
                    autoComplete="off"
                  />
                  <FieldError>{errors.hostUrl}</FieldError>
                </FieldContent>
              </Field>

              <Field data-invalid={Boolean(errors.config)}>
                <FieldLabel htmlFor="config">Config JSON</FieldLabel>
                <FieldContent>
                  <FieldDescription>
                    Paste any JSON payload your client should send with outbound
                    requests.
                  </FieldDescription>
                  <Textarea
                    id="config"
                    spellCheck={false}
                    rows={10}
                    placeholder={`{\n  "apiKey": "..."\n}`}
                    value={config}
                    aria-invalid={Boolean(errors.config)}
                    onChange={handleConfigChange}
                  />
                  <FieldError>{errors.config}</FieldError>
                </FieldContent>
              </Field>
            </FieldSet>
          </CardContent>
          <CardFooter className="justify-between gap-3 flex-wrap">
            <div className="text-xs text-muted-foreground">
              {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetToStored}
                disabled={isSaving}>
                Revert
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleClear}
                disabled={isSaving}>
                Clear
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save settings"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
