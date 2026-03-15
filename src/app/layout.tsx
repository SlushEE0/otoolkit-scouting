import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "FRC Scout",
  description: "FRC Scouting PWA",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FRC Scout",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="dark bg-background text-foreground">
        <main className="pb-20">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
