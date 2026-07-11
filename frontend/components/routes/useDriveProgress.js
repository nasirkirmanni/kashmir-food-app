import { useState, useEffect, useRef } from "react";

/**
 * Custom hook to track scroll-driven progress along a route.
 * 
 * @param {Array} waypoints - The full array of route waypoints
 * @returns {Object} { pct (0-1), currentKm, currentAlt, showReadout }
 */
export function useDriveProgress(waypoints) {
  const [progress, setProgress] = useState({ pct: 0, currentKm: 0, currentAlt: 0, showReadout: false });
  const rafId = useRef(null);

  useEffect(() => {
    if (!waypoints || waypoints.length === 0) return;

    // Ensure waypoints are sorted by distance
    const sorted = [...waypoints].sort((a, b) => a.distanceKm - b.distanceKm);
    const totalDistanceKm = sorted[sorted.length - 1].distanceKm;

    const onScroll = () => {
      if (rafId.current) return;
      
      rafId.current = requestAnimationFrame(() => {
        const doc = document.documentElement;
        // Calculate scroll percentage (0 to 1)
        const scrollableHeight = doc.scrollHeight - window.innerHeight;
        const pct = scrollableHeight > 0 
          ? Math.max(0, Math.min(1, window.scrollY / scrollableHeight))
          : 0;
        
        const currentKm = pct * totalDistanceKm;
        
        // Piecewise linear interpolation for altitude
        let currentAlt = sorted[0].elevationM;
        
        for (let i = 0; i < sorted.length - 1; i++) {
          const wp1 = sorted[i];
          const wp2 = sorted[i + 1];
          
          if (currentKm >= wp1.distanceKm && currentKm <= wp2.distanceKm) {
            const segmentDist = wp2.distanceKm - wp1.distanceKm;
            if (segmentDist === 0) {
              currentAlt = wp1.elevationM;
            } else {
              const segmentPct = (currentKm - wp1.distanceKm) / segmentDist;
              currentAlt = wp1.elevationM + segmentPct * (wp2.elevationM - wp1.elevationM);
            }
            break;
          }
        }
        
        // Handle case where currentKm is beyond the last waypoint due to precision
        if (currentKm >= totalDistanceKm) {
          currentAlt = sorted[sorted.length - 1].elevationM;
        }

        const showReadout = window.scrollY > window.innerHeight * 0.6;

        setProgress({
          pct,
          currentKm: Math.round(currentKm),
          currentAlt: Math.round(currentAlt),
          showReadout
        });
        
        rafId.current = null;
      });
    };

    // Initial calculation
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [waypoints]);

  return progress;
}
