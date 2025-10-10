import { Dexie, type EntityTable } from "dexie";

import { pb } from "@/lib/pbaseClient";

import {
  DexieScoutingSubmission,
  ScoutingSubmission,
  SelectOption
} from "../types/scouting";
import { logger } from "../logger";

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

export async function fetchTeamOptions() {
  try {
    const record = await pb
      .collection("ScoutingSettings")
      .getFirstListItem(`key='sk_EventTeams'`)
      .catch();

    if (record && record.value) {
      return record.value as SelectOption[];
    }

    return [];
  } catch (error: any) {
    logger.error({ key: "sk_EventTeams", err: error?.message }, "Failed to fetch select options");
    return [];
  }
}

export async function fetchSelectOptions(key: string) {
  try {
    const record = await pb
      .collection("ScoutingSettings")
      .getFirstListItem(`key='${key}'`)
      .catch();

    if (record && record.value) {
      return record.value as SelectOption[];
    }

    return [];
  } catch (error: any) {
    logger.error({ key, err: error?.message }, "Failed to fetch select options");
    return [];
  }
}

export async function getAllResponses() {
  try {
    return await dexie.responses.toArray();
  } catch (error: any) {
    logger.error({ err: error?.message }, "Failed to fetch responses from IndexedDB");
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

    logger.info({ count: formattedResponses.length }, "Prepared responses for upload");

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
    logger.error({ id, err: error?.message }, "Failed to mark response uploaded");
    throw error;
  }
}
