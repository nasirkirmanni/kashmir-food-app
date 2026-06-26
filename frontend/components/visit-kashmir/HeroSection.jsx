import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";

export default function HeroSection({ onPlanClick }) {
  const stats = [
    { label: "Destinations", value: "100+", icon: "🏔️" },
    { label: "Restaurants", value: "50+", icon: "🍽️" },
    { label: "Authentic Dishes", value: "100+", icon: "🥘" },
    { label: "Trip Planner", value: "AI", icon: "🧠" }
  ];

  return (
    <section className="relative w-full max-w-[1600px] mx-auto px-6 md:px-12 pt-8 pb-40 lg:pt-12 lg:pb-48">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-8 items-center">
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="z-10"
        >
          <span className="text-gold text-xs font-bold uppercase tracking-[0.3em] mb-4 block">
            The Ultimate Kashmir Travel Guide
          </span>
          <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl text-white font-medium leading-[1.05] tracking-tight mb-2">
            Visit Kashmir
          </h1>
          <div className="font-playfair italic text-3xl md:text-4xl text-gold mb-8">
            "Paradise on Earth"
          </div>
          
          <p className="text-muted text-lg max-w-xl mb-12 leading-relaxed">
            Plan your perfect trip with AI, discover breathtaking destinations, authentic Wazwan, and unforgettable experiences Kashmir has to offer.
          </p>

          <div className="flex flex-wrap gap-6 mb-12">
            {stats.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + (i * 0.1) }}
                className="flex items-center gap-3"
              >
                <span className="text-2xl opacity-80">{stat.icon}</span>
                <div>
                  <div className="text-white font-semibold text-lg">{stat.value}</div>
                  <div className="text-muted text-xs uppercase tracking-wider">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onPlanClick}
              className="bg-gold text-dark-900 px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,175,99,0.3)]"
            >
              Let Waza AI Plan Your Trip ✦
            </button>
            <button className="border border-white/20 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:border-white/50 hover:bg-white/5 transition-all">
              Explore Kashmir
            </button>
          </div>
        </motion.div>

        {/* Right Content - Cinematic Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full h-[400px] lg:h-[600px] xl:h-[700px] rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-transparent to-transparent z-10 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-transparent z-10 lg:hidden" />
          
          <Image
            src="/dal.jpg"
            alt="Dal Lake Shikara at Sunset"
            fill
            className="object-cover"
            priority
          />

          {/* Floating Badges */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-12 right-12 z-20 bg-dark-900/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2"
          >
            <MapPin className="w-4 h-4 text-gold" />
            <span className="text-white text-xs font-semibold">Dal Lake, Srinagar</span>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-24 right-12 z-20 bg-dark-900/60 backdrop-blur-lg border border-white/10 p-4 rounded-2xl flex items-center gap-4 max-w-[220px]"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-dark-900 bg-white/20 overflow-hidden relative">
                   <Image src={`/avatar${i}.png`} alt={`Trusted User ${i}`} fill sizes="40px" className="object-cover" />
                </div>
              ))}
            </div>
            <div>
              <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Trusted by thousands</div>
              <div className="flex items-center gap-1 text-gold">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
