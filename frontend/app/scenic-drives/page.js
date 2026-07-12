import './scenic-drives.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { scenicDrives } from '@/data/scenicDrivesData';

export default function ScenicDrivesAtlas() {
  return (
    <main className="scenic-drives-page">
      <Navbar />
      

{/* ============ HERO ============ */}
<section className="hero">
  <div className="hero-bg-img">
    <img src="https://images.unsplash.com/photo-1626621349022-d1a5233b5e97?q=80&w=1800&auto=format&fit=crop" alt="" />
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
    <div className="hero-kicker"><span className="tick"></span>Route Atlas &mdash; Kashmir</div>
    <h1 className="serif">The road climbs<br/>before the <em>view</em> does.</h1>
    <p className="hero-sub">Every mountain pass, valley crossing, and forest drive in Kashmir &mdash; mapped by distance, elevation, and the stops worth slowing down for.</p>

    <div className="live-readout">
      <div className="readout-item">
        <div className="readout-label">Routes mapped</div>
        <div className="readout-value mono">14</div>
      </div>
      <div className="readout-item">
        <div className="readout-label">Highest pass</div>
        <div className="readout-value mono">11,575<small>ft &middot; Zoji La</small></div>
      </div>
      <div className="readout-item">
        <div className="readout-label">Longest drive</div>
        <div className="readout-value mono">434<small>km &middot; Leh road</small></div>
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
    <div className="index-count">14 ROUTES<span>SORTED BY DISTANCE</span></div>
  </div>

  {scenicDrives.map((route, i) => {
    // Determine number of dots for difficulty
    const dots = route.difficulty === 'Easy' ? 1 : route.difficulty === 'Moderate' ? 2 : 3;
    return (
      <Link className="route-row" href={`/scenic-drives/${route.slug}`} key={route.slug}>
        <div className="row-index mono">{String(i + 1).padStart(2, '0')}</div>
        <div className="row-main">
          <div className="row-name serif">{route.title.split(' to ')[0]} <span className="via">to {route.title.split(' to ')[1]}</span></div>
          <div className="row-tagline">{route.elevationTitle}</div>
        </div>
        <svg className="spark" viewBox="0 0 150 34"><path d="M2,26 C20,24 30,10 45,12 C60,14 65,20 80,18 C95,16 105,6 120,8 C132,10 140,16 148,14"/><circle cx="2" cy="26" r="2.5"/><circle cx="148" cy="14" r="2.5"/></svg>
        <div className="row-stat mono">{route.distance.replace(' km', '')}<small>km</small></div>
        <div className="row-stat mono">{route.duration.replace(' hrs', 'h').replace(' Days', 'd')}<small>drive</small></div>
        <div className="row-difficulty">
          <span className="diff-dot">
            <span className={dots >= 1 ? "on" : ""}></span>
            <span className={dots >= 2 ? "on" : ""}></span>
            <span className={dots >= 3 ? "on" : ""}></span>
          </span>
          <span className="diff-label">{route.difficulty}</span>
        </div>
        <svg className="row-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </Link>
    );
  })}
</section>

{/* ============ DETAIL / ELEVATION PROFILE ============ */}
<section className="wrap detail-section" id="detail">
  <div className="detail-kicker">Route 01 &middot; Opened on click from index</div>
  <div className="detail-title-row">
    <div className="detail-title serif">Srinagar <span className="via">&rarr; Yusmarg</span></div>
    <div className="detail-pills">
      <span className="pill gold">EASY</span>
      <span className="pill">APR &ndash; OCT</span>
      <span className="pill">47 KM</span>
    </div>
  </div>

  <div className="profile-panel">
    <div className="profile-label-row">
      <span className="profile-label">Elevation profile</span>
      <span className="profile-label">1,585m &rarr; 2,396m</span>
    </div>
    <div className="profile-chart">
      <svg viewBox="0 0 1000 260" preserveAspectRatio="none">
        <defs>
          <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#C9A24D" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="#C9A24D" stop-opacity="0"/>
          </linearGradient>
        </defs>

        <line className="grid-line" x1="0" y1="60" x2="1000" y2="60" />
        <line className="grid-line" x1="0" y1="120" x2="1000" y2="120" />
        <line className="grid-line" x1="0" y1="180" x2="1000" y2="180" />

        <path className="elev-fill" d="M20,190 C150,185 200,150 320,140 C420,132 460,90 560,70 C680,48 760,60 850,40 L850,220 L20,220 Z" />
        <path className="elev-line" d="M20,190 C150,185 200,150 320,140 C420,132 460,90 560,70 C680,48 760,60 850,40" />

        <circle className="wp-dot term" cx="20" cy="190" r="6" />
        <text className="wp-label" x="20" y="215">SRINAGAR</text>
        <text className="wp-sub" x="20" y="228">START &middot; 1,585M</text>
        <text className="km-label" x="20" y="245">KM 0</text>

        <circle className="wp-dot" cx="320" cy="140" r="5.5" />
        <text className="wp-label" x="320" y="120" text-anchor="middle">CHRAR-E-SHARIEF</text>
        <text className="wp-sub" x="320" y="133" text-anchor="middle">SHRINE STOP &middot; 20 MIN</text>
        <text className="km-label" x="320" y="245" text-anchor="middle">KM 28</text>

        <circle className="wp-dot" cx="560" cy="70" r="5.5" />
        <text className="wp-label" x="560" y="50" text-anchor="middle">NILNAG LAKE</text>
        <text className="wp-sub" x="560" y="63" text-anchor="middle">OPTIONAL DETOUR</text>
        <text className="km-label" x="560" y="245" text-anchor="middle">KM 40</text>

        <circle className="wp-dot term" cx="850" cy="40" r="6" />
        <text className="wp-label" x="850" y="20" text-anchor="end">YUSMARG</text>
        <text className="wp-sub" x="850" y="33" text-anchor="end">END &middot; 2,396M</text>
        <text className="km-label" x="850" y="245" text-anchor="end">KM 47</text>
      </svg>
    </div>
  </div>

  <div className="detail-grid">
    <div className="detail-copy">
      <h3 className="serif">About this drive</h3>
      <p>The road out of Srinagar climbs slowly at first, threading through pine forest before the grade steepens past Chrar-e-Sharief. Traffic thins here, and the last stretch runs beside a shallow stream into the open meadow that gives Yusmarg its name &mdash; the "Meadow of Gold."</p>
      <p>The Nilnag Lake detour adds real elevation in a short distance; skip it after rain, when the unpaved final kilometre turns to clay.</p>
    </div>

    <div className="facts-list">
      <div className="fact-row">
        <span className="fact-label">Road condition</span>
        <span className="fact-value">Paved &middot; single lane near the shrine</span>
      </div>
      <div className="fact-row">
        <span className="fact-label">Fuel</span>
        <span className="fact-value">Last pump in Srinagar &mdash; none en route</span>
      </div>
      <div className="fact-row">
        <span className="fact-label">Mobile network</span>
        <span className="fact-value">Drops past km 28 &mdash; carry offline maps</span>
      </div>
      <div className="fact-row">
        <span className="fact-label">Where to stop</span>
        <span className="fact-value">Dhabas at Chrar-e-Sharief for Kashmiri tea</span>
      </div>
      <div className="fact-row">
        <span className="fact-label">Avoid in</span>
        <span className="fact-value">Heavy monsoon &mdash; final km turns to clay</span>
      </div>
    </div>
  </div>
</section>


      <Footer />
    </main>
  );
}
