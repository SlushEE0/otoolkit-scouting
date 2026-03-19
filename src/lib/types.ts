export interface FieldDefinition {
  key: string;
  label: string;
  type: "number" | "boolean" | "select" | "text";
  options?: string[];
  defaultValue?: any;
  min?: number;
  max?: number;
}

export interface ScoutingConfig {
  id: string;
  name: string;
  seasonId: string;
  eventKey?: string;
  fieldSchema: FieldDefinition[];
  savedAt: number;
  isActive: boolean;
}

export interface ScoutingEntry {
  id: string;
  configId: string;
  seasonId: string;
  eventKey?: string;
  matchNumber: number;
  teamNumber: number;
  alliance: "red" | "blue";
  station: 1 | 2 | 3;
  scoutName: string;
  submittedAt: number;
  data: Record<string, any>;
  exported: boolean;
}

export interface ConfigQRPayload {
  type: "frc_config";
  v: number;
  seasonId: string;
  name: string;
  eventKey?: string;
  fieldSchema: FieldDefinition[];
}

export interface EntryQRPayload {
  type: "frc_entry";
  v: number;
  event?: string;
  match: number;
  team: number;
  alliance: "red" | "blue";
  station: 1 | 2 | 3;
  scout: string;
  ts: number;
  data: Record<string, any>;
}
