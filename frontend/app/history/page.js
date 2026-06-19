"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function HistoryPage() {
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-[var(--saffron)] selection:text-black">
      
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/wazwan-hero.jpg" 
            alt="Kashmiri Wazwan Feast" 
            fill 
            className="hidden md:block object-cover opacity-40 brightness-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-[#0B0B0B]/80" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="text-[var(--saffron)] font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-6 block drop-shadow-lg">
              Cultural Heritage
            </span>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-[1.1] mb-6 drop-shadow-2xl">
              The History<br />of Wazwan
            </h1>
            <p className="text-white/70 text-base md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
              A royal feast that traces its origins back to the 14th century, blending Central Asian, Persian, and indigenous Kashmiri culinary traditions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 md:py-32 px-6">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto space-y-24"
        >
          {/* Section 1 */}
          <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 space-y-6">
              <h2 className="font-display text-3xl md:text-4xl text-[var(--saffron)]">Timur&apos;s Influence</h2>
              <p className="text-white/70 leading-relaxed font-light text-lg">
                The origins of Wazwan are often traced back to the late 14th century when the Mongol ruler Timur invaded India. It is believed that he brought skilled cooks, woodcarvers, and weavers from Samarkand to the Kashmir Valley. 
              </p>
              <p className="text-white/70 leading-relaxed font-light text-lg">
                These master chefs, known as <em>Wazas</em>, passed down their recipes and techniques through generations, giving birth to what we now know as the royal Wazwan.
              </p>
            </div>
            <div className="hidden md:block order-1 md:order-2 relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <Image src="/images/restaurants/shamyana-restaurant.jpg" alt="Historical Cooking" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
          </motion.div>

          {/* Section 2 */}
          <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-12 items-center">
            <div className="hidden md:block relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden border border-[var(--saffron)]/20 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
              <Image src="/wazwan-hero.png" alt="The Traami" fill className="object-cover" />
            </div>
            <div className="space-y-6">
              <h2 className="font-display text-3xl md:text-4xl text-[var(--saffron)]">The Traami Tradition</h2>
              <p className="text-white/70 leading-relaxed font-light text-lg">
                Wazwan is traditionally served in a large, elaborately engraved copper platter called a <em>Traami</em>. Groups of four gather around a single Traami, symbolizing unity, brotherhood, and communal harmony.
              </p>
              <p className="text-white/70 leading-relaxed font-light text-lg">
                Before the feast begins, the ritual of <em>Tash-t-Naari</em> is performed, where guests wash their hands using a portable copper basin and jug brought around by attendees.
              </p>
            </div>
          </motion.div>

          {/* Section 3 */}
          <motion.div variants={fadeUp} className="text-center max-w-3xl mx-auto space-y-8 bg-white/5 border border-white/10 p-10 md:p-16 rounded-[40px] backdrop-blur-sm">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-[var(--saffron)] opacity-50">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <h2 className="font-display text-3xl md:text-5xl text-white">The 36-Course Symphony</h2>
            <p className="text-white/70 leading-relaxed font-light text-lg md:text-xl">
              A traditional royal Wazwan comprises 36 courses, out of which between 15 to 30 can be meat-based. The dishes are served in a specific sequence, beginning with dry items like <em>Seekh Kabab</em> and <em>Tabak Maaz</em>, and culminating with the rich, yogurt-based <em>Gushtaba</em>, which marks the end of the meal.
            </p>
          </motion.div>

        </motion.div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 text-center px-6 border-t border-white/10 bg-black/50">
        <h3 className="font-display text-2xl md:text-3xl mb-6">Ready to experience the tradition?</h3>
        <Link 
          href="/restaurants"
          className="inline-flex items-center justify-center rounded-full bg-[var(--saffron)] px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-black shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-transform hover:scale-[1.02] active:scale-95"
        >
          Explore Restaurants
        </Link>
      </section>

    </div>
  );
}
