"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useConfigs } from "@/hooks/useConfigs";
import { useEntries } from "@/hooks/useEntries";
import { useScouterName } from "@/hooks/useScouterName";
import ScoutingForm from "@/components/forms/ScoutingForm";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import type { ScoutingEntry } from "@/lib/types";

export default function ScoutPage() {
  const router = useRouter();
  const { activeConfig } = useConfigs();
  const { saveEntry } = useEntries();
  const { name: scoutName } = useScouterName();
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const handleSubmit = useCallback(async (entry: ScoutingEntry) => {
    await saveEntry(entry);
    showToast("Entry saved!");
  }, [saveEntry]);

  if (!activeConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 gap-4">
        <p className="text-muted-foreground text-center text-lg">No active config loaded.</p>
        <p className="text-muted-foreground text-center text-sm">
          Go to Configs and scan a config QR code first.
        </p>
        <Button onClick={() => router.push("/configs")}>Go to Configs</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Scout"
        subtitle={`${activeConfig.name}${activeConfig.eventKey ? ` · ${activeConfig.eventKey}` : ""}${scoutName ? ` · ${scoutName}` : ""}`}
      />
      <ScoutingForm config={activeConfig} onSubmit={handleSubmit} />
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
