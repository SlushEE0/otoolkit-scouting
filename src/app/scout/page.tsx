"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useConfigs } from "@/hooks/useConfigs";
import { useEntries } from "@/hooks/useEntries";
import { useScouterName } from "@/hooks/useScouterName";
import ScoutingForm from "@/components/forms/ScoutingForm";
import PageHeader from "@/components/layout/PageHeader";
import type { ScoutingEntry } from "@/lib/types";

export default function ScoutPage() {
  const router = useRouter();
  const { activeConfig } = useConfigs();
  const { saveEntry } = useEntries();
  const { name: scoutName } = useScouterName();
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleSubmit = useCallback(async (entry: ScoutingEntry) => {
    await saveEntry(entry);
    showToast("Entry saved!");
  }, [saveEntry]);

  if (!activeConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 gap-4">
        <p className="text-slate-400 text-center text-lg">No active config loaded.</p>
        <p className="text-slate-400 text-center text-sm">
          Go to Configs and scan a config QR code first.
        </p>
        <button
          className="btn-primary"
          onClick={() => router.push("/configs")}
        >
          Go to Configs
        </button>
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
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-full font-medium shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
