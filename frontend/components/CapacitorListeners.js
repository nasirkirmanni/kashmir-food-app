"use client";

import { useEffect } from "react";

export default function CapacitorListeners() {
  useEffect(() => {
    let listener;

    const initListener = async () => {
      try {
        // Dynamically import @capacitor/app — this will fail gracefully
        // on web/Vercel where the package is not installed
        const { App } = await import("@capacitor/app");
        listener = await App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });
      } catch (err) {
        // Expected on web — Capacitor is only available in the native app
      }
    };

    initListener();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, []);

  return null;
}