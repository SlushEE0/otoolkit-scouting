"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  getAllSubmissions,
  getUnexportedSubmissions,
  markAsExported,
  type OfflineScoutingSubmission
} from "@/lib/db/offlineDb";
import { compressData, createQRChunks, type QRChunk } from "@/lib/compression";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowLeft,
  Package
} from "lucide-react";

/**
 * Export page — compresses unsynced submissions and displays them
 * as a sequence of QR codes for scanning by the Windows companion app.
 *
 * Protocol:
 * 1. Gather all unexported submissions.
 * 2. Compress with lz-string.
 * 3. If payload > 1800 chars, split into chunks.
 * 4. Display one QR at a time with navigation controls.
 * 5. Mark entries as exported (but don't delete them).
 */
export default function ExportPage() {
  const [submissions, setSubmissions] = useState<OfflineScoutingSubmission[]>(
    []
  );
  const [chunks, setChunks] = useState<QRChunk[]>([]);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [exportMode, setExportMode] = useState<"all" | "unexported">(
    "unexported"
  );
  const [isReady, setIsReady] = useState(false);
  const [totalAll, setTotalAll] = useState(0);
  const [totalUnexported, setTotalUnexported] = useState(0);

  const loadCounts = useCallback(async () => {
    const all = await getAllSubmissions();
    const unexported = await getUnexportedSubmissions();
    setTotalAll(all.length);
    setTotalUnexported(unexported.length);
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const generateExport = async (mode: "all" | "unexported") => {
    setExportMode(mode);
    const entries =
      mode === "all"
        ? await getAllSubmissions()
        : await getUnexportedSubmissions();

    if (entries.length === 0) {
      toast.info("No submissions to export.");
      return;
    }

    setSubmissions(entries);

    // Build export payload: array of submission objects
    const payload = entries.map((e) => ({
      uuid: e.uuid,
      deviceId: e.deviceId,
      timestamp: e.timestamp,
      responses: JSON.parse(e.responses)
    }));

    const compressed = compressData(payload);
    const sessionId = uuidv4();
    const qrChunks = createQRChunks(compressed, sessionId);

    setChunks(qrChunks);
    setCurrentChunk(0);
    setIsReady(true);
  };

  const handleMarkExported = async () => {
    const ids = submissions
      .filter((s) => s.id !== undefined)
      .map((s) => s.id as number);
    await markAsExported(ids);
    toast.success(`Marked ${ids.length} entries as exported.`);
    await loadCounts();
  };

  return (
    <div className="w-full h-full container mx-auto flex flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Export Data</h1>
          <p className="text-muted-foreground text-sm">
            Transfer scouting data via QR codes
          </p>
        </div>
      </div>

      {!isReady ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Select Export Mode
            </CardTitle>
            <CardDescription>
              Choose which submissions to export as QR codes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-1"
                onClick={() => generateExport("unexported")}
                disabled={totalUnexported === 0}>
                <span className="font-semibold">Unexported Only</span>
                <Badge variant="secondary">{totalUnexported} entries</Badge>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-1"
                onClick={() => generateExport("all")}
                disabled={totalAll === 0}>
                <span className="font-semibold">All Submissions</span>
                <Badge variant="secondary">{totalAll} entries</Badge>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code {currentChunk + 1} of {chunks.length}
            </CardTitle>
            <CardDescription>
              Scan each QR code in order with the Windows companion app.
              {submissions.length} submission{submissions.length !== 1 && "s"}{" "}
              encoded.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {chunks[currentChunk] && (
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG
                  value={JSON.stringify(chunks[currentChunk])}
                  size={280}
                  level="M"
                />
              </div>
            )}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentChunk((c) => c - 1)}
                disabled={currentChunk === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium tabular-nums">
                {currentChunk + 1} / {chunks.length}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentChunk((c) => c + 1)}
                disabled={currentChunk === chunks.length - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setIsReady(false);
                setChunks([]);
              }}>
              Back
            </Button>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleMarkExported}>
                <Check className="h-4 w-4 mr-2" />
                Mark as Exported
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
