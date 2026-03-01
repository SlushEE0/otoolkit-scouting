/**
 * Offline Scouting Database (Dexie / IndexedDB)
 *
 * This module manages all local-first data:
 * - scoutingConfig: cached form configuration for offline use
 * - submissions: scouting entries with UUID, deviceId, timestamp
 *
 * Architecture:
 * - Config is downloaded once from Supabase and cached here.
 * - Submissions are created offline and exported via QR codes.
 * - The Windows import app deduplicates by UUID.
 */

import Dexie, { type EntityTable } from "dexie";
import { v4 as uuidv4 } from "uuid";
import { getDeviceId } from "../deviceId";
import type { ScoutingQuestionConfig, SelectOption } from "../types/scouting";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface OfflineScoutingSubmission {
  /** Auto-increment primary key (Dexie internal) */
  id?: number;
  /** Globally unique identifier for deduplication */
  uuid: string;
  /** Device that created this entry */
  deviceId: string;
  /** ISO-8601 creation timestamp */
  timestamp: string;
  /** Form responses (serialised JSON) */
  responses: string;
  /** Whether this entry has been exported */
  exported: boolean;
}

export interface CachedConfig {
  /** Singleton key – always "current" */
  key: string;
  /** The full question config array (JSON) */
  config: string;
  /** Team options for team fields (JSON) */
  teamOptions: string;
  /** Select options keyed by select_key (JSON) */
  selectOptions: string;
  /** When the config was last downloaded */
  downloadedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Database                                                           */
/* ------------------------------------------------------------------ */

export const offlineDb = new Dexie("OfflineScoutingDB") as Dexie & {
  submissions: EntityTable<OfflineScoutingSubmission, "id">;
  cachedConfig: EntityTable<CachedConfig, "key">;
};

offlineDb.version(1).stores({
  submissions: "++id, uuid, deviceId, timestamp, exported",
  cachedConfig: "key"
});

/* ------------------------------------------------------------------ */
/*  Config helpers                                                     */
/* ------------------------------------------------------------------ */

/**
 * Save scouting config + options to IndexedDB for offline use.
 */
export async function saveConfigLocally(
  config: ScoutingQuestionConfig[],
  teamOptions: SelectOption[] = [],
  selectOptions: Record<string, SelectOption[]> = {}
): Promise<void> {
  await offlineDb.cachedConfig.put({
    key: "current",
    config: JSON.stringify(config),
    teamOptions: JSON.stringify(teamOptions),
    selectOptions: JSON.stringify(selectOptions),
    downloadedAt: new Date().toISOString()
  });
}

/**
 * Load cached config from IndexedDB. Returns null if not cached.
 */
export async function loadCachedConfig(): Promise<{
  config: ScoutingQuestionConfig[];
  teamOptions: SelectOption[];
  selectOptions: Record<string, SelectOption[]>;
  downloadedAt: string;
} | null> {
  const row = await offlineDb.cachedConfig.get("current");
  if (!row) return null;

  return {
    config: JSON.parse(row.config),
    teamOptions: JSON.parse(row.teamOptions),
    selectOptions: JSON.parse(row.selectOptions),
    downloadedAt: row.downloadedAt
  };
}

/**
 * Clear cached config.
 */
export async function clearCachedConfig(): Promise<void> {
  await offlineDb.cachedConfig.delete("current");
}

/* ------------------------------------------------------------------ */
/*  Submission helpers                                                 */
/* ------------------------------------------------------------------ */

/**
 * Create a new scouting submission with auto-generated UUID, deviceId,
 * and timestamp.
 */
export async function createSubmission(
  responses: Record<string, unknown>
): Promise<OfflineScoutingSubmission> {
  const entry: OfflineScoutingSubmission = {
    uuid: uuidv4(),
    deviceId: getDeviceId(),
    timestamp: new Date().toISOString(),
    responses: JSON.stringify(responses),
    exported: false
  };

  const id = await offlineDb.submissions.add(entry);
  return { ...entry, id: id as number };
}

/**
 * Get all submissions.
 */
export async function getAllSubmissions(): Promise<
  OfflineScoutingSubmission[]
> {
  return offlineDb.submissions.toArray();
}

/**
 * Get only unexported submissions.
 */
export async function getUnexportedSubmissions(): Promise<
  OfflineScoutingSubmission[]
> {
  return offlineDb.submissions.where("exported").equals(0).toArray();
}

/**
 * Mark specific submissions as exported (does NOT delete them).
 */
export async function markAsExported(ids: number[]): Promise<void> {
  await offlineDb.submissions
    .where("id")
    .anyOf(ids)
    .modify({ exported: true });
}

/**
 * Delete a submission by id.
 */
export async function deleteSubmission(id: number): Promise<void> {
  await offlineDb.submissions.delete(id);
}

/**
 * Get submission count.
 */
export async function getSubmissionCount(): Promise<number> {
  return offlineDb.submissions.count();
}
