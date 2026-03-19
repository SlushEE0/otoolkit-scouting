"use client";

import { useEffect, useState } from "react";

export default function ServiceWorkerRegistration() {
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
          setRegistered(true);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });

      // Handle service worker messages
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "SYNC_ENTRIES") {
          console.log("Background sync triggered");
          // Dispatch custom event for components to listen to
          window.dispatchEvent(
            new CustomEvent("entriesSyncRequired", {
              detail: { timestamp: event.data.timestamp },
            })
          );
        }
      });
    }
  }, []);

  // Request permission for push notifications if registered
  useEffect(() => {
    if (registered && "serviceWorker" in navigator && "PushManager" in window) {
      if (Notification.permission === "granted") {
        // User has already granted permission
        console.log("Push notifications already enabled");
      } else if (Notification.permission !== "denied") {
        // Ask for permission
        console.log("Push notification permission: ask on user action");
      }
    }
  }, [registered]);

  return null;
}
