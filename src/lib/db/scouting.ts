import { Dexie, type EntityTable } from "dexie";

import {
  DexieScoutingSubmission,
  ScoutingQuestionConfig,
  ScoutingSubmission,
  SelectOption
} from "../types/scouting";
import { logger } from "../logger";
import { getSupabaseClient } from "../supabase";

export const dexie = new Dexie("ScoutingFormResponses") as Dexie & {
  responses: EntityTable<DexieScoutingSubmission, "id">;
};
dexie.version(3).stores({
  responses: "++id, user, team, data, date, uploaded"
});

/**
 * Handles form submission - placeholder implementation
 * TODO: Implement actual submission logic
 */
export async function handleFormSubmission(submission: ScoutingSubmission) {
  try {
    const stringSubmission = {
      ...submission,
      team: JSON.stringify(submission.team),
      data: JSON.stringify(submission.data),
      uploaded: false
    } satisfies Omit<DexieScoutingSubmission, "id">;

    await dexie.responses.add(stringSubmission as any);

    return {
      error: false
    };
  } catch {
    return {
      error: true
    };
  }
}

/**
 * Fetch scouting config from Supabase.
 */
export async function getScoutingConfig(): Promise<ScoutingQuestionConfig[] | null> {
  const sb = getSupabaseClient();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from("ScoutingSettings")
      .select("value")
      .eq("key", "ScoutingConfig")
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      logger.error(
        { key: "ScoutingConfig", err: error?.message },
        "Failed to fetch scouting config from Supabase"
      );
      return null;
    }

    return (data.value as ScoutingQuestionConfig[]) || [];
  } catch (err) {
    logger.error({ err }, "Failed to fetch scouting config");
    return null;
  }
}

/**
 * Fetch team options from Supabase.
 */
export async function fetchTeamOptions(): Promise<SelectOption[]> {
  const sb = getSupabaseClient();
  if (!sb) return [];

  try {
    const { data, error } = await sb
      .from("ScoutingSettings")
      .select("value")
      .eq("key", "sk_EventTeams")
      .limit(1)
      .maybeSingle();

    if (error || !data) return [];
    return (data.value as SelectOption[]) ?? [];
  } catch {
    return [];
  }
}

/**
 * Fetch select options from Supabase.
 */
export async function fetchSelectOptions(
  key: string
): Promise<SelectOption[]> {
  const sb = getSupabaseClient();
  if (!sb) return [];

  try {
    const { data, error } = await sb
      .from("ScoutingSettings")
      .select("value")
      .eq("key", key)
      .limit(1)
      .maybeSingle();

    if (error || !data) return [];
    return (data.value as SelectOption[]) ?? [];
  } catch {
    return [];
  }
}

export async function getAllResponses() {
  try {
    return await dexie.responses.toArray();
  } catch (error: any) {
    logger.error(
      { err: error?.message },
      "Failed to fetch responses from IndexedDB"
    );
    return [];
  }
}

export async function uploadResponses() {
  try {
    const responses = await dexie.responses
      .where("uploaded")
      .equals("false")
      .toArray();

    const formattedResponses = responses.map((response) => ({
      id: response.id!,
      user: response.user,
      team: response.team,
      data: response.data, // Already stringified JSON
      date: response.date
    }));

    logger.info(
      { count: formattedResponses.length },
      "Prepared responses for upload"
    );

    // TODO: Implement actual upload logic
    // This is where you'll add the upload functionality
    return formattedResponses;
  } catch (error: any) {
    logger.error({ err: error?.message }, "Failed to get responses for upload");
    throw error;
  }
}

export async function markResponseAsUploaded(id: number) {
  try {
    await dexie.responses.update(id, { uploaded: true });
    logger.info({ id }, "Marked response as uploaded");
  } catch (error: any) {
    logger.error(
      { id, err: error?.message },
      "Failed to mark response uploaded"
    );
    throw error;
  }
}
