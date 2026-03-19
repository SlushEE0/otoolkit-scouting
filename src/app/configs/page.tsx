"use client";
import { useState, useEffect, useRef } from "react";
import { useConfigs } from "@/hooks/useConfigs";
import ConfigList from "@/components/configs/ConfigList";
import PageHeader from "@/components/layout/PageHeader";
import { QrCode } from "lucide-react";
import { decodeConfigQR } from "@/lib/qr";
import dynamic from "next/dynamic";

const QRScanner = dynamic(() => import("@/components/qr/QRScanner"), { ssr: false });

export default function ConfigsPage() {
  const { configs, saveConfig, setActiveConfig, deleteConfig } = useConfigs();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  async function handleScan(raw: string) {
    const config = decodeConfigQR(raw);
    if (!config) {
      setError("Invalid config QR code. Please try again.");
      return;
    }
    setError(null);
    setScannerOpen(false);
    await saveConfig(config);
    showToast(`Config "${config.name}" loaded!`);
  }

  return (
    <div className="flex flex-col">
      <PageHeader title="Configs" subtitle={`${configs.length} saved`} />
      <div className="px-4 pb-4 flex flex-col gap-4">
        <button
          className="w-full h-14 gap-2 text-base bg-blue-600 text-white font-semibold rounded-lg active:bg-blue-700 flex items-center justify-center tap-highlight"
          onClick={() => { setError(null); setScannerOpen(true); }}
        >
          <QrCode size={22} />
          Scan New Config
        </button>
        <ConfigList configs={configs} onSetActive={setActiveConfig} onDelete={deleteConfig} />
      </div>

      {scannerOpen && (
        <div className="fixed inset-0 z-50">
          <QRScanner
            onScan={handleScan}
            onError={(msg) => setError(msg)}
            onCancel={() => setScannerOpen(false)}
          />
        </div>
      )}

      {error && scannerOpen === false && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold">
          {error}
        </div>
      )}

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-full font-medium shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
