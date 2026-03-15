"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { FieldDefinition, ScoutingConfig, ScoutingEntry } from "@/lib/types";
import FormHeader from "./FormHeader";
import FieldInput from "./FieldInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useScouterName } from "@/hooks/useScouterName";

function buildDefaultValues(schema: FieldDefinition[]): Record<string, string | number | boolean> {
  const defaults: Record<string, string | number | boolean> = {};
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
  const [fieldData, setFieldData] = useState<Record<string, string | number | boolean>>({});
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [lastEntry, setLastEntry] = useState<ScoutingEntry | null>(null);

  useEffect(() => {
    setFieldData(buildDefaultValues(config.fieldSchema));
  }, [config]);

  function handleFieldChange(key: string, value: string | number | boolean) {
    setFieldData((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
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
    setShowExportDialog(true);
  }

  function handleScoutNext() {
    setShowExportDialog(false);
    setMatchNumber((m) => m + 1);
    setTeamNumber(0);
    setFieldData(buildDefaultValues(config.fieldSchema));
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
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
      <div className="sticky bottom-20 pt-2">
        <Button
          onClick={handleSubmit}
          className="w-full h-14 text-lg font-bold"
          disabled={teamNumber <= 0}
        >
          Save Entry
        </Button>
        {teamNumber <= 0 && (
          <p className="text-xs text-muted-foreground text-center mt-1">Enter a team number to save</p>
        )}
      </div>
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entry Saved!</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Match {lastEntry?.matchNumber} — Team {lastEntry?.teamNumber} recorded.
            Export now via QR code?
          </p>
          <DialogFooter className="flex-col gap-2">
            <Button
              onClick={() => {
                setShowExportDialog(false);
                if (lastEntry) {
                  router.push(`/entries?highlight=${lastEntry.id}`);
                }
              }}
              className="w-full"
            >
              Export QR
            </Button>
            <Button variant="outline" onClick={handleScoutNext} className="w-full">
              Scout Next
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
