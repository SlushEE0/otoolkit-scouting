"use client";
import { useState, useEffect } from "react";
import { useEntries } from "@/hooks/useEntries";
import { useConfigs } from "@/hooks/useConfigs";
import EntryList from "@/components/entries/EntryList";
import QRDisplay from "@/components/qr/QRDisplay";
import PageHeader from "@/components/layout/PageHeader";
import { encodeEntryToQR } from "@/lib/qr";
import type { ScoutingEntry } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { Suspense, useRef } from "react";

function EntriesContent() {
  const { entries, deleteEntry, markExported, unsentCount } = useEntries();
  const { configs } = useConfigs();
  const [teamFilter, setTeamFilter] = useState("");
  const [matchFilter, setMatchFilter] = useState("");
  const [qrEntry, setQrEntry] = useState<ScoutingEntry | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const highlight = searchParams.get("highlight");
    if (highlight) {
      const entry = entries.find((e) => e.id === highlight);
      if (entry) {
        setQrEntry(entry);
      }
    }
  }, [searchParams, entries]);

  const filtered = entries.filter((e) => {
    if (teamFilter && !String(e.teamNumber).includes(teamFilter)) return false;
    if (matchFilter && !String(e.matchNumber).includes(matchFilter)) return false;
    return true;
  });

  function showToast(msg: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMsg(msg);
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 3000);
  }

  function handleShowQR(entry: ScoutingEntry) {
    setQrEntry(entry);
  }

  async function handleQRDone() {
    if (qrEntry) {
      await markExported(qrEntry.id);
      showToast("Entry marked as exported");
    }
    setQrEntry(null);
  }

  return (
    <div className="flex flex-col">
      <PageHeader title="Entries" subtitle={`${entries.length} total · ${unsentCount} unsent`} />
      <div className="px-4 pb-4 flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Filter by team…"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="flex-1 h-10 px-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500"
          />
          <input
            type="text"
            placeholder="Match #"
            value={matchFilter}
            onChange={(e) => setMatchFilter(e.target.value)}
            className="w-24 h-10 px-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500"
          />
        </div>

        <EntryList
          entries={filtered}
          onShowQR={handleShowQR}
          onDelete={deleteEntry}
          configs={configs}
        />
      </div>

      {qrEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-slate-800 rounded-t-lg p-4 border-t border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                M{qrEntry.matchNumber} · #{qrEntry.teamNumber}
              </h2>
              <button
                onClick={() => setQrEntry(null)}
                className="text-slate-400 text-2xl font-bold tap-highlight"
              >
                ×
              </button>
            </div>
            <div className="flex justify-center mb-4">
              <QRDisplay
                data={encodeEntryToQR(qrEntry)}
                label={`Match ${qrEntry.matchNumber} · Team ${qrEntry.teamNumber}`}
                onDone={handleQRDone}
              />
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-full font-medium shadow-lg">
          {toastMsg}
        </div>
      )}
    </div>
  );
}

export default function EntriesPage() {
  return (
    <Suspense>
      <EntriesContent />
    </Suspense>
  );
}
