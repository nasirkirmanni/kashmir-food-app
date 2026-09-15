import Image from "next/image";
import Link from "next/link";
import destinationIds from "@/destinations-static-ids.json";
import restaurantIds from "@/restaurants-static-ids.json";
import dishIds from "@/dishes-static-ids.json";
import { motion, useScroll, useTransform } from "framer-motion";
import { Clock, Banknote, Sun, Car, Home, Backpack, ChevronDown } from "lucide-react";
import { useState } from "react";

// --- Travel Info Grid ---
const travelTips = [
  { icon: Clock, title: "Best Time to Visit", desc: "April to October for pleasant weather. December to March for snow." },
  { icon: Banknote, title: "Budget Guide", desc: "₹5,000 to ₹15,000+ per day depending on luxury tier." },
  { icon: Sun, title: "Weather", desc: "Summers are mild (15-30°C). Winters are freezing (-2 to 10°C)." },
  { icon: Car, title: "How to Reach", desc: "Fly to Srinagar (SXR) or take a train to Jammu Tawi." },
  { icon: Home, title: "Where to Stay", desc: "Luxury houseboats on Dal Lake, or premium resorts in Gulmarg." },
  { icon: Backpack, title: "Packing Essentials", desc: "Heavy woolens for winter. Light jackets for summer evenings." }
];

export function TravelInfoGrid() {
  return (
    <section className="relative w-full max-w-[1600px] mx-auto px-6 md:px-12 py-24 z-20">
      <div className="flex flex-col lg:flex-row justify-between items-end mb-12">
        <div>
          <h2 className="font-playfair text-4xl md:text-5xl text-white mb-4 uppercase tracking-wide">
            Travel Tips & Info
          </h2>
          <p className="text-muted text-sm tracking-widest uppercase">
            Everything you need to know before you go
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {travelTips.map((tip, i) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="p-8 rounded-[24px] border border-white/10 bg-dark-800/50 backdrop-blur-sm hover:bg-dark-800 transition-colors"
          >
            <tip.icon className="w-8 h-8 text-gold mb-6 stroke-[1.5]" />
            <h3 className="font-playfair text-2xl text-white mb-3">{tip.title}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{tip.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// --- Trust Bar ---
const stats = [
  // Real figures only: catalogue counts, and the Wazwan course range the food guides cite.
  { value: String(destinationIds.length), label: "Destinations" },
  { value: String(dishIds.length), label: "Kashmiri Dishes" },
  { value: String(restaurantIds.length), label: "Restaurants Listed" },
  { value: "7–36", label: "Wazwan Courses" }
];

export function TrustBar() {
  return (
    <section className="border-y border-white/10 bg-dark-900/80 backdrop-blur-lg relative z-20 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,99,0.05),transparent_70%)]" />
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-white/10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center px-4"
            >
              <div className="font-playfair text-4xl md:text-5xl lg:text-6xl text-white mb-2">{stat.value}</div>
              <div className="text-gold text-xs font-bold uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Blog & FAQ ---
// Real posts, newest first; each card links to the article.
const articles = [
  { category: "Travel & Food Guides", title: "What to Eat in Kashmir: A First-Timer's Guide to the Valley's Food", readTime: "10 min read", date: "Sep 15, 2026", img: "/images/kashmiri-food/hero.webp", href: "/blog/what-to-eat-in-kashmir" },
  { category: "Heritage Cookery", title: "Kashmiri Cuisine Explained: Two Kitchens, Everyday Food and the Wazwan Feast", readTime: "11 min read", date: "Sep 15, 2026", img: "/wazwan-hero.jpg", href: "/blog/kashmiri-cuisine-explained" },
  { category: "Travel & Food Guides", title: "Kashmiri Street Food: What to Eat in Srinagar, Where and When", readTime: "10 min read", date: "Sep 15, 2026", img: "/images/kashmiri-food/street-food.webp", href: "/blog/kashmiri-street-food-srinagar" },
  { category: "Bread Culture", title: "Kashmiri Breakfast: Noon Chai, the Kandur and What Kashmir Eats in the Morning", readTime: "9 min read", date: "Sep 15, 2026", img: "/images/kashmiri-food/bakery.webp", href: "/blog/kashmiri-breakfast" }
];

const faqs = [
  { q: "Is Kashmir safe for tourists?", a: "Yes, Kashmir is highly safe for tourists. The locals are exceptionally welcoming and tourism is a primary industry. However, standard travel precautions are advised as with any destination." },
  { q: "Do I need a special permit?", a: "Indian citizens do not need permits for most tourist areas. Foreign nationals must register upon arrival. Areas near the Line of Control (like Gurez) may require a pass for all visitors." },
  { q: "What network works in Kashmir?", a: "Only postpaid SIM cards from other states work in Jammu & Kashmir. Prepaid SIMs will not have service. Jio, Airtel, and BSNL postpaid connections work best." },
  { q: "How does the AI Planner work?", a: "Our AI Planner takes your preferences, budget and travel party and builds a day-by-day itinerary around them." }
];

export function BlogFAQSection() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section className="relative w-full max-w-[1600px] mx-auto px-6 md:px-12 py-24 z-20">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-20">
        
        {/* Blog Column */}
        <div>
          <h2 className="font-playfair text-4xl text-white mb-10 uppercase tracking-wide">
            Latest Dispatches
          </h2>
          <div className="space-y-6">
            {articles.map((article, i) => (
              <Link key={article.href} href={article.href} className="block">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex gap-6 items-center cursor-pointer p-4 -mx-4 rounded-2xl hover:bg-white/5 transition-colors"
              >
                <div className="relative w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={article.img} alt={article.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div>
                  <div className="text-gold text-[10px] font-bold uppercase tracking-widest mb-2">{article.category}</div>
                  <h3 className="font-playfair text-xl text-white mb-2 group-hover:text-gold transition-colors line-clamp-2">{article.title}</h3>
                  <div className="flex gap-4 text-xs text-white/40 uppercase tracking-wider">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQ Column */}
        <div>
          <h2 className="font-playfair text-4xl text-white mb-10 uppercase tracking-wide">
            Frequently Asked
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${openFaq === i ? 'border-gold/50 bg-dark-800' : 'border-white/10 bg-transparent hover:border-white/30'}`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full text-left p-6 flex justify-between items-center"
                >
                  <span className={`font-playfair text-xl transition-colors ${openFaq === i ? 'text-gold' : 'text-white'}`}>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-white/50 transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-gold' : ''}`} />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 text-white/60 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Newsletter ---
export function NewsletterBanner() {
  return (
    <section className="px-6 md:px-12 py-12 z-20 max-w-[1600px] mx-auto w-full">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-[32px] overflow-hidden bg-dark-900 border border-white/10 py-24 px-8 text-center"
      >
        <div className="absolute inset-0 opacity-30 mix-blend-overlay">
          <Image src="/dal.jpg" alt="Background" fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/80 to-transparent" />
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="text-gold text-xs font-bold uppercase tracking-[0.3em] mb-4 block">
            Premium Concierge
          </span>
          <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-white mb-6">
            Let Waza AI craft your perfect Kashmir trip.
          </h2>
          <p className="text-muted text-sm md:text-base mb-10 max-w-xl mx-auto">
            Receive early access to new itineraries and culinary guides.
          </p>

          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-grow bg-white/5 border border-white/20 rounded-full px-6 py-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold transition-colors backdrop-blur-md"
            />
            <button className="bg-gold text-dark-900 px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
