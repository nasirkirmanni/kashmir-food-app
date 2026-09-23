"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

const tier3Dishes = [
  { name: "Methi Maaz", slug: "methi-maaz", desc: "Fenugreek tripe — a deeper Wazwan cut." },
  { name: "Muji Chetin", slug: "muji-chetin", desc: "Radish and walnut chutney served as a Wazwan condiment." },
  { name: "Nadru Gaad", slug: "nadru-gaad", desc: "Lotus stem and fish curry from lakeside communities." },
  { name: "Ruwangan Chaman", slug: "ruwangan-chaman", desc: "Tomato-based paneer from the Pandit tradition." },
  { name: "Waza Palak", slug: "waza-palak", desc: "Spinach with meatballs — a Wazwan vegetable course." },
  { name: "Bakerkhani", slug: "bakerkhani", desc: "Flaky layered Kashmiri flatbread." },
  { name: "Czochworu", slug: "czochworu", desc: "Sesame-crusted ring bread from the Kandur." },
  { name: "Kashmiri Kulcha", slug: "kashmiri-kulcha", desc: "Crumbly bakery biscuits for tea time." },
  { name: "Lavas", slug: "lavas", desc: "Thin, soft blistered flatbread." },
  { name: "Sheermal", slug: "sheermal", desc: "Sweet saffron flatbread baked in the tandoor." },
  { name: "Basrakh", slug: "basrakh", desc: "Sweet crispy pastry snack." },
  { name: "Tosha", slug: "tosha", desc: "Traditional Kashmiri sweet." },
  { name: "Walnut Halwa", slug: "walnut-halwa", desc: "Rich halwa made with Kashmir's famous walnuts." },
  { name: "Babribyol", slug: "babribyol", desc: "Traditional Kashmiri buttermilk drink." },
  { name: "Kashmiri Lassi", slug: "kashmiri-lassi", desc: "Creamy yogurt-based drink." },
  { name: "Kashmiri Harissa", slug: "kashmiri-harissa", desc: "Winter breakfast of mutton slow-cooked overnight." },
];

export default function HiddenGemsPage() {
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
            Tier 3
          </span>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-5">Hidden Gems</h1>
          <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Lesser-known Kashmiri dishes worth documenting — the bakery breads, condiments, sweets, and seasonal specialties that complete the Valley's culinary picture.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tier3Dishes.map((dish, i) => (
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
