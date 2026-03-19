"use client";
import { useRouter } from "next/navigation";
import { useConfigs } from "@/hooks/useConfigs";
import { useEntries } from "@/hooks/useEntries";
import PageHeader from "@/components/layout/PageHeader";
import { ClipboardList, QrCode, Database } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { activeConfig } = useConfigs();
  const { entries, unsentCount } = useEntries();

  const entresToday = entries.filter(
    (e) => new Date(e.submittedAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="FRC Scout" subtitle="Ready to scout" />
      <div className="px-4 pb-4 flex flex-col gap-4">
        <div className="card">
          {activeConfig ? (
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Active Config</p>
              <p className="font-bold text-xl text-white mt-1">{activeConfig.name}</p>
              {activeConfig.eventKey && (
                <p className="text-sm text-slate-300 mt-1">{activeConfig.eventKey}</p>
              )}
            </div>
          ) : (
            <div>
              <p className="font-semibold text-slate-300">No config loaded</p>
              <p className="text-sm text-slate-400 mt-1">Scan a config QR to begin</p>
            </div>
          )}
        </div>

        <button
          className="w-full h-16 text-lg font-bold bg-blue-600 text-white rounded-lg active:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 tap-highlight"
          onClick={() => router.push("/scout")}
          disabled={!activeConfig}
        >
          <ClipboardList size={24} />
          Scout a Match
        </button>

        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center">
            <p className="text-4xl font-bold text-white">{entries.length}</p>
            <p className="text-xs text-slate-400 mt-2">Total Entries</p>
          </div>
          <div className="card text-center">
            <p className={`text-4xl font-bold ${unsentCount > 0 ? "text-yellow-400" : "text-white"}`}>
              {unsentCount}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Unsent{unsentCount > 0 ? " ⚠" : ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            className="h-14 gap-2 bg-slate-700 text-white font-semibold rounded-lg active:bg-slate-600 flex items-center justify-center tap-highlight"
            onClick={() => router.push("/configs")}
          >
            <QrCode size={20} />
            Scan Config
          </button>
          <button
            className="h-14 gap-2 bg-slate-700 text-white font-semibold rounded-lg active:bg-slate-600 flex items-center justify-center tap-highlight"
            onClick={() => router.push("/entries")}
          >
            <Database size={20} />
            View Entries
          </button>
        </div>
      </div>
    </div>
  );
}
