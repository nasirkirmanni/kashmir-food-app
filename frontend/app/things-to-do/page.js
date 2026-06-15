"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Navigation } from "lucide-react";

const activities = [
  {
    title: "Shikara Rides on Dal Lake",
    location: "Srinagar",
    description: "Experience the tranquility of the summer capital by drifting across the iconic Dal Lake in a traditional wooden Shikara. Explore the floating vegetable markets at dawn and witness the stunning reflection of the Zabarwan mountains.",
    icon: "M21 16.5c-1.75.25-3.5-.25-5.25-1.5-1.75 1.25-3.5 1.75-5.25 1.5-1.75-.25-3.5-1.25-5.25-1.5C3.5 15.25 1.75 16.25 0 16.5v2.5c1.75-.25 3.5-.75 5.25-2 1.75-1.25 3.5-1.75 5.25-1.5 1.75.25 3.5 1.25 5.25 1.5 1.75 1.25 3.5 1.75 5.25 2v-2.5z M12 2v10 M12 2l-4 5 M12 2l4 5", // Boat/Water
    image: "/wazwan-hero.jpg" // Using an existing image as placeholder or just rely on CSS
  },
  {
    title: "Gondola & Skiing",
    location: "Gulmarg",
    description: "Ride one of the highest cable cars in the world to Apharwat Peak. In winter, Gulmarg transforms into a premier skiing destination with some of the best powdery slopes in Asia. In summer, it is a breathtaking 'Meadow of Flowers'.",
    icon: "M14 14l-4 4 M10 10l-4 4 M18 6l-4 4 M22 2l-4 4", // Ski / Diagonal
  },
  {
    title: "River Rafting & Trekking",
    location: "Pahalgam",
    description: "Nestled on the banks of the Lidder River, Pahalgam is an adventure hub. Brave the river rapids, or embark on a multi-day trek through the pristine Lidder Valley up to the high-altitude alpine lakes of Tarsar and Marsar.",
    icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7v6" // Map Pin / Mountain
  },
  {
    title: "Glacier Walks",
    location: "Sonamarg",
    description: "The 'Meadow of Gold' serves as the gateway to the magnificent Thajiwas Glacier. Hire a pony or hike up through pine forests to reach the snow-capped glacier, which remains frozen even in the peak of summer.",
    icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", // Lightning/Energy/Ice
  },
  {
    title: "Mughal Heritage Walks",
    location: "Srinagar",
    description: "Step back into the 16th century by visiting the terraced Mughal Gardens: Nishat Bagh, Shalimar Bagh, and Chashme Shahi. Built by Mughal emperors, these gardens feature stunning water channels, fountains, and vibrant flowerbeds.",
    icon: "M3 21h18 M5 21v-8a7 7 0 0 1 14 0v8 M9 21v-4a3 3 0 0 1 6 0v4", // Arch/Monument
  }
];

export default function ThingsToDoPage() {
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
        <span className="font-display font-medium text-[15px] tracking-[0.2em] uppercase text-white/90">Kashmir Travel</span>
      </header>

      <main className="relative z-10 pt-16 pb-32 px-6 md:px-12 max-w-4xl mx-auto">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--saffron)]/30 bg-[var(--saffron)]/10 text-[var(--saffron)] text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--saffron)] animate-pulse" />
            Top Experiences
          </div>
          <h1 className="font-display font-medium text-5xl md:text-7xl leading-[1.1] tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50">
            Things to Do <br className="hidden md:block" />
            <span className="text-[var(--saffron)] italic">in Kashmir</span>
          </h1>
          <p className="text-[#888] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            From serene lakeside stays to high-altitude adventure sports, discover the experiences that make Kashmir the Paradise on Earth.
          </p>
        </motion.div>

        {/* Activities List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {activities.map((activity, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative group bg-[#111]/40 backdrop-blur-sm border border-white/5 rounded-3xl p-6 md:p-8 hover:bg-[#161616] hover:border-[var(--saffron)]/30 transition-all duration-500 overflow-hidden"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-[var(--saffron)] opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center shadow-xl group-hover:border-[var(--saffron)]/50 group-hover:bg-[var(--saffron)]/10 transition-all duration-500">
                    <svg className="w-6 h-6 text-white/60 group-hover:text-[var(--saffron)] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={activity.icon} />
                    </svg>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[0.65rem] font-bold uppercase tracking-wider text-white/60 group-hover:text-[var(--saffron)] transition-colors">
                    <MapPin size={12} />
                    {activity.location}
                  </div>
                </div>

                <h3 className="font-display font-medium text-2xl md:text-3xl text-white mb-3 tracking-tight group-hover:text-[var(--saffron)] transition-colors">
                  {activity.title}
                </h3>
                <p className="font-body text-[#888] leading-relaxed text-sm md:text-base">
                  {activity.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-24 text-center"
        >
          <div className="w-16 h-[1px] bg-white/20 mx-auto mb-10" />
          <h2 className="font-display text-3xl md:text-4xl text-white mb-6">Ready to explore Paradise?</h2>
          <Link href="/plan" className="inline-flex items-center gap-2 h-14 px-8 rounded-full bg-white text-black font-semibold tracking-wide hover:bg-[var(--saffron)] transition-colors duration-300">
            <Navigation size={18} />
            Start Planning
          </Link>
        </motion.div>

      </main>
    </div>
  );
}
