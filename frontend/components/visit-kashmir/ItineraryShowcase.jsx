import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const itineraries = [
  {
    days: 3,
    title: "Perfect Weekend Escape",
    img: "/images/destinations/srinagar.png",
    timeline: [
      { day: 1, text: "Srinagar Local Sightseeing" },
      { day: 2, text: "Gulmarg Adventure" },
      { day: 3, text: "Pahalgam & Return" }
    ]
  },
  {
    days: 5,
    title: "Classic Kashmir Tour",
    img: "/images/destinations/gulmarg.png",
    timeline: [
      { day: 1, text: "Srinagar Arrival & Shikara" },
      { day: 2, text: "Gulmarg Gondola Ride" },
      { day: 3, text: "Pahalgam Valleys" },
      { day: 4, text: "Sonamarg Glaciers" },
      { day: 5, text: "Srinagar Shopping & Departure" }
    ]
  },
  {
    days: 7,
    title: "Wilderness Explorer",
    img: "/images/destinations/gurez.png",
    timeline: [
      { day: 1, text: "Srinagar Arrival" },
      { day: 2, text: "Gulmarg Ski Resort" },
      { day: 3, text: "Pahalgam Base Camp" },
      { day: 4, text: "Sonamarg Trekking" },
      { day: 5, text: "Doodhpathri Meadows" },
      { day: 6, text: "Gurez Valley Expedition" },
      { day: 7, text: "Return to Srinagar" }
    ]
  }
];

export default function ItineraryShowcase() {
  return (
    <section className="relative w-full max-w-[1600px] mx-auto px-6 md:px-12 py-24 z-20">
      <div className="flex flex-col lg:flex-row justify-between items-end mb-12">
        <div>
          <h2 className="font-playfair text-4xl md:text-5xl text-white mb-4 uppercase tracking-wide">
            Popular Itineraries
          </h2>
          <p className="text-muted text-sm tracking-widest uppercase">
            Curated journeys for every kind of traveller
          </p>
        </div>
        <button className="text-gold text-xs font-bold uppercase tracking-widest hover:text-white transition-colors mt-4 lg:mt-0 flex items-center gap-2">
          View all itineraries <span>&rarr;</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {itineraries.map((plan, i) => (
          <motion.div
            key={plan.days}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            className="group relative rounded-[24px] overflow-hidden bg-dark-800 border border-white/5 hover:border-gold/40 hover:shadow-[0_0_40px_rgba(212,175,99,0.15)] transition-all duration-500 flex flex-col h-full"
          >
            {/* Image Header */}
            <div className="relative h-48 w-full overflow-hidden">
              <Image 
                src={plan.img} 
                alt={plan.title} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-800 via-dark-800/20 to-transparent" />
              
              <div className="absolute top-4 left-4 bg-dark-900/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
                <span className="text-gold text-[10px] font-bold uppercase tracking-widest">{plan.days} Days Itinerary</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 flex-grow flex flex-col">
              <h3 className="font-playfair text-2xl text-white mb-6 group-hover:text-gold transition-colors">{plan.title}</h3>
              
              <div className="space-y-4 mb-8 flex-grow">
                {plan.timeline.map((item) => (
                  <div key={item.day} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full border border-gold/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                    </div>
                    <div>
                      <span className="text-white/70 text-[10px] uppercase tracking-widest font-bold block mb-0.5">Day {item.day}</span>
                      <span className="text-white/80 text-sm">{item.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full py-4 border-t border-white/10 text-white hover:text-gold hover:border-gold/30 flex items-center justify-between transition-colors uppercase tracking-widest text-xs font-bold mt-auto group/btn">
                <span>Explore Details</span>
                <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
