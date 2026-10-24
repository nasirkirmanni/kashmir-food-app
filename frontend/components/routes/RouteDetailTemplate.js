import React from "react";
import RouteHero from "./RouteHero";
import RouteElevationChart from "./RouteElevationChart";
import RouteChapters from "./RouteChapters";
import RouteFieldNotes from "./RouteFieldNotes";
import RouteClose from "./RouteClose";
import DriveRail from "./DriveRail";
import DriveReadout from "./DriveReadout";
import { useDriveProgress } from "./useDriveProgress";

export default function RouteDetailTemplate({ trail, heroImage }) {
  const waypoints = trail.waypoints || [];
  const { pct, currentKm, currentAlt, showReadout } = useDriveProgress(waypoints);

  const totalKm = waypoints.length > 0 
    ? [...waypoints].sort((a, b) => a.distanceKm - b.distanceKm).pop().distanceKm
    : 0;

  return (
    <div className="scenic-drives-root min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: `
        .scenic-drives-root {
          --ink: #08080a;
          --panel: #121012;
          --hair: rgba(255,255,255,0.08);
          --gold: #C9A24D;
          --gold-bright: #EBCB7E;
          --ivory: #F3ECDD;
          --dim: #8F8779;
          --dimmer: #55503f;
          
          background: var(--ink);
          color: var(--ivory);
          font-family: var(--font-body), sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        /* The route faces, self-hosted by app/layout.js: Cormorant Garamond for headings,
           IBM Plex Mono for labels and readouts, Inter for the rest */
        .scenic-drives-root .font-serif { font-family: var(--font-display), Georgia, serif; }
        .scenic-drives-root .font-mono { font-family: var(--font-ibm-plex), ui-monospace, monospace; }
        .scenic-drives-root .font-sans { font-family: var(--font-body), sans-serif; }

        /* Hide global layout components for an immersive experience */
        body > nav, 
        body > footer,
        .waza-ai-container,
        #waza-ai,
        .global-search-modal,
        nav.fixed, 
        footer.w-full {
          display: none !important;
        }

        /* Ken burns animation */
        @keyframes kenburns {
          to { transform: scale(1); }
        }
        .animate-kenburns {
          animation: kenburns 22s ease-out forwards;
        }
      `}} />

      {waypoints.length > 0 && (
        <>
          <DriveRail pct={pct} />
          <DriveReadout 
            currentKm={currentKm} 
            totalKm={totalKm} 
            currentAlt={currentAlt} 
            show={showReadout} 
          />
        </>
      )}

      <RouteHero trail={trail} heroImage={heroImage} />
      <RouteElevationChart trail={trail} />
      <RouteChapters waypoints={waypoints} />
      <RouteFieldNotes trail={trail} />
      <RouteClose trail={trail} />
    </div>
  );
}
