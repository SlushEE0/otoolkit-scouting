import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: {
    default: "Optix Scouting",
    template: "%s | Optix Scouting",
  },
  description: "FRC team scouting application for real-time match data collection",
  applicationName: "Optix Scouting",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Optix Scouting",
  },
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/icon-192x192.png" },
    { rel: "apple-touch-icon", url: "/icon-192x192.png" },
    { rel: "icon", url: "/icon-512x512.png", sizes: "512x512" },
  ],
};

export const viewport: Viewport = {
  themeColor: "#1e293b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Optix Scouting" />
        <meta name="theme-color" content="#1e293b" />
      </head>
      <body className="bg-slate-900 text-slate-50">
        <ServiceWorkerRegistration />
        <main className="pb-20">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
