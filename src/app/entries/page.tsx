"use client";
import { useState, useEffect } from "react";
import { useEntries } from "@/hooks/useEntries";
import { useConfigs } from "@/hooks/useConfigs";
import EntryList from "@/components/entries/EntryList";
import QRDisplay from "@/components/qr/QRDisplay";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { encodeEntryToQR } from "@/lib/qr";
import type { ScoutingEntry } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function EntriesContent() {
  const { entries, deleteEntry, markExported, unsentCount } = useEntries();
  const { configs } = useConfigs();
  const [teamFilter, setTeamFilter] = useState("");
  const [matchFilter, setMatchFilter] = useState("");
  const [qrEntry, setQrEntry] = useState<ScoutingEntry | null>(null);
  const searchParams = useSearchParams();

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

  function handleShowQR(entry: ScoutingEntry) {
    setQrEntry(entry);
  }

  async function handleQRDone() {
    if (qrEntry) await markExported(qrEntry.id);
    setQrEntry(null);
  }

  async function exportAllUnsent() {
    const unsent = entries.filter((e) => !e.exported);
    if (unsent.length === 0) return;
    setQrEntry(unsent[0]);
  }

  return (
    <div className="flex flex-col">
      <PageHeader title="Entries" subtitle={`${entries.length} total · ${unsentCount} unsent`} />
      <div className="px-4 flex flex-col gap-3">
        <div className="flex gap-2">
          <Input
            placeholder="Filter by team…"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Match #"
            value={matchFilter}
            onChange={(e) => setMatchFilter(e.target.value)}
            className="w-24"
          />
        </div>
        {unsentCount > 0 && (
          <Button variant="outline" onClick={exportAllUnsent} className="w-full">
            Export all unsent ({unsentCount})
          </Button>
        )}
        <EntryList
          entries={filtered}
          onShowQR={handleShowQR}
          onDelete={deleteEntry}
          configs={configs}
        />
      </div>
      <Dialog open={!!qrEntry} onOpenChange={(open) => !open && setQrEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {qrEntry ? `M${qrEntry.matchNumber} · #${qrEntry.teamNumber}` : "QR Code"}
            </DialogTitle>
          </DialogHeader>
          {qrEntry && (
            <QRDisplay
              data={encodeEntryToQR(qrEntry)}
              label={`Match ${qrEntry.matchNumber} · Team ${qrEntry.teamNumber}`}
              onDone={handleQRDone}
            />
          )}
        </DialogContent>
      </Dialog>
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
