"use client";
import { useState } from "react";
import { useConfigs } from "@/hooks/useConfigs";
import ConfigList from "@/components/configs/ConfigList";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QrCode } from "lucide-react";
import { decodeConfigQR } from "@/lib/qr";
import dynamic from "next/dynamic";

const QRScanner = dynamic(() => import("@/components/qr/QRScanner"), { ssr: false });

export default function ConfigsPage() {
  const { configs, saveConfig, setActiveConfig, deleteConfig } = useConfigs();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

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
      <div className="px-4 flex flex-col gap-4">
        <Button
          className="w-full h-14 gap-2 text-base"
          onClick={() => { setError(null); setScannerOpen(true); }}
        >
          <QrCode size={22} />
          Scan New Config
        </Button>
        <ConfigList configs={configs} onSetActive={setActiveConfig} onDelete={deleteConfig} />
      </div>
      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Config QR</DialogTitle>
          </DialogHeader>
          {error && (
            <p className="text-sm text-red-500 bg-red-500/10 rounded p-2">{error}</p>
          )}
          {scannerOpen && (
            <QRScanner
              onScan={handleScan}
              onError={(msg) => setError(msg)}
              onCancel={() => setScannerOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
