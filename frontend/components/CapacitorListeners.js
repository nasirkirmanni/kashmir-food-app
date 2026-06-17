"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";

export default function CapacitorListeners() {
  useEffect(() => {
    let listener;

    const initListener = async () => {
      try {
        listener = await App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });
      } catch (err) {
        console.warn("Could not add backButton listener:", err);
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