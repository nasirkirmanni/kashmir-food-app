"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Clock, ArrowUpRight } from "lucide-react";

// Tier 2 placeholder — will be populated with articles
const tier2Dishes = [
  { name: "Seekh Kebab", slug: "seekh-kebab", desc: "Charcoal-grilled minced meat skewers, a Wazwan opening course." },
  { name: "Waza Kokur", slug: "waza-kokur", desc: "Whole spiced chicken prepared by the master Waza." },
  { name: "Girda", slug: "girda", desc: "Kashmir's everyday round bread from the neighbourhood Kandur." },
  { name: "Masala Tsot", slug: "masala-tsot", desc: "Spiced small bread — a popular street snack." },
  { name: "Mutton Tujji", slug: "mutton-tujji", desc: "Coal-grilled mutton skewers from Srinagar's streets." },
  { name: "Nadur Monji", slug: "nadur-monji", desc: "Crispy lotus stem fritters — a beloved Kashmiri snack." },
  { name: "Phirni", slug: "phirni", desc: "Kashmiri rice pudding served as the Wazwan dessert." },
  { name: "Shufta", slug: "shufta", desc: "Dry fruit and paneer sweet — served at celebrations." },
  { name: "Noon Chai", slug: "noon-chai", desc: "Kashmir's everyday pink salt tea, always with bread." },
  { name: "Kahwa", slug: "kahwa", desc: "Saffron green tea served after Wazwan and to welcome guests." },
  { name: "Haak", slug: "haak", desc: "Kashmir's soul food — collard greens with mustard oil and rice." },
  { name: "Nadru Yakhni", slug: "nadru-yakhni", desc: "Lotus stem in yogurt gravy — a Pandit vegetarian classic." },
];

export default function TraditionalDishesPage() {
  return (
    <div className="min-h-screen pt-28 pb-32 px-6 page-shell flex flex-col items-center">
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none z-0" />
      <div className="w-full max-w-5xl relative z-10">
        <Link
          href="/kashmiri-food-blogs"
          className="inline-flex items-center gap-2 text-white/50 hover:text-[var(--saffron)] transition-colors mb-10 text-xs sm:text-sm uppercase tracking-wider font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Kashmiri Food Blogs
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <span className="text-[var(--saffron)] font-bold tracking-[0.25em] uppercase text-[0.6rem] mb-3 block">
            Tier 2
          </span>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-5">Traditional Dishes</h1>
          <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Important regional and traditional Kashmiri dishes that deserve dedicated coverage — from street-side Tujji to ceremonial Phirni.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tier2Dishes.map((dish, i) => (
            <motion.div
              key={dish.slug}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 flex flex-col justify-between group hover:border-[var(--saffron)]/20 transition-all"
            >
              <div>
                <h3 className="font-display text-lg text-white mb-2 group-hover:text-[var(--saffron)] transition-colors">
                  {dish.name}
                </h3>
                <p className="text-white/45 text-sm leading-relaxed mb-4">{dish.desc}</p>
              </div>
              <span className="text-white/25 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" /> Coming Soon
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
