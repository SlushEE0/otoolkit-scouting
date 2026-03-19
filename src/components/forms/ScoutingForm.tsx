"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { FieldDefinition, ScoutingConfig, ScoutingEntry } from "@/lib/types";
import FormHeader from "./FormHeader";
import FieldInput from "./FieldInput";
import { useScouterName } from "@/hooks/useScouterName";

function buildDefaultValues(schema: FieldDefinition[]): Record<string, any> {
  const defaults: Record<string, any> = {};
  for (const f of schema) {
    defaults[f.key] = f.defaultValue ?? (f.type === "number" ? 0 : f.type === "boolean" ? false : "");
  }
  return defaults;
}

interface Props {
  config: ScoutingConfig;
  onSubmit: (entry: ScoutingEntry) => void;
}

export default function ScoutingForm({ config, onSubmit }: Props) {
  const router = useRouter();
  const { name: scoutName } = useScouterName();
  const [matchNumber, setMatchNumber] = useState(1);
  const [teamNumber, setTeamNumber] = useState(0);
  const [alliance, setAlliance] = useState<"red" | "blue">("red");
  const [station, setStation] = useState<1 | 2 | 3>(1);
  const [fieldData, setFieldData] = useState<Record<string, any>>({});
  const [showExportPrompt, setShowExportPrompt] = useState(false);
  const [lastEntry, setLastEntry] = useState<ScoutingEntry | null>(null);

  useEffect(() => {
    setFieldData(buildDefaultValues(config.fieldSchema));
  }, [config]);

  function handleFieldChange(key: string, value: any) {
    setFieldData((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (teamNumber <= 0) {
      alert("Please enter a team number");
      return;
    }

    const entry: ScoutingEntry = {
      id: crypto.randomUUID(),
      configId: config.id,
      seasonId: config.seasonId,
      eventKey: config.eventKey,
      matchNumber,
      teamNumber,
      alliance,
      station,
      scoutName,
      submittedAt: Date.now(),
      data: { ...fieldData },
      exported: false,
    };
    setLastEntry(entry);
    onSubmit(entry);
    setShowExportPrompt(true);
  }

  function handleScoutNext() {
    setShowExportPrompt(false);
    setMatchNumber((m) => m + 1);
    setTeamNumber(0);
    setFieldData(buildDefaultValues(config.fieldSchema));
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-28">
      <FormHeader
        matchNumber={matchNumber}
        teamNumber={teamNumber}
        alliance={alliance}
        station={station}
        onMatchChange={setMatchNumber}
        onTeamChange={setTeamNumber}
        onAllianceChange={setAlliance}
        onStationChange={setStation}
      />
      {config.fieldSchema.map((field) => (
        <FieldInput
          key={field.key}
          field={field}
          value={fieldData[field.key]}
          onChange={(v) => handleFieldChange(field.key, v)}
        />
      ))}
      
      <button
        onClick={handleSubmit}
        disabled={teamNumber <= 0}
        className="w-full h-14 text-lg font-bold bg-green-600 text-white rounded-lg active:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed sticky bottom-24"
      >
        Save Entry
      </button>

      {showExportPrompt && lastEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-slate-800 rounded-t-lg p-4 border-t border-slate-700">
            <h2 className="text-xl font-bold text-white mb-2">Entry Saved!</h2>
            <p className="text-slate-300 mb-4">
              Match {lastEntry.matchNumber} — Team {lastEntry.teamNumber} recorded.
              Export now via QR code?
            </p>
            <div className="flex flex-col gap-3">
              <button
                className="btn-primary w-full h-12"
                onClick={() => {
                  setShowExportPrompt(false);
                  router.push(`/entries?highlight=${lastEntry.id}`);
                }}
              >
                Export QR
              </button>
              <button
                className="btn-secondary w-full h-12"
                onClick={handleScoutNext}
              >
                Scout Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
