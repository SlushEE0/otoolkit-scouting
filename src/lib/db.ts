import Dexie, { type EntityTable } from "dexie";
import type { ScoutingConfig, ScoutingEntry } from "./types";

export const db = new Dexie("FRCScoutingDB") as Dexie & {
  configs: EntityTable<ScoutingConfig, "id">;
  entries: EntityTable<ScoutingEntry, "id">;
};

db.version(1).stores({
  configs: "id, isActive, savedAt",
  entries: "id, configId, submittedAt, [teamNumber+matchNumber]"
});
