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
