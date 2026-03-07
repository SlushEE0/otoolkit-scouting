"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { decompressData } from "@/lib/compression";
import { saveConfigLocally } from "@/lib/db/offlineDb";
import type {
  ScoutingQuestionConfig,
  SelectOption
} from "@/lib/types/scouting";

import QRScanner from "@/components/QRScanner";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface ImportedConfig {
  questions: ScoutingQuestionConfig[];
  teamOptions?: SelectOption[];
  selectOptions?: Record<string, SelectOption[]>;
}

function validateConfig(data: unknown): ImportedConfig | null {
  if (!data || typeof data !== "object") return null;

  const obj = data as Record<string, unknown>;

  // Accept both { questions, teamOptions, selectOptions } shape
  // and raw array (just questions)
  let questions: ScoutingQuestionConfig[];
  let teamOptions: SelectOption[] = [];
  let selectOptions: Record<string, SelectOption[]> = {};

  if (Array.isArray(obj)) {
    questions = obj as ScoutingQuestionConfig[];
  } else if (Array.isArray(obj.questions)) {
    questions = obj.questions as ScoutingQuestionConfig[];
    if (Array.isArray(obj.teamOptions)) {
      teamOptions = obj.teamOptions as SelectOption[];
    }
    if (
      obj.selectOptions &&
      typeof obj.selectOptions === "object" &&
      !Array.isArray(obj.selectOptions)
    ) {
      selectOptions = obj.selectOptions as Record<string, SelectOption[]>;
    }
  } else {
    return null;
  }

  // Basic validation: every question needs name and type
  if (
    !questions.every(
      (q) =>
        typeof q === "object" &&
        q !== null &&
        typeof q.name === "string" &&
        typeof q.type === "string"
    )
  ) {
    return null;
  }

  return { questions, teamOptions, selectOptions };
}

/**
 * /scan page — scans QR code(s) to import a scouting config and saves to IndexedDB.
 */
export default function ScanPage() {
  const router = useRouter();
  const [imported, setImported] = useState(false);

  const handleComplete = useCallback(
    async (compressedPayload: string) => {
      try {
        const raw = decompressData(compressedPayload);
        const config = validateConfig(raw);

        if (!config) {
          toast.error("Invalid scouting config format.");
          return;
        }

        await saveConfigLocally(
          config.questions,
          config.teamOptions ?? [],
          config.selectOptions ?? {}
        );

        setImported(true);
        toast.success(
          `Imported ${config.questions.length} question${config.questions.length !== 1 ? "s" : ""} successfully!`
        );

        // Navigate after short delay so user can see the success
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } catch (err) {
        console.error("Import error:", err);
        toast.error("Failed to import config. The QR data may be corrupted.");
      }
    },
    [router]
  );

  return (
    <div className="w-full h-full container mx-auto flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">Import Config via QR</h1>
        <p className="text-muted-foreground text-sm">
          Scan the QR code(s) generated from the Configure page to import a
          scouting config onto this device.
        </p>
      </div>

      {imported ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <CheckCircle2 className="size-12 text-green-500" />
            <p className="text-lg font-semibold">Config Imported!</p>
            <p className="text-sm text-muted-foreground">
              Redirecting to scouting...
            </p>
          </CardContent>
        </Card>
      ) : (
        <QRScanner onComplete={handleComplete} />
      )}
    </div>
  );
}
