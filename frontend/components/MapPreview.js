"use client";

export default function MapPreview({ query }) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  if (!key) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-card">
        <p className="text-lg font-semibold text-pine">Google Maps preview</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to enable the embedded map experience.
        </p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex rounded-full bg-pine px-5 py-3 text-sm font-semibold text-white hover:bg-cedar"
        >
          Open location in Google Maps
        </a>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] shadow-card">
      <iframe
        title="Google Maps"
        src={`https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(query)}`}
        className="h-[320px] w-full border-0"
        loading="lazy"
      />
    </div>
  );
}
