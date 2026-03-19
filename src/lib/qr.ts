"use client";

import type {
  ConfigQRPayload,
  EntryQRPayload,
  ScoutingConfig,
  ScoutingEntry,
} from "./types";

export function encodeEntryToQR(entry: ScoutingEntry): string {
  const payload: EntryQRPayload = {
    type: "frc_entry",
    v: 1,
    event: entry.eventKey,
    match: entry.matchNumber,
    team: entry.teamNumber,
    alliance: entry.alliance,
    station: entry.station,
    scout: entry.scoutName,
    ts: entry.submittedAt,
    data: entry.data,
  };

  return JSON.stringify(payload);
}

export function decodeConfigQR(raw: string): ScoutingConfig | null {
  try {
    const payload = JSON.parse(raw) as ConfigQRPayload;

    if (
      payload.type !== "frc_config" ||
      payload.v !== 1 ||
      !payload.seasonId ||
      !payload.name ||
      !Array.isArray(payload.fieldSchema)
    ) {
      return null;
    }

    const config: ScoutingConfig = {
      id: crypto.randomUUID(),
      name: payload.name,
      seasonId: payload.seasonId,
      eventKey: payload.eventKey,
      fieldSchema: payload.fieldSchema,
      savedAt: Date.now(),
      isActive: false,
    };

    return config;
  } catch {
    return null;
  }
}

export function decodeEntryQR(raw: string): ScoutingEntry | null {
  try {
    const payload = JSON.parse(raw) as EntryQRPayload;

    if (
      payload.type !== "frc_entry" ||
      payload.v !== 1 ||
      payload.match === undefined ||
      payload.team === undefined ||
      !payload.alliance ||
      payload.station === undefined ||
      !payload.scout ||
      !payload.data
    ) {
      return null;
    }

    // This is for future use - converting incoming entry QR to ScoutingEntry
    // For now, entries are created locally only
    return null;
  } catch {
    return null;
  }
}

export function generateUUID(): string {
  return crypto.randomUUID();
}
