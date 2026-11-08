"use client";

import { useEffect } from "react";
import { captureInstallEvents } from "./installStore";

const enabled = process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_ENABLE_SW === "true";

export function ServiceWorkerRegister() {
  useEffect(() => captureInstallEvents(), []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (!enabled) {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => registrations.forEach((registration) => void registration.unregister()));
      return;
    }
    void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => undefined);
  }, []);

  return null;
}
