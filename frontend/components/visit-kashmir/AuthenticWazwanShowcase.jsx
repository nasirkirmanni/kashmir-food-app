import Image from "next/image";
import { motion } from "framer-motion";

const dishes = [
  { name: "Rogan Josh", desc: "The Crown Jewel", img: "/images/dishes/rogan-josh.webp" },
  { name: "Rista", desc: "A Royal Delight", img: "/images/dishes/rista.jpg" },
  { name: "Gushtaba", desc: "Kashmir's Pride", img: "/images/dishes/gushtaba.jpg" },
  { name: "Tabak Maaz", desc: "Slow Cooked Perfection", img: "/images/dishes/tabak-maaz.jpg" },
  { name: "Yakhni", desc: "The Signature Taste", img: "/images/dishes/mughal-yakhni.jpg" }
];

export default function AuthenticWazwanShowcase() {
  return (
    <section className="relative w-full max-w-[1600px] mx-auto px-6 md:px-12 py-24 z-20">
      <div className="flex flex-col lg:flex-row justify-between items-end mb-12">
        <div>
          <h2 className="font-playfair text-4xl md:text-5xl text-white mb-4 uppercase tracking-wide">
            Taste Authentic Wazwan
          </h2>
          <p className="text-muted text-sm tracking-widest uppercase">
            Experience the royal cuisine of Kashmir
          </p>
        </div>
        <button className="text-gold text-xs font-bold uppercase tracking-widest hover:text-white transition-colors mt-4 lg:mt-0 flex items-center gap-2">
          Explore all dishes <span>&rarr;</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {dishes.map((dish, i) => (
          <motion.div
            key={dish.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -10 }}
            className="group relative bg-dark-800/50 backdrop-blur-md border border-white/5 hover:border-gold/30 rounded-[24px] p-6 text-center cursor-pointer transition-all duration-300 shadow-lg hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-gold transition-colors shadow-2xl shadow-black">
              <Image 
                src={dish.img} 
                alt={dish.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3" 
              />
            </div>
            <h3 className="font-playfair text-xl text-white mb-2 group-hover:text-gold transition-colors">{dish.name}</h3>
            <p className="text-muted text-[10px] uppercase tracking-widest">{dish.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
