import Link from "next/link";

// Canonical itineraries index (T9). Server component, ISR-cached. Content comes
// from the engine via the public canonical endpoint — no hardcoded itineraries.

const getApiBase = () => {
  if (typeof window === "undefined" && process.env.NEXT_PUBLIC_API_URL?.includes("localhost")) {
    return process.env.NEXT_PUBLIC_API_URL.replace("localhost", "127.0.0.1");
  }
  return process.env.NEXT_PUBLIC_API_URL || "https://kashmir-food-app-api.onrender.com";
};

async function getCanonical() {
  try {
    const res = await fetch(`${getApiBase()}/api/itineraries/canonical`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("status " + res.status);
    const json = await res.json();
    return json.itineraries || [];
  } catch (e) {
    console.error("Canonical itineraries fetch error:", e.message || e);
    return [];
  }
}

const inr = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const GOLD = "#C8A46A";

export default async function ItinerariesPage() {
  const itineraries = await getCanonical();

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white px-4 pt-24 pb-28">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-center">
          <span className="text-[0.62rem] uppercase tracking-[0.25em]" style={{ color: GOLD, fontFamily: "var(--font-jetbrains-mono, monospace)" }}>
            Ready-made Kashmir trips
          </span>
          <h1 className="text-3xl sm:text-5xl font-medium mt-3 leading-tight" style={{ fontFamily: "var(--font-bodoni, serif)" }}>
            Kashmir Itineraries
          </h1>
          <p className="text-white/60 text-sm sm:text-base mt-3 max-w-xl mx-auto">
            Curated day-by-day plans for every kind of trip — with routes, Wazwan stops, stays and costs. Or build your own in minutes.
          </p>
          <Link
            href="/itinerary-builder"
            className="inline-flex items-center gap-2 mt-6 min-h-[48px] px-6 rounded-full text-black font-bold text-xs uppercase tracking-widest"
            style={{ background: GOLD, fontFamily: "var(--font-jetbrains-mono, monospace)" }}
          >
            Build my own itinerary →
          </Link>
        </header>

        {/* Grid */}
        {itineraries.length === 0 ? (
          <p className="text-center text-white/40 text-sm py-16">Itineraries are loading — please check back shortly.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {itineraries.map((it) => (
              <Link
                key={it.slug}
                href={`/itineraries/${it.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-white/25 transition-colors relative overflow-hidden"
              >
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-30 blur-2xl" style={{ background: "radial-gradient(circle, rgba(200,164,106,0.35), transparent 70%)" }} aria-hidden="true" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3 text-[0.58rem] uppercase tracking-wider text-white/50">
                    <span className="rounded-full bg-white/[0.06] border border-white/10 px-2 py-0.5">{it.lengthDays} days</span>
                    <span className="rounded-full bg-white/[0.06] border border-white/10 px-2 py-0.5">{it.regionsCovered?.join(" · ")}</span>
                  </div>
                  <h2 className="text-lg font-medium leading-snug mb-1.5" style={{ fontFamily: "var(--font-bodoni, serif)" }}>
                    {it.seoTitle.replace(/ —.*$/, "")}
                  </h2>
                  <p className="text-white/55 text-[0.82rem] leading-snug mb-4">{it.blurb}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[0.7rem] text-white/45">{it.costFrom ? `From ${inr(it.costFrom)}` : ""}</span>
                    <span className="text-[0.7rem] font-semibold group-hover:translate-x-0.5 transition-transform" style={{ color: GOLD }}>View plan →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
