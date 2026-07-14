"use client";

import { useEffect, useState } from "react";

/**
 * useSceneMode — shared client detection for the homepage's cinematic scenes.
 * Returns { canEnhance, reducedMotion, scene } where `scene` is true only on
 * ≥768px viewports with motion allowed (pin + scroll choreography enabled).
 * Detection happens on the client to avoid SSR hydration mismatches.
 */
export default function useSceneMode() {
  const [canEnhance, setCanEnhance] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mqDesktop = window.matchMedia("(min-width: 768px)");
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setCanEnhance(mqDesktop.matches);
      setReducedMotion(mqMotion.matches);
    };
    sync();
    mqDesktop.addEventListener("change", sync);
    mqMotion.addEventListener("change", sync);
    return () => {
      mqDesktop.removeEventListener("change", sync);
      mqMotion.removeEventListener("change", sync);
    };
  }, []);

  return { canEnhance, reducedMotion, scene: canEnhance && !reducedMotion };
}
