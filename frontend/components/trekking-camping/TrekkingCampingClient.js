"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import TrekCampHero from "./TrekCampHero";
import ModeToggle from "./ModeToggle";
import AltimeterDial from "./AltimeterDial";
import DestinationSection from "./DestinationSection";
import CloseSection from "./CloseSection";

const MAX_ELEV = 15000;

export default function TrekkingCampingClient({ treks, camps }) {
  const router = useRouter();
  const [mode, setMode] = useState("trek");
  const [altData, setAltData] = useState({ elevation: 0, name: "Scroll to begin", visible: false });
  const [mounted, setMounted] = useState(false);
  const railRef = useRef(null);
  const pageRef = useRef(null);
  const rafScrollId = useRef(null);
  const observerRef = useRef(null);

  // --- Mode change handler (updates CSS custom properties) ---
  const handleModeChange = useCallback((newMode, shouldScroll = false) => {
    setMode(newMode);
    const isTrek = newMode === "trek";
    document.documentElement.style.setProperty(
      "--accent",
      isTrek ? "#C9A24D" : "#D9834A"
    );
    document.documentElement.style.setProperty(
      "--accent-bright",
      isTrek ? "#EFCF83" : "#F0A968"
    );

    if (shouldScroll) {
      const target = document.querySelector(`.tc-dest[data-mode="${newMode}"]`);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // --- Top progress rail (rAF-throttled scroll) ---
  useEffect(() => {
    setMounted(true);
    
    // Set initial custom properties for portaled elements
    document.documentElement.style.setProperty("--accent", "#C9A24D");
    document.documentElement.style.setProperty("--accent-bright", "#EFCF83");

    const rail = railRef.current;
    if (!rail) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const doc = document.documentElement;
        const pct = window.scrollY / (doc.scrollHeight - window.innerHeight);
        rail.style.width = (pct * 100) + "%";
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- IntersectionObserver for destination reveal + altimeter + mode sync ---
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;

          // Add reveal class
          e.target.classList.add("in");

          // Update altimeter and mode for destination sections
          if (e.target.classList.contains("tc-dest")) {
            const elev = parseInt(e.target.dataset.elevation, 10);
            const name = e.target.dataset.name;
            const sectionMode = e.target.dataset.mode;

            setAltData({ elevation: elev, name, visible: true });
            setMode((prev) => {
              if (prev !== sectionMode) {
                // Sync CSS custom properties
                const isTrek = sectionMode === "trek";
                document.documentElement.style.setProperty(
                  "--accent",
                  isTrek ? "#C9A24D" : "#D9834A"
                );
                document.documentElement.style.setProperty(
                  "--accent-bright",
                  isTrek ? "#EFCF83" : "#F0A968"
                );
                return sectionMode;
              }
              return prev;
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    observerRef.current = io;

    // Observe all dest sections + stage intros
    const page = pageRef.current;
    if (page) {
      page.querySelectorAll(".tc-dest, .tc-manifesto, .tc-stage-intro").forEach((el) => {
        io.observe(el);
      });
    }

    return () => io.disconnect();
  }, [treks, camps]);

  return (
    <div className="tc-page" ref={pageRef}>
      {mounted && createPortal(
        <>
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="tc-back-btn"
            aria-label="Go back"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>

          {/* Top progress rail */}
          <div className="tc-rail" ref={railRef} />

          {/* Fixed overlays */}
          <ModeToggle mode={mode} onModeChange={handleModeChange} />
          <AltimeterDial
            elevation={altData.elevation}
            name={altData.name}
            visible={altData.visible}
            maxElev={MAX_ELEV}
          />
        </>,
        document.body
      )}

      {/* Hero */}
      <TrekCampHero />

      {/* Manifesto */}
      <section className="tc-manifesto">
        <span className="tc-tag">Why here</span>
        <p className="serif">
          Switzerland has its peaks. New Zealand has its trails. Kashmir has kept
          its wild <em>quiet</em> — for now.
        </p>
      </section>

      {/* Trek stage intro */}
      <section className="tc-stage-intro" data-mode="trek">
        <span className="tc-tag">Chapter One</span>
        <h2 className="serif">
          Five trails. Every altitude Kashmir has to offer.
        </h2>
        <p>
          From a gentle 4-day forest climb to a 9-day crossing into Zanskar —
          ranked here by how hard the mountain fights back.
        </p>
      </section>

      {/* Trek sections */}
      {treks.map((trek, i) => (
        <DestinationSection
          key={trek._id || trek.slug || i}
          item={trek}
          index={i}
          mode="trek"
          total={treks.length}
        />
      ))}

      {/* Camp stage intro */}
      <section className="tc-stage-intro" data-mode="camp">
        <span className="tc-tag">Chapter Two</span>
        <h2 className="serif">
          Five basecamps. Zero cities in sight.
        </h2>
        <p>
          Some are a short drive from Srinagar. Others take real commitment to
          reach. All of them end the same way — silence, and a sky full of
          stars.
        </p>
      </section>

      {/* Camp sections */}
      {camps.map((camp, i) => (
        <DestinationSection
          key={camp._id || camp.slug || i}
          item={camp}
          index={i}
          mode="camp"
          total={camps.length}
        />
      ))}

      {/* Close */}
      <CloseSection />
    </div>
  );
}
