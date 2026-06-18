"use client";

import { motion } from "framer-motion";
import { BookOpen, Heart, Award, Compass, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  return (
    <div className="min-h-screen pt-28 pb-32 px-6 page-shell flex flex-col items-center">
      {/* Background gradients similar to main app theme */}
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none z-0" />
      
      <div className="w-full max-w-4xl relative z-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <span className="text-[var(--saffron)] font-bold tracking-[0.2em] uppercase text-[0.65rem] mb-3 block">
            Our Legacy & Mission
          </span>
          <h1 className="font-display text-4xl md:text-6xl text-white mb-6 tracking-tight leading-none">
            The Soul of Kashmir’s <br />
            <span className="text-[var(--saffron)] font-accent italic font-normal">Culinary Artistry</span>
          </h1>
          <p className="text-white/60 text-sm md:text-lg leading-relaxed max-w-2xl mx-auto">
            Wazwan Way was born out of an enduring love for Kashmir’s legendary 36-course royal feast, 
            crafted to guide connoisseurs and curious travelers to the most authentic culinary sanctuaries.
          </p>
        </motion.div>

        {/* Narrative / Main Story Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20"
        >
          {/* Card 1: The Heritage */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 sm:p-10 shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[var(--saffron)]/10 border border-[var(--saffron)]/30 flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-[var(--saffron)]" />
              </div>
              <h2 className="font-display text-2xl text-white mb-4">The Art of the Waza</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Wazwan is not merely food; it is a ritualized culinary performance. Handed down through generations of *Wazas* (master chefs), each dish is prepared over wood-fired embers, pounded with specialized walnut-wood mallets, and infused with indigenous spices like Kashmiri cockscomb (*mawal*) and mountain-grown saffron.
              </p>
            </div>
            <div className="text-[var(--saffron)] text-xs font-semibold tracking-wider uppercase flex items-center gap-2">
              Ancient Royal Feasts <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Card 2: Our Journey */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 sm:p-10 shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[var(--saffron)]/10 border border-[var(--saffron)]/30 flex items-center justify-center mb-6">
                <Compass className="w-6 h-6 text-[var(--saffron)]" />
              </div>
              <h2 className="font-display text-2xl text-white mb-4">Our Vision</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                In a rapidly globalizing world, authentic flavors can easily blur. Wazwan Way acts as a digital custodian for Kashmir's foodways. We catalog genuine preparation sequences, map local bakeries (*kandur-wans*), verify local wazwans, and assist travelers in exploring destinations with profound respect for the valley's culinary soul.
              </p>
            </div>
            <div className="text-[var(--saffron)] text-xs font-semibold tracking-wider uppercase flex items-center gap-2">
              Preserving Culinary Roots <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>
        </motion.div>

        {/* Pillars / Values Section */}
        <div className="mb-20 text-center">
          <span className="text-[var(--saffron)] font-bold tracking-[0.2em] uppercase text-[0.65rem] mb-3 block">
            Values We Live By
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-white mb-12">The Pillars of Wazwan Way</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[var(--saffron)]/35 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                <Heart className="w-5 h-5 text-[var(--saffron)]" />
              </div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2">Uncompromised Quality</h3>
              <p className="text-white/50 text-xs leading-relaxed">
                We only showcase and recommend restaurants, bakers, and chefs who adhere strictly to the traditional recipes.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[var(--saffron)]/35 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5 text-[var(--saffron)]" />
              </div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2">Heritage Education</h3>
              <p className="text-white/50 text-xs leading-relaxed">
                Teaching the etiquette of eating from the shared Trami, understanding the sequence of courses, and respecting local culture.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[var(--saffron)]/35 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                <Compass className="w-5 h-5 text-[var(--saffron)]" />
              </div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2">Responsible Tourism</h3>
              <p className="text-white/50 text-xs leading-relaxed">
                Connecting discerning travelers directly with local artisans, homestays, and family chefs to uplift local communities.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-radial-gradient from-[var(--saffron)]/10 via-white/5 to-white/5 border border-white/10 rounded-[32px] p-8 md:p-12 text-center"
        >
          <h2 className="font-display text-3xl text-white mb-4">Embark on the Taste Trail</h2>
          <p className="text-white/60 text-sm md:text-base mb-8 max-w-md mx-auto">
            Ready to experience the heights of Kashmiri cuisine? Browse our verified lists, explore our custom plans, or connect with our guides.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/restaurants"
              className="rounded-full bg-[var(--saffron)] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-black shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-transform hover:scale-[1.02] active:scale-95"
            >
              Explore Restaurants
            </Link>
            <Link 
              href="/contact"
              className="rounded-full bg-white/10 border border-white/20 px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white hover:bg-white/15 transition-all"
            >
              Get In Touch
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
