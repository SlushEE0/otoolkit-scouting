"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { QRChunk } from "@/lib/compression";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Camera, CameraOff, CheckCircle2, RefreshCw } from "lucide-react";

interface QRScannerProps {
  /** Called when all chunks have been assembled into a complete payload string (JSON). */
  onComplete: (data: string) => void;
}

/**
 * Camera-based QR code scanner that supports the app's chunked QR protocol.
 *
 * Uses html5-qrcode (dynamically imported to avoid SSR issues).
 * Reads QR codes one at a time, accumulates chunks by session ID,
 * shows progress, and fires onComplete when all chunks are collected.
 */
export default function QRScanner({ onComplete }: QRScannerProps) {
  const scannerRef = useRef<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Chunk accumulation state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [totalChunks, setTotalChunks] = useState(0);
  const [receivedChunks, setReceivedChunks] = useState<Map<number, string>>(
    new Map()
  );
  const [complete, setComplete] = useState(false);

  // Ref for latest chunk state so the scan callback can access it
  const chunkStateRef = useRef({
    sessionId: null as string | null,
    totalChunks: 0,
    receivedChunks: new Map<number, string>(),
    complete: false
  });

  useEffect(() => {
    chunkStateRef.current = {
      sessionId,
      totalChunks,
      receivedChunks,
      complete
    };
  }, [sessionId, totalChunks, receivedChunks, complete]);

  // Request camera permission and enumerate devices on mount
  useEffect(() => {
    let cancelled = false;

    async function requestPermissionAndEnumerate() {
      try {
        // First, explicitly request camera access to trigger the permission prompt.
        // On mobile browsers this is required before enumerating devices.
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        // Stop tracks immediately — we just needed the permission grant
        stream.getTracks().forEach((t) => t.stop());

        if (cancelled) return;
        setPermissionGranted(true);

        // Now enumerate cameras
        const { Html5Qrcode } = await import("html5-qrcode");
        const devices = await Html5Qrcode.getCameras();

        if (cancelled) return;

        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer a back/environment camera
          const back = devices.find(
            (d) =>
              /back|rear|environment/i.test(d.label) ||
              d.label === "" // unlabelled cameras are often the back cam on mobile
          );
          setSelectedCamera(back?.id || devices[devices.length - 1].id);
        }
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof Error ? err.message : String(err);
        if (/not allowed|denied|dismissed/i.test(msg)) {
          setError(
            "Camera permission denied. Please allow camera access in your browser settings and reload."
          );
        } else if (/not found|no devices/i.test(msg)) {
          setError("No camera found on this device.");
        } else if (/https|secure/i.test(msg)) {
          setError(
            "Camera requires a secure (HTTPS) connection. Please access this page over HTTPS."
          );
        } else {
          setError(`Camera error: ${msg}`);
        }
      }
    }

    requestPermissionAndEnumerate();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      if (chunkStateRef.current.complete) return;

      try {
        const chunk: QRChunk = JSON.parse(decodedText);

        // Validate chunk shape
        if (
          typeof chunk.s !== "string" ||
          typeof chunk.i !== "number" ||
          typeof chunk.t !== "number" ||
          typeof chunk.d !== "string"
        ) {
          return;
        }

        const state = chunkStateRef.current;

        // If this is a new session, reset
        if (state.sessionId && chunk.s !== state.sessionId) {
          const newMap = new Map<number, string>();
          newMap.set(chunk.i, chunk.d);
          setSessionId(chunk.s);
          setTotalChunks(chunk.t);
          setReceivedChunks(newMap);
          return;
        }

        // First chunk or same session
        if (!state.sessionId) {
          setSessionId(chunk.s);
          setTotalChunks(chunk.t);
        }

        // Add chunk if not already received
        if (!state.receivedChunks.has(chunk.i)) {
          const updated = new Map(state.receivedChunks);
          updated.set(chunk.i, chunk.d);
          setReceivedChunks(updated);

          // Check if all chunks received
          if (updated.size === chunk.t) {
            setComplete(true);
            const sorted = Array.from(updated.entries())
              .sort(([a], [b]) => a - b)
              .map(([, d]) => d);
            const assembled = sorted.join("");
            onComplete(assembled);
          }
        }
      } catch {
        // Not a valid JSON QR code, ignore
      }
    },
    [onComplete]
  );

  const startScanning = useCallback(async () => {
    setError(null);

    if (!selectedCamera) {
      setError("No camera selected.");
      return;
    }

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      // Clean up any previous instance
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (state === 2 /* SCANNING */) {
            await scannerRef.current.stop();
          }
        } catch {
          // ignore
        }
        scannerRef.current = null;
      }

      const scanner = new Html5Qrcode("qr-scanner-container", {
        verbose: false
      });
      scannerRef.current = scanner;

      // Use a responsive qrbox — 70% of container width, capped
      const container = document.getElementById("qr-scanner-container");
      const containerWidth = container?.clientWidth || 300;
      const qrboxSize = Math.min(Math.floor(containerWidth * 0.7), 250);

      await scanner.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: qrboxSize, height: qrboxSize }
        },
        handleScanSuccess,
        () => {} // ignore scan-failure frames
      );

      setIsScanning(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/not allowed|denied/i.test(msg)) {
        setError(
          "Camera permission denied. Allow camera access and try again."
        );
      } else {
        setError(`Failed to start scanner: ${msg}`);
      }
    }
  }, [selectedCamera, handleScanSuccess]);

  const stopScanning = useCallback(async () => {
    try {
      if (scannerRef.current) {
        const state = scannerRef.current.getState();
        if (state === 2 /* SCANNING */) {
          await scannerRef.current.stop();
        }
      }
    } catch {
      // ignore stop errors
    }
    setIsScanning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (scannerRef.current) {
          const state = scannerRef.current.getState();
          if (state === 2) {
            scannerRef.current.stop().catch(() => {});
          }
        }
      } catch {
        // ignore
      }
    };
  }, []);

  const reset = useCallback(() => {
    setSessionId(null);
    setTotalChunks(0);
    setReceivedChunks(new Map());
    setComplete(false);
  }, []);

  const progress =
    totalChunks > 0 ? (receivedChunks.size / totalChunks) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {complete ? (
            <CheckCircle2 className="size-5 text-green-500" />
          ) : (
            <Camera className="size-5" />
          )}
          {complete ? "Scan Complete" : "QR Code Scanner"}
        </CardTitle>
        <CardDescription>
          {complete
            ? "All chunks received! Importing config..."
            : "Point your camera at the QR code(s) to import a scouting config."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera selector (only show if multiple cameras) */}
        {cameras.length > 1 && !isScanning && (
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Camera</label>
            <Select value={selectedCamera} onValueChange={setSelectedCamera}>
              <SelectTrigger>
                <SelectValue placeholder="Select camera" />
              </SelectTrigger>
              <SelectContent>
                {cameras.map((cam) => (
                  <SelectItem key={cam.id} value={cam.id}>
                    {cam.label || `Camera ${cam.id.slice(0, 8)}…`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Camera viewport — must have explicit dimensions for html5-qrcode */}
        <div
          id="qr-scanner-container"
          className="w-full max-w-sm mx-auto rounded-lg overflow-hidden bg-muted"
          style={{ minHeight: isScanning ? "auto" : "200px" }}
        />

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {!isScanning ? (
            <Button
              onClick={startScanning}
              disabled={complete || !permissionGranted || !selectedCamera}>
              <Camera className="size-4 mr-2" />
              {permissionGranted ? "Start Scanning" : "Waiting for permission…"}
            </Button>
          ) : (
            <Button variant="outline" onClick={stopScanning}>
              <CameraOff className="size-4 mr-2" />
              Stop
            </Button>
          )}
          {(receivedChunks.size > 0 || complete) && (
            <Button variant="ghost" onClick={reset}>
              <RefreshCw className="size-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        {/* Progress */}
        {totalChunks > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Chunks received</span>
              <Badge variant={complete ? "default" : "secondary"}>
                {receivedChunks.size} / {totalChunks}
              </Badge>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive text-center">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
