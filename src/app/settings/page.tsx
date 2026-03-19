"use client";
import { useState, useRef } from "react";
import { useScouterName, SCOUTER_NAME_KEY } from "@/hooks/useScouterName";
import { useConfigs } from "@/hooks/useConfigs";
import PageHeader from "@/components/layout/PageHeader";
import { db } from "@/lib/db";

export default function SettingsPage() {
  const { name, setName } = useScouterName();
  const { activeConfig } = useConfigs();
  const [confirmClearEntries, setConfirmClearEntries] = useState(false);
  const [confirmClearConfigs, setConfirmClearConfigs] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMsg(msg);
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 3000);
  }

  async function clearEntries() {
    await db.entries.clear();
    setConfirmClearEntries(false);
    showToast("All entries cleared");
  }

  async function clearConfigs() {
    await db.configs.clear();
    setConfirmClearConfigs(false);
    showToast("All configs cleared");
  }

  async function resetApp() {
    await db.entries.clear();
    await db.configs.clear();
    localStorage.removeItem(SCOUTER_NAME_KEY);
    setConfirmReset(false);
    showToast("App reset complete");
    setTimeout(() => window.location.reload(), 1000);
  }

  return (
    <div className="flex flex-col">
      <PageHeader title="Settings" />
      <div className="px-4 pb-4 flex flex-col gap-4">

        <div className="card">
          <h3 className="text-lg font-bold text-white mb-3">Scout Identity</h3>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-200">Your Name</label>
            <input
              type="text"
              placeholder="Enter your name…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-slate-800 border border-slate-600 text-white"
            />
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-white mb-3">Active Config</h3>
          {activeConfig ? (
            <div>
              <p className="font-semibold text-white">{activeConfig.name}</p>
              {activeConfig.eventKey && (
                <p className="text-sm text-slate-400">{activeConfig.eventKey}</p>
              )}
              <p className="text-xs text-slate-400 mt-2">
                {activeConfig.fieldSchema.length} fields
              </p>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No active config</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-white mb-3">About</h3>
          <p className="text-sm text-slate-300">FRC Scout v1.0.0</p>
          <p className="text-xs text-slate-400 mt-1">Offline-first FRC scouting PWA</p>
        </div>

        <div className="h-px bg-slate-700 my-2" />

        <div className="card border-red-900/50 bg-slate-800/50">
          <h3 className="text-lg font-bold text-red-400 mb-3">Danger Zone</h3>
          <div className="flex flex-col gap-3">
            {confirmClearEntries ? (
              <div className="flex gap-2">
                <button
                  onClick={clearEntries}
                  className="btn-danger flex-1 h-11"
                >
                  Confirm Delete All Entries
                </button>
                <button
                  onClick={() => setConfirmClearEntries(false)}
                  className="btn-secondary flex-1 h-11"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClearEntries(true)}
                className="btn-secondary w-full h-11"
              >
                Clear All Entries
              </button>
            )}

            {confirmClearConfigs ? (
              <div className="flex gap-2">
                <button
                  onClick={clearConfigs}
                  className="btn-danger flex-1 h-11"
                >
                  Confirm Delete All Configs
                </button>
                <button
                  onClick={() => setConfirmClearConfigs(false)}
                  className="btn-secondary flex-1 h-11"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClearConfigs(true)}
                className="btn-secondary w-full h-11"
              >
                Clear All Configs
              </button>
            )}

            {confirmReset ? (
              <div className="flex gap-2">
                <button
                  onClick={resetApp}
                  className="btn-danger flex-1 h-11"
                >
                  Confirm Reset App
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="btn-secondary flex-1 h-11"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="btn-danger w-full h-11"
              >
                Reset App
              </button>
            )}
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-full font-medium shadow-lg">
          {toastMsg}
        </div>
      )}
    </div>
  );
}

