"use client";
import { useEffect, useRef, useState } from "react";
import type { Html5QrcodeScanner as Html5QrcodeScannerType } from "html5-qrcode";
import { Button } from "@/components/ui/button";

interface Props {
  onScan: (raw: string) => void;
  onError?: (msg: string) => void;
  onCancel?: () => void;
}

export default function QRScanner({ onScan, onError, onCancel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5QrcodeScannerType | null>(null);
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Keep refs in sync so the scanner callbacks always call the latest prop values
  onScanRef.current = onScan;
  onErrorRef.current = onError;

  useEffect(() => {
    let mounted = true;
    const containerId = "qr-scanner-container";

    async function init() {
      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode");
        if (!mounted || !containerRef.current) return;

        const scanner = new Html5QrcodeScanner(
          containerId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
            showTorchButtonIfSupported: true,
          },
          false
        );

        scannerRef.current = scanner;
        scanner.render(
          (decodedText: string) => {
            onScanRef.current(decodedText);
            scanner.clear().catch(() => {});
          },
          (_errorMsg: string) => {
            // Ignore frequent scan errors
          }
        );
        setLoading(false);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (error.message.includes("permission") || (err as { name?: string })?.name === "NotAllowedError") {
          setPermissionDenied(true);
        }
        onErrorRef.current?.(error.message);
        setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  if (permissionDenied) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <p className="text-muted-foreground">Camera permission denied. Please allow camera access in your browser settings.</p>
        {onCancel && <Button variant="outline" onClick={onCancel}>Cancel</Button>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {loading && <p className="text-center text-muted-foreground text-sm">Starting camera…</p>}
      <div id="qr-scanner-container" ref={containerRef} className="w-full" />
      {onCancel && (
        <Button variant="outline" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      )}
    </div>
  );
}
