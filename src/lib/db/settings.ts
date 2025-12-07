import { z } from "zod";

const STORAGE_KEYS = {
  hostUrl: "settings:hostUrl",
  config: "settings:config"
} as const;

const HostUrlSchema = z
  .url("Enter a valid URL (include protocol).")
  .trim()
  .min(1, "Host URL is required.");

const ConfigSchema = z
  .string()
  .trim()
  .min(1, "Config is required.")
  .superRefine((value, ctx) => {
    try {
      JSON.parse(value);
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "Config must be valid JSON."
      });
    }
  })
  .optional();

export const LocalSettingsSchema = z.object({
  hostUrl: HostUrlSchema,
  config: ConfigSchema
});

export type LocalSettings = z.infer<typeof LocalSettingsSchema>;

type LocalSettingsParseResult = ReturnType<
  typeof LocalSettingsSchema.safeParse
>;

export function loadLocalSettings(): LocalSettings {
  return {
    hostUrl: window.localStorage.getItem(STORAGE_KEYS.hostUrl) ?? "",
    config: window.localStorage.getItem(STORAGE_KEYS.config) || undefined
  };
}

export function saveLocalSettings(values: LocalSettings) {
  window.localStorage.setItem(STORAGE_KEYS.hostUrl, values.hostUrl);
  window.localStorage.setItem(STORAGE_KEYS.config, values.config || "{}");
}

export function clearLocalSettings() {
  window.localStorage.removeItem(STORAGE_KEYS.hostUrl);
  window.localStorage.removeItem(STORAGE_KEYS.config);
}

export function hasLocalSettingsChanges(values: LocalSettings) {
  const stored = loadLocalSettings();
  return stored.hostUrl !== values.hostUrl || stored.config !== values.config;
}

export function validateLocalSettings(
  values: LocalSettings
): LocalSettingsParseResult {
  return LocalSettingsSchema.safeParse(values);
}

export const LOCAL_SETTINGS_STORAGE_KEYS = STORAGE_KEYS;
