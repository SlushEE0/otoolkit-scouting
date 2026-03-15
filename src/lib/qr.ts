import type { ScoutingConfig, ScoutingEntry } from "./types";

export function encodeEntryToQR(entry: ScoutingEntry): string {
  const compact = {
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
    id: entry.id,
    configId: entry.configId,
    seasonId: entry.seasonId,
  };
  return JSON.stringify(compact);
}

export function decodeConfigQR(raw: string): ScoutingConfig | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed.type !== "frc_config" || parsed.v !== 1) return null;
    if (!parsed.name || !parsed.seasonId || !Array.isArray(parsed.fieldSchema)) return null;
    return {
      id: crypto.randomUUID(),
      name: parsed.name,
      seasonId: parsed.seasonId,
      eventKey: parsed.eventKey,
      fieldSchema: parsed.fieldSchema,
      savedAt: Date.now(),
      isActive: true,
    };
  } catch {
    return null;
  }
}

export function decodeEntryQR(raw: string): ScoutingEntry | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed.type !== "frc_entry" || parsed.v !== 1) return null;
    return {
      id: parsed.id || crypto.randomUUID(),
      configId: parsed.configId || "",
      seasonId: parsed.seasonId || "",
      eventKey: parsed.event,
      matchNumber: parsed.match,
      teamNumber: parsed.team,
      alliance: parsed.alliance,
      station: parsed.station,
      scoutName: parsed.scout,
      submittedAt: parsed.ts,
      data: parsed.data || {},
      exported: false,
    };
  } catch {
    return null;
  }
}
