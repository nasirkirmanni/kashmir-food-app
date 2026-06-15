"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const rules = [
  {
    title: "The Trammi",
    description: "Wazwan is not eaten on individual plates. It is served on a massive, intricately carved copper platter called a trammi. Four people share one trammi, signifying absolute equality and brotherhood before God and the host. No matter your status, you eat shoulder-to-shoulder.",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" // Info icon substitute
  },
  {
    title: "Tash-t-Nari",
    description: "Before the feast begins, attendants walk through the seated guests with a tash-t-nari—a traditional copper basin and pitcher. Hold your hands over the basin while warm water is poured over them to wash. Towels are provided to dry off.",
    icon: "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" // Water drop
  },
  {
    title: "Right Hand Only",
    description: "Cutlery has no place in a Wazwan. You must eat exclusively with your right hand. Your left hand should remain clean and is typically rested on your lap or used strictly for drinking water.",
    icon: "M18 8a2 2 0 1 1-4 0v5l-2-2-4 4 6 6h6a2 2 0 0 0 2-2V10a2 2 0 1 0-4 0z" // Hand
  },
  {
    title: "Respect the Quadrant",
    description: "When the trammi arrives, it is heaped with rice and topped with initial meat delicacies like Seekh Kebabs and Tabakh Maaz. Mentally divide the trammi into four quadrants. Eat only from your quadrant and do not dig into your neighbor's section.",
    icon: "M3 3h18v18H3z M12 3v18 M3 12h18" // Quadrants
  },
  {
    title: "The Sacred Sequence",
    description: "The waza (head chef) and his team serve dishes in a strict, centuries-old sequence—starting with the dry items and progressing through rich gravies like Rista and Rogan Josh. Never ask for a dish out of order.",
    icon: "M4 6h16M4 12h16M4 18h16" // Sequence/List
  },
  {
    title: "The Grand Finale",
    description: "The feast culminates with Gushtaba—a velvety, sponge-like mutton meatball cooked in a complex yogurt gravy. The arrival of Gushtaba universally signals the end of the meal. Do not ask for more rice or dishes after it is served.",
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" // Shield/Finale
  },
  {
    title: "The Closing Kahwa",
    description: "Following the Gushtaba, the tash-t-nari returns for a final hand wash. The experience is then settled with a hot cup of Kahwa—traditional Kashmiri green tea brewed with saffron, cardamom, and crushed almonds.",
    icon: "M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 3h-2l-1.46 2.46C12.86 5.17 12.44 5 12 5s-.86.17-1.54.46L9 3H7l1.63 3.04C7.88 6.55 7.26 7.22 6.81 8H4v2h2v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V10h2V8zM14 20H10v-6h4v6zm0-8H10v-2h4v2z" // Cup
  }
];

export default function EtiquettePage() {
  const router = useRouter();

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
        <button 
          onClick={() => router.back()}
          className="absolute left-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <span className="font-display font-medium text-[15px] tracking-[0.2em] uppercase text-white/90">Wazwan Etiquette</span>
      </header>

      <main className="relative z-10 pt-32 pb-32 px-6 md:px-12 max-w-4xl mx-auto">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 text-center md:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--saffron)]/30 bg-[var(--saffron)]/10 text-[var(--saffron)] text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--saffron)] animate-pulse" />
            Cultural Guide
          </div>
          <h1 className="font-display font-medium text-5xl md:text-7xl leading-[1.1] tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50">
            The 7 Unwritten Rules <br className="hidden md:block" />
            <span className="text-[var(--saffron)] italic">of Wazwan</span>
          </h1>
          <p className="text-[#888] text-lg md:text-xl max-w-2xl leading-relaxed">
            Wazwan is more than a meal; it is a sacred ceremony of hospitality. To dine as a Kashmiri, you must understand the deep-rooted etiquette that governs the feast.
          </p>
        </motion.div>

        {/* Rules Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[var(--saffron)]/20 to-transparent" />

          <div className="flex flex-col gap-12 md:gap-16">
            {rules.map((rule, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex gap-6 md:gap-10 items-start group"
              >
                {/* Number / Icon Node */}
                <div className="relative z-10 shrink-0 mt-1">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#111] border border-white/10 flex items-center justify-center shadow-xl group-hover:border-[var(--saffron)]/50 group-hover:bg-[var(--saffron)]/10 transition-all duration-500">
                    <span className="font-display font-bold text-xl md:text-2xl text-white/50 group-hover:text-[var(--saffron)] transition-colors">
                      0{index + 1}
                    </span>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-full bg-[var(--saffron)] blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                </div>

                {/* Content Card */}
                <div className="flex-1 bg-[#111]/50 backdrop-blur-sm border border-white/5 rounded-3xl p-6 md:p-8 hover:bg-[#161616] hover:border-white/10 transition-colors duration-300">
                  <h3 className="font-display font-medium text-2xl md:text-3xl text-white mb-3 tracking-tight">
                    {rule.title}
                  </h3>
                  <p className="font-body text-[#888] leading-relaxed text-sm md:text-base">
                    {rule.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
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
