"use client";
import { useEffect, useRef } from "react";

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
    <div className="flex flex-col items-center gap-6">
      {label && <p className="text-sm font-medium text-slate-400">{label}</p>}
      <canvas ref={canvasRef} className="rounded-lg max-w-[280px] w-full bg-white p-2" />
      {onDone && (
        <button
          onClick={onDone}
          className="btn-primary w-full max-w-[280px] h-12"
        >
          Done
        </button>
      )}
    </div>
  );
}
