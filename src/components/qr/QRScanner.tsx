"use client";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X } from "lucide-react";

interface Props {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export default function QRScanner({ onScan, onError, onCancel }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode("qr-scanner");
        scannerRef.current = scanner;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        };

        await scanner.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            scanner.stop();
            onScan(decodedText);
          },
          () => {
            // Ignore continuous scan errors
          }
        );
        setIsScanning(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to access camera";
        setError(message);
        onError?.(message);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {
          // Ignore stop errors
        });
      }
    };
  }, [onScan, onError]);

  const handleCancel = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
    }
    onCancel?.();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <h2 className="text-white text-lg font-bold">Scan QR Code</h2>
        <button
          onClick={handleCancel}
          className="text-white tap-highlight min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X size={28} />
        </button>
      </div>

      <div id="qr-scanner" className="w-full h-full relative" />

      {error && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 p-4">
          <p className="text-red-400 text-center font-semibold">{error}</p>
          {error.includes("Permission") && (
            <p className="text-slate-300 text-sm text-center">
              Camera permission denied. Please allow camera access in settings.
            </p>
          )}
          <button
            onClick={handleCancel}
            className="btn-secondary"
          >
            Close Scanner
          </button>
        </div>
      )}

      {!error && isScanning && (
        <div className="absolute bottom-8 left-4 right-4">
          <p className="text-slate-300 text-center text-sm">
            Point camera at QR code
          </p>
        </div>
      )}
    </div>
  );
}
