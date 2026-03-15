"use client";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  data: string;
  label?: string;
  onDone?: () => void;
}

export default function QRDisplay({ data, label, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    import("qrcode").then((QRCode) => {
      QRCode.toCanvas(canvasRef.current!, data, {
        width: 280,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
    });
  }, [data]);

  return (
    <div className="flex flex-col items-center gap-4">
      {label && <p className="text-sm font-medium text-muted-foreground">{label}</p>}
      <canvas ref={canvasRef} className="rounded-lg max-w-[280px] w-full" />
      {onDone && (
        <Button onClick={onDone} className="w-full max-w-[280px]">
          Done
        </Button>
      )}
    </div>
  );
}
