import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Optix Scouting Toolkit",
    short_name: "Optix Scout",
    description: "FRC team scouting application for real-time match data collection",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#1e293b",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["productivity", "sports"],
    screenshots: [
      {
        src: "/screenshot-1.png",
        sizes: "540x720",
        form_factor: "narrow",
      },
      {
        src: "/screenshot-2.png",
        sizes: "1280x720",
        form_factor: "wide",
      },
    ],
    shortcuts: [
      {
        name: "Scout Match",
        short_name: "Scout",
        description: "Start a new match entry",
        url: "/scout",
        icons: [{ src: "/shortcut-scout.png", sizes: "192x192" }],
      },
      {
        name: "View Entries",
        short_name: "Entries",
        description: "View submitted entries",
        url: "/entries",
        icons: [{ src: "/shortcut-entries.png", sizes: "192x192" }],
      },
    ],
  };
}
