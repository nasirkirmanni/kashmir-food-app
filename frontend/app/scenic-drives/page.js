import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import ElevationSparkline from "@/components/explore/ElevationSparkline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://kashmir-food-app-api.onrender.com";

// Server-side data fetching
async function getTrailsData() {
  try {
    const res = await fetch(`${API_BASE}/api/trails`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) throw new Error("Failed to fetch trails");
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch trails for Route Atlas page:", error);
    return [];
  }
}

export const metadata = {
  title: "Scenic Drives — Route Atlas | Wazwan Way",
  description: "Every mountain pass, valley crossing, and forest drive in Kashmir mapped by distance, elevation, and stops."
};

export default async function ScenicDrivesListPage() {
  const trails = await getTrailsData();

  // Filter scenic drives (excluding the Great Kashmir Road Trip which is featured on the dashboard)
  const scenicDrives = trails.filter(
    (t) => t.tags?.includes("scenic-drive") && t.slug !== "the-great-kashmir-road-trip"
  );

  // Compute dynamic readouts from seeded database values
  const totalMapped = scenicDrives.length;
  
  // Find highest pass dynamically
  let highestElevM = 0;
  let highestPassName = "Zoji La";
  scenicDrives.forEach((t) => {
    t.waypoints?.forEach((wp) => {
      if (wp.elevationM > highestElevM) {
        highestElevM = wp.elevationM;
        highestPassName = wp.name;
      }
    });
  });
  const highestPassFt = Math.round(highestElevM * 3.28084);

  // Find longest drive dynamically
  let longestDistanceKm = 0;
  let longestDriveName = "Leh road";
  scenicDrives.forEach((t) => {
    if (t.distanceKm > longestDistanceKm) {
      longestDistanceKm = t.distanceKm;
      // Get the destination name from title
      longestDriveName = (t.title.split(/ to /i)[1] || "Leh") + " road";
    }
  });

  // Helper to format route name matching the arrow-destination style
  const getMockupRouteFormat = (trail) => {
    if (trail.slug === "srinagar-to-yusmarg") {
      return { main: "Srinagar → Yusmarg", via: "(via Chrar-e-Sharief)" };
    }
    if (trail.slug === "srinagar-to-sonamarg") {
      return { main: "Srinagar → Sonamarg", via: "" };
    }
    if (trail.slug === "srinagar-to-gulmarg") {
      return { main: "Srinagar → Gulmarg", via: "" };
    }
    if (trail.slug === "srinagar-to-leh") {
      return { main: "Srinagar → Leh", via: "(via Sonamarg & Zoji La)" };
    }
    if (trail.slug === "srinagar-to-doodhpathri") {
      return { main: "Srinagar → Doodhpathri", via: "" };
    }
    // Fallback for any future drives
    if (trail.title.toLowerCase().includes(" to ")) {
      const parts = trail.title.split(/ to /i);
      return { main: `${parts[0]} → ${parts[1]}`, via: "" };
    }
    return { main: trail.title, via: "" };
  };

  // Helper for 3-dot difficulty rendering
  const getDifficultyConfig = (diff = "easy") => {
    const d = diff.toLowerCase();
    if (d === "demanding") {
      return { label: "Demanding", dots: [true, true, true] };
    }
    if (d === "moderate") {
      return { label: "Moderate", dots: [true, true, false] };
    }
    return { label: "Easy", dots: [true, false, false] };
  };

  return (
    <div className="scenic-drives-root select-none">
      {/* Import external fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      
      {/* Scoped CSS matching Route Atlas styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .scenic-drives-root {
          --ink: #0A0A08;
          --panel: #14120D;
          --panel-raised: #1A170F;
          --hair: rgba(255,255,255,0.07);
          --gold: #C9A24D;
          --gold-bright: #E8C879;
          --ivory: #F2EAD8;
          --dim: #8C8377;
          --dimmer: #5C574C;
          
          background: var(--ink);
          color: var(--ivory);
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
          min-height: 100vh;
        }
        
        .scenic-drives-root * { box-sizing: border-box; }
        .scenic-drives-root .serif { font-family: 'Cormorant Garamond', serif; font-weight: 400; }
        .scenic-drives-root .mono { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
        .scenic-drives-root .wrap { max-width: 1180px; margin: 0 auto; padding: 0 32px; }
        .scenic-drives-root a { color: inherit; text-decoration: none; }

        /* ============ HERO ============ */
        .scenic-drives-root .hero {
          position: relative;
          min-height: 85vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
          border-bottom: 1px solid var(--hair);
        }
        .scenic-drives-root .hero-bg-img {
          position: absolute; inset: 0; z-index: 0;
        }
        .scenic-drives-root .hero-bg-img img {
          width: 100%; height: 100%; object-fit: cover;
          opacity: 0.22; filter: grayscale(60%) contrast(1.05);
        }
        .scenic-drives-root .hero-bg-img::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(180deg, var(--ink) 0%, rgba(10,10,8,0.75) 40%, var(--ink) 100%);
        }
        .scenic-drives-root .contour-layer {
          position: absolute; inset: 0; z-index: 1; opacity: 0.5; pointer-events: none;
        }
        .scenic-drives-root .contour-layer svg { width: 100%; height: 100%; }
        .scenic-drives-root .contour-layer path { fill: none; stroke: var(--gold); stroke-width: 0.6; opacity: 0.18; }

        .scenic-drives-root .hero-inner { position: relative; z-index: 2; padding: 140px 0 90px; }
        .scenic-drives-root .hero-kicker {
          font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--gold); display: flex; align-items: center; gap: 12px; margin-bottom: 30px;
        }
        .scenic-drives-root .hero-kicker .tick { width: 26px; height: 1px; background: var(--gold); }
        .scenic-drives-root .hero h1 {
          font-size: clamp(44px, 6.2vw, 92px); line-height: 0.98; font-weight: 400; color: var(--ivory);
          max-width: 15ch; letter-spacing: -0.01em;
        }
        .scenic-drives-root .hero h1 em { font-style: italic; color: var(--gold-bright); }
        .scenic-drives-root .hero-sub {
          color: var(--dim); font-size: 16px; line-height: 1.7; max-width: 480px; margin: 30px 0 0;
        }

        .scenic-drives-root .live-readout {
          margin-top: 56px; display: flex; gap: 0; border-top: 1px solid var(--hair); padding-top: 26px; max-width: 620px;
        }
        .scenic-drives-root .readout-item { flex: 1; padding-right: 24px; border-right: 1px solid var(--hair); }
        .scenic-drives-root .readout-item:last-child { border-right: none; }
        .scenic-drives-root .readout-label { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dimmer); margin-bottom: 8px; }
        .scenic-drives-root .readout-value { font-size: 22px; color: var(--gold-bright); }
        .scenic-drives-root .readout-value small { font-size: 12px; color: var(--dim); margin-left: 4px; }

        /* ============ ROUTE INDEX ============ */
        .scenic-drives-root .index-section { padding: 100px 0 100px; }
        .scenic-drives-root .index-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 44px; border-bottom: 1px solid var(--hair); padding-bottom: 28px; }
        .scenic-drives-root .index-header h2 { font-size: 34px; color: var(--ivory); font-weight: 400; }
        .scenic-drives-root .index-header p { color: var(--dim); font-size: 13.5px; margin-top: 8px; max-width: 42ch; }
        .scenic-drives-root .index-count { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: var(--gold); text-align: right; }
        .scenic-drives-root .index-count span { display: block; font-size: 11px; color: var(--dimmer); letter-spacing: 0.1em; margin-top: 4px; }

        .scenic-drives-root .route-row {
          display: grid;
          grid-template-columns: 30px 1fr 160px 90px 100px 90px 20px;
          align-items: center;
          gap: 24px;
          padding: 26px 20px;
          border-bottom: 1px solid var(--hair);
          transition: background 0.3s ease, padding-left 0.3s ease;
          cursor: pointer;
        }
        .scenic-drives-root .route-row:hover { background: var(--panel); padding-left: 28px; }
        .scenic-drives-root .route-row:hover .row-arrow { transform: translateX(4px); color: var(--gold-bright); }
        .scenic-drives-root .route-row:hover .spark path { stroke: var(--gold-bright); }
        .scenic-drives-root .route-row:hover .spark circle { fill: var(--gold-bright); }

        .scenic-drives-root .row-index { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: var(--dimmer); }
        .scenic-drives-root .row-main .row-name { font-size: 22px; color: var(--ivory); margin-bottom: 5px; }
        .scenic-drives-root .row-main .row-name .via { color: var(--dim); font-family: 'Inter', sans-serif; font-size: 13px; font-style: normal; margin-left: 10px; }
        .scenic-drives-root .row-main .row-tagline { font-size: 12.5px; color: var(--dim); }

        .scenic-drives-root .row-stat { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: var(--ivory); text-align: right; }
        .scenic-drives-root .row-stat small { display: block; font-size: 9.5px; color: var(--dimmer); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 3px; font-family: 'Inter', sans-serif; }

        .scenic-drives-root .row-difficulty { text-align: right; }
        .scenic-drives-root .diff-dot { display: inline-flex; gap: 3px; }
        .scenic-drives-root .diff-dot span { width: 5px; height: 5px; border-radius: 50%; background: var(--hair); }
        .scenic-drives-root .diff-dot span.on { background: var(--gold); }
        .scenic-drives-root .diff-label { font-size: 9.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dimmer); display: block; margin-top: 6px; }

        .scenic-drives-root .row-arrow { color: var(--dim); transition: all 0.3s ease; }

        @media (max-width: 880px) {
          .scenic-drives-root .route-row { grid-template-columns: 1fr auto; row-gap: 10px; }
          .scenic-drives-root .row-index, .scenic-drives-root .spark, .scenic-drives-root .row-difficulty { display: none; }
          .scenic-drives-root .row-stat { text-align: left; }
        }
      `}} />

      {/* Floating back to explore button */}
      <div className="fixed top-6 left-6 z-[9999]">
        <Link 
          href="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#14120D]/90 border border-white/10 hover:bg-[#1A170F] text-[#F2EAD8] font-semibold text-[10px] uppercase tracking-wider rounded-full transition-all duration-300 shadow-xl backdrop-blur-md"
        >
          <ArrowLeft size={14} />
          <span>Back to Explore</span>
        </Link>
      </div>

      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="hero-bg-img">
          <img 
            src="https://images.unsplash.com/photo-1626621349022-d1a5233b5e97?q=80&w=1800&auto=format&fit=crop" 
            alt="Scenic Drives Background" 
          />
        </div>
        <div className="contour-layer">
          <svg viewBox="0 0 1200 800" preserveAspectRatio="none">
            <path d="M-50,600 C200,520 350,650 600,560 C850,470 950,600 1250,520" />
            <path d="M-50,660 C220,590 380,700 620,630 C860,540 970,660 1250,590" />
            <path d="M-50,720 C240,660 400,750 640,700 C880,610 990,720 1250,660" />
            <path d="M-50,150 C300,90 500,220 750,140 C950,80 1050,180 1250,110" />
            <path d="M-50,210 C320,150 520,270 770,200 C960,140 1060,230 1250,170" />
          </svg>
        </div>

        <div className="wrap hero-inner">
          <div className="hero-kicker">
            <span className="tick"></span>Route Atlas &mdash; Kashmir
          </div>
          <h1 className="serif">
            The road climbs<br />
            before the <em>view</em> does.
          </h1>
          <p className="hero-sub">
            Every mountain pass, valley crossing, and forest drive in Kashmir &mdash; mapped by distance, elevation, and the stops worth slowing down for.
          </p>

          <div className="live-readout">
            <div className="readout-item">
              <div className="readout-label">Routes mapped</div>
              <div className="readout-value mono">{totalMapped}</div>
            </div>
            <div className="readout-item">
              <div className="readout-label">Highest pass</div>
              <div className="readout-value mono">
                {highestPassFt.toLocaleString()}
                <small>ft &middot; {highestPassName}</small>
              </div>
            </div>
            <div className="readout-item">
              <div className="readout-label">Longest drive</div>
              <div className="readout-value mono">
                {longestDistanceKm}
                <small>km &middot; {longestDriveName}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ROUTE INDEX ============ */}
      <section className="wrap index-section">
        <div className="index-header">
          <div>
            <h2 className="serif">Every route, by distance</h2>
            <p>No two drives climb the same way. Scan by duration, elevation gain, or how demanding the road gets.</p>
          </div>
          <div className="index-count uppercase">
            {totalMapped} Routes
            <span>Sorted By Distance</span>
          </div>
        </div>

        {/* Dynamic Route Rows */}
        <div className="flex flex-col">
          {scenicDrives.map((trail, index) => {
            const rowNumber = String(index + 1).padStart(2, "0");
            const { main, via } = getMockupRouteFormat(trail);
            const { label: difficultyLabel, dots } = getDifficultyConfig(trail.difficulty);

            return (
              <Link 
                key={trail._id || trail.slug} 
                href={`/trails/${trail.slug}`}
                className="route-row group/row"
              >
                <div className="row-index mono">{rowNumber}</div>
                <div className="row-main">
                  <div className="row-name serif">
                    {main} <span className="via">{via}</span>
                  </div>
                  <div className="row-tagline">
                    {trail.description ? trail.description.split(".")[0] : "Scenic kashmir valley highway drive."}
                  </div>
                </div>
                
                {/* SVG elevation sparkline */}
                <div className="spark flex items-center justify-center">
                  <ElevationSparkline waypoints={trail.waypoints} />
                </div>

                <div className="row-stat mono">
                  {trail.distanceKm || trail.estimatedDistance?.split(" ")[0]}
                  <small>km</small>
                </div>
                <div className="row-stat mono">
                  {trail.durationLabel || trail.estimatedDuration}
                  <small>drive</small>
                </div>
                
                <div className="row-difficulty">
                  <span className="diff-dot">
                    {dots.map((active, dIdx) => (
                      <span key={dIdx} className={active ? "on" : ""} />
                    ))}
                  </span>
                  <span className="diff-label">{difficultyLabel}</span>
                </div>

                <ChevronRight 
                  size={18} 
                  strokeWidth={1.6} 
                  className="row-arrow text-[#8C8377] group-hover/row:translate-x-1 group-hover/row:text-[#E8C879] transition-all duration-300" 
                />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
