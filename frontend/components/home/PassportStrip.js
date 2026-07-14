"use client";

import Link from "next/link";
import { ArrowRight, UtensilsCrossed, Mountain, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import useSceneMode from "@/hooks/useSceneMode";

/**
 * Interlude — The Explorer's Passport.
 * Before the finale, the quiet reveal that the journey is being recorded:
 * XP, streaks and achievements stamp themselves into a traveller's booklet.
 * Members are sent to their passport; guests are invited to begin one.
 */

const EASE = [0.22, 1, 0.36, 1];

const STAMPS = [
  { icon: UtensilsCrossed, title: "First Taste", sub: "+25 XP · your first dish" },
  { icon: Mountain, title: "Valley Wanderer", sub: "All four regions reached" },
  { icon: Flame, title: "Streak Keeper", sub: "Seven days, unbroken" },
];

export default function PassportStrip() {
  const { user } = useAuth();
  const { reducedMotion } = useSceneMode();

  return (
    <section
      aria-label="The Explorer's Passport — Kashmir remembers your journey"
      className="relative hidden overflow-hidden border-t border-white/5 bg-[#050505] md:block"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(200,164,106,0.07),transparent_55%)]" />

      <div className="page-shell grid items-center gap-16 py-28 lg:grid-cols-2">
        {/* Copy */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <span
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            className="text-[0.62rem] font-medium uppercase tracking-[0.44em] text-[#C8A46A]"
          >
            Before you go — The Explorer&apos;s Passport
          </span>
          <h2
            style={{ fontFamily: "var(--font-bodoni)" }}
            className="mt-6 text-[clamp(2.5rem,4.5vw,4rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-white"
          >
            Kashmir <span className="italic text-[#E6C875]">remembers</span> you.
          </h2>
          <p className="mt-6 max-w-md font-body text-base leading-relaxed text-white/60">
            Every dish you taste, every valley you reach, every streak you keep — stamped.
            WazwanWay keeps a quiet record of your journey, from your first bite to the
            rank of a true explorer.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link
              href={user ? "/profile" : "/signup"}
              prefetch={false}
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              className="group inline-flex items-center gap-3 rounded-full border border-[#C8A46A]/45 px-7 py-3.5 text-[0.62rem] font-medium uppercase tracking-[0.22em] text-[#E6C875] transition-all duration-300 hover:border-[#C8A46A] hover:bg-[#C8A46A]/10"
            >
              {user ? "Open your passport" : "Begin your record"}
              <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <span
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              className="text-[0.6rem] uppercase tracking-[0.2em] text-white/35"
            >
              +XP with every discovery
            </span>
          </div>
        </motion.div>

        {/* The booklet — stamps thunk in one by one */}
        <div className="relative mx-auto w-full max-w-md">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 30, rotate: -1.5 }}
            whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
            className="rounded-[20px] border border-[#C8A46A]/30 bg-[#0A0906] p-8 shadow-[0_0_70px_rgba(200,164,106,0.1)]"
          >
            <div className="flex items-baseline justify-between border-b border-white/10 pb-5">
              <span
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                className="text-[0.58rem] uppercase tracking-[0.3em] text-[#C8A46A]"
              >
                Explorer&apos;s Passport
              </span>
              <span
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                className="text-[0.58rem] uppercase tracking-[0.2em] text-white/35"
              >
                WW · Valley Record
              </span>
            </div>

            <ul className="mt-7 space-y-6">
              {STAMPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.li
                    key={s.title}
                    initial={reducedMotion ? false : { opacity: 0, scale: 1.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.45, delay: 0.45 + i * 0.3, ease: EASE }}
                    className="flex items-center gap-5"
                  >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#C8A46A]/50 text-[#E6C875]"
                      style={{ boxShadow: "inset 0 0 18px rgba(200,164,106,0.12)" }}
                    >
                      <Icon size={22} strokeWidth={1.5} />
                    </span>
                    <div>
                      <h3 style={{ fontFamily: "var(--font-bodoni)" }} className="text-xl font-semibold text-white">
                        {s.title}
                      </h3>
                      <p
                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                        className="mt-1 text-[0.6rem] uppercase tracking-[0.18em] text-white/45"
                      >
                        {s.sub}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
