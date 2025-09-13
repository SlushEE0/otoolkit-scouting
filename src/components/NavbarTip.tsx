"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ChevronUp } from "lucide-react";
import { useNavbar } from "@/hooks/useNavbar";

const STORAGE_KEY = "navbarTipSeen";

export function NavbarTip({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [navMetrics, setNavMetrics] = useState<{
    top: number;
    height: number;
  } | null>(null);
  const navbarState = useNavbar();
  const rafRef = useRef<number | null>(null);

  const persistSeen = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setVisible(false);
  }, []);

  const measureNavbar = useCallback(() => {
    const el = document.querySelector<HTMLElement>("[data-navbar-root]");
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setNavMetrics({ top: rect.top + window.scrollY, height: rect.height });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {}

    const isCoarse = window.matchMedia(
      "(any-pointer: coarse), (pointer: coarse)"
    ).matches;
    setIsMobile(isCoarse);

    // delay show for layout + navbar mount
    const showTimer = setTimeout(() => {
      measureNavbar();
      setVisible(true);
    }, 600);

    const onResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measureNavbar);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!visible) return;
      if (e.clientY <= 8) persistSeen();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") persistSeen();
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("keydown", handleKey);

    onResize();

    return () => {
      clearTimeout(showTimer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKey);
    };
  }, [measureNavbar, persistSeen, visible]);

  if (!visible || !navMetrics) return null;

  // If navbar defaultToShown is false, we still position where it would appear (top + height + spacing)
  const offsetY = (navMetrics.top ?? 0) + navMetrics.height + 6; // 6px gap under navbar

  return (
    <div
      role="note"
      aria-label={
        isMobile
          ? "Tap the menu button to open navigation"
          : "Move your cursor to the top edge to reveal the navbar"
      }
      onClick={persistSeen}
      onTouchStart={persistSeen}
      style={{ top: offsetY }}
      className={[
        "fixed left-1/2 -translate-x-1/2 z-40 select-none flex flex-col items-center gap-1",
        "pointer-events-auto cursor-pointer animate-in fade-in",
        className || ""
      ].join(" ")}>
      <div className="h-px w-56 bg-gradient-to-r from-transparent via-primary/70 to-transparent animate-pulse" />
      <ChevronUp className="h-4 w-4 text-primary animate-bounce" />
      <span className="text-[10px] font-medium tracking-wide text-primary/80">
        {isMobile ? "Open the Nav Menu" : "Open the Navbar"}
      </span>
    </div>
  );
}

export default NavbarTip;
