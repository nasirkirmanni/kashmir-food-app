import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, ChefHat } from "lucide-react";

const CANONICAL_URL = "https://wazwanway.com/blog/gushtaba";

export const metadata = {
  title: "Gushtaba: The Royal Finale of the Wazwan",
  description: "Discover the rich history, intricate preparation, and cultural significance of Gushtaba, the velvety meatball dish that serves as the grand finale of the traditional Kashmiri Wazwan.",
  keywords: "Gushtaba, Wazwan, Kashmiri cuisine, meatball, royal feast, Kashmiri recipes, food blog",
  // Without these the page inherits the /blog canonical and og tags from the layout.
  alternates: { canonical: CANONICAL_URL },
  openGraph: {
    type: "article",
    url: CANONICAL_URL,
    siteName: "Wazwan Way",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
  },
};

export default function GushtabaBlogPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#C8A46A] selection:text-black">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/scroll/GUSHTABA.png"
            alt="Authentic Kashmiri Gushtaba"
            fill
            className="object-cover opacity-60 transition-transform duration-1000 ease-in-out hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-16 md:px-16 lg:px-24">
          <Link href="/blog" className="mb-6 inline-flex w-fit items-center gap-2 text-sm font-medium tracking-widest text-[#C8A46A] uppercase transition-colors hover:text-white">
            <ArrowLeft size={16} />
            Back to Blog
          </Link>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold tracking-[0.2em] text-[#E6C875] uppercase">
            <span className="flex items-center gap-1.5"><Clock size={14} /> 5 min read</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><ChefHat size={14} /> Culinary Heritage</span>
          </div>
          <h1 className="mt-4 font-bodoni text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
            Gushtaba: The Royal <span className="italic text-[#C8A46A]">Finale</span>
          </h1>
          <p className="mt-4 max-w-2xl font-body text-lg text-white/80 md:text-xl">
            The dish that commands respect, concludes the grand Wazwan, and demands hours of rhythmic pounding by master Wazas.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <main className="mx-auto max-w-3xl px-6 py-16 md:px-12 md:py-24">
        <article className="prose prose-invert prose-lg max-w-none font-body prose-headings:font-bodoni prose-headings:font-semibold prose-a:text-[#C8A46A] prose-a:no-underline hover:prose-a:text-[#E6C875]">
          <p className="lead text-2xl font-light leading-relaxed text-[#F4ECDF]">
            In the heart of Kashmir, a feast is never just a meal—it is a performance. And every great performance requires a spectacular finale. In the traditional 36-course Wazwan, that finale is the Gushtaba.
          </p>

          <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-[#C8A46A]/30 to-transparent" />

          <h2 className="text-3xl text-white">More Than Just a Meatball</h2>
          <p>
            To call Gushtaba a "meatball" is to do a grave disservice to the centuries of culinary evolution that created it. It is a velvety, melt-in-the-mouth delicacy crafted from freshly pounded mutton and cooked in an aromatic, complex yogurt-based gravy. 
          </p>
          <p>
            When the Waza (master chef) serves the Gushtaba, it signals the end of the meat courses. It is a silent cue to the guests that the feast is reaching its conclusion. Refusing the Gushtaba is considered a breach of etiquette, an insult to the host's hospitality.
          </p>

          <h3 className="text-2xl text-[#E6C875]">The Rhythm of the Stone</h3>
          <p>
            The preparation of Gushtaba begins long before the feast. It is a labor-intensive process that relies entirely on human strength and rhythm. Fresh mutton, typically from the leg, is placed on a smooth stone block. Using a special wooden mallet called a <em>Gosht Pësh</em>, the Waza pounds the meat relentlessly.
          </p>
          <p>
            Animal fat is slowly incorporated into the meat during the pounding process, turning it into a smooth, elastic emulsion. This step cannot be rushed or replicated by a machine; the heat of a food processor would melt the fat and ruin the delicate texture. The rhythmic thud of the mallets is the heartbeat of a Kashmiri wedding morning.
          </p>

          <blockquote className="my-10 border-l-4 border-[#C8A46A] bg-white/5 p-6 italic text-[#F4ECDF] shadow-lg backdrop-blur-sm">
            "The secret of Gushtaba is not in the spices, but in the patience of the hands that pound the meat. It must be as soft as a cloud, yet hold its shape in the boiling yogurt."
          </blockquote>

          <h3 className="text-2xl text-[#E6C875]">The Yakhni (Yogurt Gravy)</h3>
          <p>
            While the meatballs themselves are a marvel, the gravy—known as Yakhni—elevates the dish to royalty. The yogurt is whisked continuously over a fire to prevent it from curdling, a process that requires a strong arm and undivided attention. 
          </p>
          <p>
            It is infused with a fragrant blend of fennel powder, dry ginger, cardamom, and a touch of dried mint. The resulting broth is a delicate balance of tartness, warmth, and herbal freshness, cutting through the richness of the meat.
          </p>

          <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-[#C8A46A]/30 to-transparent" />

          <h2 className="text-3xl text-white">Experiencing the Finale</h2>
          <p>
            When dining at a traditional Wazwan, the Gushtaba is placed in the center of the <em>Traami</em> (the copper plate shared by four people). Breaking it apart with your fingers reveals its sponge-like texture, which eagerly absorbs the surrounding Yakhni.
          </p>
          <p>
            It is a dish that leaves a lingering taste of fennel and mint, a soothing finish to the heavily spiced courses that preceded it. The next time you find yourself in Kashmir, wait for the Gushtaba. It is worth every minute.
          </p>
        </article>
      </main>
    </div>
  );
}
