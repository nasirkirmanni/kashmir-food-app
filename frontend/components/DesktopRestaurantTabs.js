"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function DesktopRestaurantTabs({
  locationTabs,
  locationTabMeta,
  locationCounts,
  selectedLocation,
  onSelectLocation,
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {locationTabs.map((location, i) => {
        const isActive = selectedLocation === location;
        const count = locationCounts[location] || 0;
        const icon = locationTabMeta[location]?.icon;

        return (
          <Link key={location} href={`/restaurants?location=${location}`} passHref legacyBehavior>
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              onClick={() => onSelectLocation && onSelectLocation(location)}
              className={`group relative flex min-h-[120px] w-full flex-col justify-center overflow-hidden rounded-[24px] border border-white/10 p-6 text-left transition-all duration-300 ${
                isActive
                  ? "bg-white/15 shadow-[0_0_40px_rgba(212,175,55,0.15)] border-white/30"
                  : "bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
              }`}
            >
              {/* Subtle gold glow on active */}
              {isActive && (
                <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.08),transparent_60%)]" />
              )}

              <div className="relative z-10 flex items-center gap-5">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-[18px] border transition-colors duration-300 ${
                    isActive
                      ? "border-[var(--saffron)] bg-[var(--saffron)] text-black"
                      : "border-white/10 bg-black/40 text-white/70 group-hover:border-[var(--saffron)] group-hover:text-[var(--saffron)]"
                  }`}
                >
                  {icon}
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold text-white">
                    {location}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[var(--saffron)]">
                    {count === 0 ? "Coming soon" : `${count} ${count === 1 ? "Location" : "Locations"}`}
                  </p>
                </div>
              </div>
            </motion.a>
          </Link>
        );
      })}
    </div>
  );
}
