"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const tips = [
  { number: "01", title: "Book in Advance", description: "A full Wazwan is often prepared overnight, so call ahead if you want the ceremonial feast experience rather than a standard menu order." },
  { number: "02", title: "Come Hungry, Come Many", description: "Wazwan is best enjoyed in a group. The shared trami experience makes the meal feel cultural, social, and complete." },
  { number: "03", title: "Start with the Classics", description: "If you are new to Kashmiri food, begin with Rogan Josh, Gushtaba, Rista, and Tabak Maaz before branching into rarer specialties." },
  { number: "04", title: "Respect the Finale", description: "Dishes like Gushtaba are traditionally served at the end of a Wazwan, so knowing the order makes the experience far more immersive." },
  { number: "05", title: "Ask About Authenticity", description: "Some restaurants are polished for tourists, while others preserve older cooking styles. Use the authenticity notes in the app." },
  { number: "06", title: "Pair Food with the Place", description: "A Dal Lake setting, an old city dining hall, and a heritage restaurant each create a very different mood around the same dish." }
];

export default function HowToExperiencePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-x-clip selection:bg-[var(--saffron)] selection:text-black">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--saffron)] opacity-[0.03] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--saffron)] opacity-[0.02] blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
      </div>

      {/* Header */}
      <header className="sticky top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-center bg-gradient-to-b from-[#0A0A0A]/90 to-transparent backdrop-blur-md">
        <Link 
          href="/"
          className="absolute left-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} className="text-white" />
        </Link>
        <span className="font-display font-medium text-[15px] tracking-[0.2em] uppercase text-white/90">Visitor Guide</span>
      </header>

      <main className="relative z-10 pt-32 pb-32 px-6 md:px-12 max-w-6xl mx-auto">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 text-center"
        >
          <span className="text-[0.75rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)]">Visitor Guide</span>
          <h1 className="mt-4 font-display text-4xl md:text-5xl lg:text-7xl font-medium tracking-tight text-white">How to Experience Wazwan</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">Everything you should know before you sit at the trami.</p>
        </motion.div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tips.map((tip, i) => (
            <motion.article 
              key={tip.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="rounded-[24px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:border-[var(--saffron)] flex flex-col justify-start"
            >
              <div className="font-display text-4xl font-bold text-[var(--saffron)] opacity-50">
                {tip.number}
              </div>
              <h3 className="mt-6 font-display text-3xl font-medium tracking-tight text-white leading-tight">{tip.title}</h3>
              <p className="mt-4 text-base leading-relaxed text-white/60">{tip.description}</p>
            </motion.article>
          ))}
        </div>

        {/* Footer CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-32 text-center"
        >
          <div className="w-16 h-[1px] bg-white/20 mx-auto mb-10" />
          <h2 className="font-display text-3xl md:text-4xl text-white mb-6">Ready to experience the royal feast?</h2>
          <Link href="/plan" className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-white text-black font-semibold tracking-wide hover:bg-[var(--saffron)] transition-colors duration-300">
            Plan your visit
          </Link>
        </motion.div>

      </main>
    </div>
  );
}
