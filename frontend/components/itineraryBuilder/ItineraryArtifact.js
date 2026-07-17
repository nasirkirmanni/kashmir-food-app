"use client";

// Itinerary Builder — Itinerary Artifact (T7)
//
// Renders an engine plan as a designed day-by-day timeline (NOT a chat wall).
// Shared by personalized results and canonical SEO pages. Currency via Intl
// (never literal ₹ in source — avoids the mojibake bug), icons as inline SVG.

const GOLD = "#C8A46A";

const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const Eyebrow = ({ children }) => (
  <span
    className="text-[0.6rem] font-semibold uppercase tracking-[0.2em]"
    style={{ color: GOLD, fontFamily: "var(--font-jetbrains-mono, monospace)" }}
  >
    {children}
  </span>
);

const Chip = ({ children }) => (
  <span className="text-[0.62rem] font-semibold uppercase tracking-wider text-white/60 bg-white/[0.05] border border-white/10 rounded-full px-2.5 py-1">
    {children}
  </span>
);

function Icon({ path, className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {path}
    </svg>
  );
}
const ICON = {
  car: <path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13m-14 0h14m-14 0v4m14-4v4M7 17h.01M17 17h.01" />,
  bed: <path d="M3 17v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5M3 17h18M3 17v2m18-2v2M7 10V8a2 2 0 0 1 2-2h2" />,
  food: <path d="M4 3v7a3 3 0 0 0 3 3v8M7 3v6M17 3c-1.5 0-3 2-3 5s1.5 4 3 4v6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  warn: <path d="M12 9v4m0 4h.01M10.3 3.9l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0z" />,
  pin: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 12 2a7 7 0 0 1 7 7.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.2" /></>,
};

function DayCard({ day }) {
  return (
    <li className="relative pl-8 sm:pl-10 pb-6">
      {/* rail node */}
      <span
        className="absolute left-0 top-1 flex items-center justify-center w-6 h-6 rounded-full text-black text-[0.7rem] font-bold"
        style={{ background: GOLD, fontFamily: "var(--font-bodoni, serif)" }}
      >
        {day.dayNumber}
      </span>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <Eyebrow>Day {day.dayNumber} · {day.baseTown}</Eyebrow>
            <h3 className="text-lg font-medium text-white mt-1 leading-snug" style={{ fontFamily: "var(--font-bodoni, serif)" }}>
              {day.title.replace(/^Day \d+:\s*/, "")}
            </h3>
          </div>
        </div>

        {day.travelFromPrev && (
          <div className="flex items-center gap-2 text-[0.7rem] text-white/55 mt-2 mb-1">
            <Icon path={ICON.car} className="w-3.5 h-3.5" style={{ color: GOLD }} />
            <span>
              {day.travelFromPrev.km} km · {day.travelFromPrev.minutes} min drive
              {day.travelFromPrev.estimated ? " (approx)" : ""}
            </span>
          </div>
        )}

        {/* Stops */}
        <ul className="mt-3 space-y-2.5">
          {day.stops.map((s, i) => (
            <li key={i} className="flex gap-3">
              <div className="flex flex-col items-center pt-0.5">
                <span className="text-[0.6rem] tabular-nums text-white/40" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)" }}>{s.startTime}</span>
              </div>
              <div className="flex-1 border-l border-white/10 pl-3">
                <div className="text-sm font-medium text-white">{s.name}</div>
                <div className="text-[0.72rem] text-white/50 leading-snug">{s.activity}</div>
                {s.estVisitHours ? <div className="text-[0.62rem] text-white/35 mt-0.5">~{s.estVisitHours}h</div> : null}
              </div>
            </li>
          ))}
        </ul>

        {/* Stay (dining intentionally omitted until the restaurant catalog grows) */}
        <div className="flex items-start gap-2 mt-4 pt-3 border-t border-white/8">
          <Icon path={ICON.bed} className="w-4 h-4 mt-0.5" style={{ color: GOLD }} />
          <div className="text-[0.72rem] text-white/70">{day.stay.type} · {day.stay.area}</div>
        </div>

        {day.bestTimeToLeave && (
          <div className="flex items-center gap-2 text-[0.7rem] text-white/55 mt-3">
            <Icon path={ICON.clock} className="w-3.5 h-3.5" style={{ color: GOLD }} />
            <span>{day.bestTimeToLeave}</span>
          </div>
        )}

        {day.advisories?.length > 0 && (
          <div className="mt-3 space-y-1">
            {day.advisories.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-[0.68rem] text-amber-300/80">
                <Icon path={ICON.warn} className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{a}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

export default function ItineraryArtifact({ plan, onPlanTrip, planHref }) {
  if (!plan) return null;
  const cost = plan.estimatedCost || {};

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <header className="mb-6">
        <Eyebrow>Your Kashmir Itinerary</Eyebrow>
        <h1 className="text-3xl sm:text-4xl font-medium text-white mt-2 leading-tight" style={{ fontFamily: "var(--font-bodoni, serif)" }}>
          {plan.title}
        </h1>
        <p className="text-white/60 text-sm mt-2">{plan.summary}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Chip>{plan.season}</Chip>
          <Chip>{plan.pace}</Chip>
          <Chip>{plan.budgetTier}</Chip>
          {plan.regionsCovered?.map((r) => <Chip key={r}>{r}</Chip>)}
        </div>
      </header>

      {/* Cost */}
      {cost.total ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 mb-6">
          <div className="flex items-baseline justify-between">
            <Eyebrow>Estimated Cost</Eyebrow>
            <span className="text-2xl font-medium" style={{ color: GOLD, fontFamily: "var(--font-bodoni, serif)" }}>{inr(cost.total)}</span>
          </div>
          {cost.breakdown && (
            <div className="grid grid-cols-4 gap-2 mt-3 text-center">
              {[["Stay", cost.breakdown.stay], ["Transport", cost.breakdown.transport], ["Food", cost.breakdown.food], ["Activities", cost.breakdown.activities]].map(([label, v]) => (
                <div key={label} className="rounded-lg bg-white/[0.03] border border-white/8 py-2">
                  <div className="text-[0.55rem] uppercase tracking-wider text-white/40">{label}</div>
                  <div className="text-[0.72rem] text-white/80 mt-0.5 tabular-nums">{inr(v)}</div>
                </div>
              ))}
            </div>
          )}
          <p className="text-[0.6rem] text-white/35 mt-2">Indicative — excludes flights. Confirm with your operator.</p>
        </div>
      ) : null}

      {/* Timeline */}
      <ol className="relative">
        {plan.days.map((day) => <DayCard key={day.dayNumber} day={day} />)}
      </ol>

      {/* Trip advisories */}
      {plan.advisories?.length > 0 && (
        <section className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4 mb-6">
          <Eyebrow>Good to know</Eyebrow>
          <ul className="mt-2 space-y-1.5">
            {plan.advisories.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-[0.72rem] text-white/70">
                <Icon path={ICON.warn} className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-300/80" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Packing */}
      {plan.packingTips?.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 mb-8">
          <Eyebrow>Packing tips</Eyebrow>
          <div className="flex flex-wrap gap-2 mt-3">
            {plan.packingTips.map((t, i) => (
              <span key={i} className="text-[0.7rem] text-white/70 bg-white/[0.04] border border-white/8 rounded-full px-3 py-1.5">{t}</span>
            ))}
          </div>
        </section>
      )}

      {/* Plan This Trip CTA (Part 7) */}
      {(onPlanTrip || planHref) && (
        <div className="sticky bottom-4 z-10">
          <a
            href={planHref || undefined}
            onClick={onPlanTrip}
            className="flex items-center justify-center gap-2 min-h-[52px] rounded-full text-black font-bold text-sm uppercase tracking-widest shadow-lg cursor-pointer"
            style={{ background: GOLD, fontFamily: "var(--font-jetbrains-mono, monospace)", boxShadow: "0 10px 40px rgba(200,164,106,0.3)" }}
          >
            <Icon path={ICON.pin} className="w-4 h-4" />
            Plan this trip
          </a>
        </div>
      )}
    </div>
  );
}

export function ItineraryArtifactSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto animate-pulse" aria-live="polite" aria-busy="true">
      <span className="sr-only">Building your itinerary…</span>
      <div className="h-3 w-32 rounded bg-white/10 mb-3" />
      <div className="h-9 w-3/4 rounded bg-white/10 mb-2" />
      <div className="h-4 w-2/3 rounded bg-white/[0.07] mb-4" />
      <div className="flex gap-2 mb-6">{[0, 1, 2].map((i) => <div key={i} className="h-6 w-16 rounded-full bg-white/[0.07]" />)}</div>
      <div className="h-24 rounded-2xl bg-white/[0.05] mb-6" />
      {[0, 1, 2].map((i) => <div key={i} className="h-40 rounded-2xl bg-white/[0.04] mb-4 ml-8" />)}
    </div>
  );
}
