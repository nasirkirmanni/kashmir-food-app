"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const breads = [
  {
    name: "Girda",
    pronunciation: "gir-da",
    type: "Daily Breakfast Flatbread",
    timing: "Dawn / Morning (6:00 AM – 9:00 AM)",
    description: "Girda is the staple breakfast bread of Kashmir. It is a medium-sized circular yeasted flatbread, pressed down with the baker's fingertips to create tiny indentations across its golden surface.",
    pairing: "Best served piping hot, spread generously with fresh butter, and dipped in salted pink Noon Chai.",
    technique: "Baked on the inside walls of the clay tandoor until the base is perfectly crisp and the top is warm and pillowy."
  },
  {
    name: "Lavas",
    pronunciation: "la-vas",
    type: "Puffed Wrap Bread",
    timing: "Morning & Afternoon Tea",
    description: "Lavas is a thin, unleavened flatbread. It can be soft and paper-thin (used for wrapping around seekh kebabs/tujji) or baked longer until it becomes puffed, flaky, and crispy.",
    pairing: "Perfect for wrapping barbecued mutton tujji or eaten with soft curd and onion chutney.",
    technique: "Stretched paper-thin over a cloth pad (tzot-pad) and slapped onto the hot inner clay wall of the oven."
  },
  {
    name: "Bakerkhani",
    pronunciation: "ba-kar-khaa-nee",
    type: "Puff Pastry Bread",
    timing: "Afternoon Tea (3:00 PM – 5:30 PM)",
    description: "A thick, golden-brown round bread with multiple flaky, laminated layers. It is decorated by pricking the top with a comb-like tool or fingers and sprinkling sesame seeds.",
    pairing: "Traditionally paired with saffron green tea (Kahwa) or evening Noon Chai.",
    technique: "Laminated with pure ghee or butter repeatedly before baking, giving it a rich, melt-in-your-mouth texture similar to croissants."
  },
  {
    name: "Czochworu",
    pronunciation: "choch-wo-roo",
    type: "Kashmiri Bagel",
    timing: "Afternoon Tea (4:00 PM – 6:00 PM)",
    description: "A small, round, doughnut-shaped bread with a golden-brown crust, topped with sesame or poppy seeds. It has a dry, crusty exterior and a dense, chewy interior.",
    pairing: "Split in half, spread with butter, and dunked into salted Noon Chai.",
    technique: "Baked on the upper edge of the tandoor where the dry heat gives it a hard bagel-like shell."
  },
  {
    name: "Roth",
    pronunciation: "roath",
    type: "Celebratory Sweet Bread",
    timing: "Special Occasions & Festivals",
    description: "A giant, heavy sweet bread adorned with dry fruits, poppy seeds, and silver leaves. It is traditionally baked to celebrate auspicious occasions or family milestones.",
    pairing: "Served as a sweet treat or gifted to relatives during traditional festivals.",
    technique: "Richly kneaded with sugar, milk, and cardamom, and slow-baked to achieve a dense cake-like consistency."
  }
];

export default function BakeryPage() {
  return (
    <div className="wazwan-shell relative min-h-screen pb-24">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.06),transparent_60%)] pointer-events-none" />

      {/* Hero */}
      <section className="place-hero !grid-cols-1 md:!grid-cols-[1fr_auto] gap-8 items-center border-b border-white/5 pb-12">
        <div>
          <span className="place-eyebrow">Kashmiri Culinary Traditions</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight mb-4">
            Kandur Bakery Guide
          </h1>
          <p className="text-white/70 max-w-2xl text-base md:text-lg leading-relaxed">
            In Kashmir, bread is never baked at home. Every neighborhood has a designated clay-oven bakery, the <em>Kandur-wan</em>, serving hot, hand-crafted breads for every hour of the day.
          </p>
        </div>
        <div>
          <Link href="/" className="wazwan-btn-ghost text-xs uppercase tracking-widest font-bold border border-white/10 px-6 py-3 rounded-full hover:border-white/30">
            &larr; Back to Home
          </Link>
        </div>
      </section>

      {/* Narrative Section - The Culture */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md mb-16">
          <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-4">
            The Culture of the Kandur-wan
          </h2>
          <p className="text-white/70 leading-relaxed text-sm md:text-base mb-6">
            The neighborhood <em>Kandur</em> (baker) is the social hub of the Kashmiri community. At the break of dawn, the air is filled with the sweet aroma of wood smoke and baking dough. Neighbors gather at the shop front, exchange morning gossip, and return home with a basket of piping hot bread wrapped in clean cloth.
          </p>
          <p className="text-white/70 leading-relaxed text-sm md:text-base">
            Kashmiri culture designates specific breads for specific times. Eating breakfast without <em>Girda</em> or afternoon tea without a flaky <em>Bakerkhani</em> is considered incomplete. It is a sensory ritual that has bound the valley for centuries.
          </p>
        </div>

        {/* Breads Display List */}
        <h2 className="text-3xl font-display text-white font-medium mb-8 text-center">
          The Five Traditional Breads
        </h2>
        <div className="space-y-8">
          {breads.map((bread, index) => (
            <motion.div
              key={bread.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8 hover:border-[var(--saffron)]/30 transition-all flex flex-col md:flex-row gap-6 items-start"
            >
              {/* Left Column: Title & Meta */}
              <div className="md:w-1/3">
                <span className="text-[var(--saffron)] text-[0.6rem] font-bold uppercase tracking-[0.25em] block mb-1">
                  {bread.type}
                </span>
                <h3 className="text-3xl font-display font-medium text-white mb-1">
                  {bread.name}
                </h3>
                <span className="text-white/40 italic text-xs block mb-4">
                  Pronounced: &quot;{bread.pronunciation}&quot;
                </span>
                <div className="inline-flex items-center gap-1.5 rounded bg-white/5 border border-white/5 px-2.5 py-1 text-[0.65rem] font-semibold text-white/60">
                  <svg className="w-3.5 h-3.5 text-[var(--saffron)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{bread.timing}</span>
                </div>
              </div>

              {/* Right Column: Descriptions */}
              <div className="md:w-2/3 space-y-4">
                <div>
                  <h4 className="text-[0.62rem] font-bold uppercase tracking-wider text-white/40 mb-1">
                    Characteristics
                  </h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {bread.description}
                  </p>
                </div>
                <div>
                  <h4 className="text-[0.62rem] font-bold uppercase tracking-wider text-white/40 mb-1">
                    Baking Technique
                  </h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {bread.technique}
                  </p>
                </div>
                <div className="bg-[var(--saffron-pale)] border border-[var(--saffron)]/10 rounded-xl p-4">
                  <h4 className="text-[0.62rem] font-bold uppercase tracking-wider text-[var(--saffron)] mb-1">
                    Serving Pairing
                  </h4>
                  <p className="text-white/90 text-xs leading-relaxed">
                    {bread.pairing}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Noon Chai Section */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md mt-16 flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/2">
            <span className="text-[var(--saffron)] text-[0.6rem] font-bold uppercase tracking-[0.25em] block mb-2">
              The Tea Ceremony
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-4">
              Salted Pink Tea: Noon Chai
            </h2>
            <p className="text-white/70 leading-relaxed text-sm mb-4">
              Kandur bread is rarely eaten alone; it is almost always served alongside **Noon Chai** (also known as Sheer Chai). Brewed with special green tea leaves, baking soda, milk, and salt, it is cooked for hours in a copper Samovar before yielding its trademark dusty pink color.
            </p>
            <p className="text-white/70 leading-relaxed text-sm">
              The salt and bicarbonate soda in the tea aid digestion and help local inhabitants maintain body warmth during freezing winter days.
            </p>
          </div>
          <div className="md:w-1/2 border border-white/10 rounded-xl p-5 bg-black/40 text-xs space-y-4">
            <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-[var(--saffron)]">
              Traditional Samovar Preparation
            </h4>
            <div className="flex gap-3">
              <span className="text-[var(--saffron)] font-bold">01.</span>
              <p className="text-white/70 leading-relaxed">
                Green tea leaves are simmered in water with baking soda until a deep red concentrate is formed.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-[var(--saffron)] font-bold">02.</span>
              <p className="text-white/70 leading-relaxed">
                Milk is added to turn the brew into its characteristic pink hue, then salted to taste.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-[var(--saffron)] font-bold">03.</span>
              <p className="text-white/70 leading-relaxed">
                Poured boiling hot from the central brass chimney of a charcoal-stuffed copper Samovar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
