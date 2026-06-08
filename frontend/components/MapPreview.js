"use client";

export default function MapPreview({ query }) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  if (!key) {
    return (
      <div className="rounded-[28px] border border-dashed border-white/20 bg-white/5 backdrop-blur-md p-8 text-center shadow-2xl">
        <p className="text-lg font-semibold text-white font-display text-2xl font-medium tracking-tight">Google Maps preview</p>
        <p className="mt-3 text-sm leading-6 text-white/60 font-body">
          Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to enable the embedded map experience.
        </p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex rounded-full bg-[var(--saffron)] px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-black transition-transform hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
        >
          Open location in Google Maps
        </a>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <iframe
        title="Google Maps"
        src={`https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(query)}`}
        className="h-[320px] w-full border-0"
        loading="lazy"
      />
    </div>
  );
}
