import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MapPin } from "lucide-react";

const destinations = [
  { name: "Srinagar", subtitle: "The Heart of Kashmir", rating: 4.8, img: "/images/destinations/srinagar.png" },
  { name: "Gulmarg", subtitle: "Snow Paradise", rating: 4.9, img: "/images/destinations/gulmarg.png" },
  { name: "Pahalgam", subtitle: "Valley of Shepherds", rating: 4.8, img: "/images/destinations/pahalgam.png" },
  { name: "Sonamarg", subtitle: "Meadow of Gold", rating: 4.7, img: "/images/destinations/sonamarg.png" },
  { name: "Doodhpathri", subtitle: "Hidden Gem", rating: 4.6, img: "/images/destinations/doodhpathri.png" },
  { name: "Gurez Valley", subtitle: "Untouched Beauty", rating: 4.7, img: "/images/destinations/gurez.png" }
];

export default function DestinationsShowcase() {
  return (
    <section className="relative w-full max-w-[1600px] mx-auto px-6 md:px-12 py-24 z-20">
      <div className="flex flex-col lg:flex-row justify-between items-end mb-12">
        <div>
          <h2 className="font-playfair text-4xl md:text-5xl text-white mb-4 uppercase tracking-wide">
            Explore Iconic Destinations
          </h2>
          <p className="text-muted text-sm tracking-widest uppercase">
            From serene lakes to majestic mountains
          </p>
        </div>
        <Link href="/destinations" className="text-gold text-xs font-bold uppercase tracking-widest hover:text-white transition-colors mt-4 lg:mt-0 flex items-center gap-2">
          View all destinations <span>&rarr;</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5, scale: 1.03 }}
              className="group relative h-[280px] rounded-[24px] overflow-hidden cursor-pointer border border-white/5 hover:border-gold/50 shadow-lg hover:shadow-[0_0_30px_rgba(212,175,99,0.15)] transition-all duration-300"
            >
              <Image 
                src={dest.img} 
                alt={dest.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end h-full">
                <h3 className="font-playfair text-2xl text-white mb-1 group-hover:text-gold transition-colors">{dest.name}</h3>
                <p className="text-white/70 text-xs mb-3">{dest.subtitle}</p>
                <div className="flex items-center gap-1 text-gold text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{dest.rating}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Map Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative h-[400px] xl:h-auto rounded-[24px] overflow-hidden border border-white/10 bg-dark-800 p-8 flex flex-col justify-center items-center text-center"
        >
          {/* Faux map background (could be an image) */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,99,0.1),transparent_70%)]" />
          
          {/* Floating map pins */}
          <MapPin className="absolute top-[30%] left-[20%] w-6 h-6 text-gold animate-bounce" style={{ animationDelay: '0ms' }} />
          <MapPin className="absolute top-[60%] left-[70%] w-5 h-5 text-gold animate-bounce" style={{ animationDelay: '200ms' }} />
          <MapPin className="absolute top-[40%] left-[50%] w-7 h-7 text-gold animate-bounce" style={{ animationDelay: '400ms' }} />

          <div className="relative z-10">
            <h3 className="font-playfair text-3xl text-white mb-4">Discover places across Kashmir</h3>
            <p className="text-muted text-sm mb-8 max-w-[250px] mx-auto">
              Interactive map with 100+ locations to explore.
            </p>
            <Link href="/destinations" className="inline-block bg-gold/10 border border-gold text-gold px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-dark-900 transition-all">
              View Map
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
