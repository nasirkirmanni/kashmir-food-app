import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import KashmiriFoodClient from "../KashmiriFoodClient";
import dishesData from "@/data/dishes.json";
import { wazwanGuides } from "@/data/wazwanGuides";

export function generateStaticParams() {
  const paths = [
    // Base route
    { slug: [] },
    // Category routes
    { slug: ["wazwan"] },
    { slug: ["bakery"] },
    { slug: ["beverages"] },
    { slug: ["street-food"] },
    // Guides base
    { slug: ["wazwan", "guide"] },
    { slug: ["bakery", "guide"] },
    { slug: ["beverages", "guide"] },
    { slug: ["street-food", "guide"] },
  ];
  
  // Add all nested guides
  const categoryGuides = {
    wazwan: [
      "what-is-wazwan",
      "dishes-explained",
      "cost-guide",
      "vegetarian-wazwan",
      "etiquette",
      "restaurant-vs-wedding-vs-home",
    ],
    bakery: ["intro-to-bakery", "types-of-bread", "breakfast-guide"],
    beverages: ["kahwa-explained", "noon-chai-explained", "kahwa-vs-noon-chai"],
    "street-food": ["intro", "must-try-foods", "safety-tips"],
  };
  
  Object.keys(categoryGuides).forEach((category) => {
    categoryGuides[category].forEach((guideSlug) => {
      paths.push({ slug: [category, "guide", guideSlug] });
    });
  });
  
  return paths;
}

export async function generateMetadata({ params }) {
  const slug = params?.slug || [];
  const baseUrl = "https://wazwanway.com";
  let canonicalPath = "/kashmiri-food";
  if (slug.length > 0) {
    canonicalPath += `/${slug.join("/")}`;
  }
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  const METADATA_MAPPING = {
    // Base portal
    base: {
      title: "Kashmiri Food Guide | Wazwan, Bakery & Street Food | WazwanWay",
      description: "Explore the authentic culinary traditions of Kashmir. Discover the legendary 36-course royal Wazwan feast, hourly Kandur bakery culture, hot street Tujji, and saffron beverages.",
    },
    // Top-level categories
    categories: {
      wazwan: {
        title: "Kashmiri Wazwan Feast & Trami Sequence Guide | WazwanWay",
        description: "Discover the authentic 36-course Kashmiri Wazwan feast. Learn about the traditional serve sequence, copper Trami etiquette, and classic dishes cooked by master Wazas.",
      },
      beverages: {
        title: "Kashmiri Beverages | Noon Chai, Kahwa & Babribyol | WazwanWay",
        description: "Explore traditional Kashmiri drinks. Learn the difference between pink Noon Chai, saffron-infused Kahwa, Babribyol, and creamy Lassi.",
      },
      bakery: {
        title: "Kashmiri Bakery | Girda, Czot & Bakerkhani Bread | WazwanWay",
        description: "Step into the neighborhood Kandur-wan. Discover hourly baked Kashmiri breads like Girda for breakfast, sesame Czochworu, and flaky Bakerkhani.",
      },
      "street-food": {
        title: "Kashmiri Street Food | Tujji, Harissa & Local Eats | WazwanWay",
        description: "Savor the rustic street foods of Srinagar's bazaars. From coal-grilled Tujji mutton skewers to winter Harissa pastes and crispy snacks.",
      },
    },
    // Guides
    guides: {
      wazwan: {
        base: {
          title: "Kashmiri Wazwan Dining & Culinary Guides | WazwanWay",
          description: "Comprehensive guides to the traditional Wazwan feast. Understand the cooking methods, history, and sequence.",
        },
        "what-is-wazwan": {
          title: "What is Wazwan? The Complete Guide to Kashmir's Legendary Feast",
          description: "Discover the origins, history, and cultural significance of the legendary 36-course Kashmiri Wazwan feast cooked by traditional Wazas.",
        },
        "dishes-explained": {
          title: "Wazwan Dishes Explained: The 16 Main Courses | WazwanWay",
          description: "A complete guide to the main dishes served in a traditional Trami, from Rista and Gustaba to Tabak Maaz and Lahabi Kebab.",
        },
        "cost-guide": {
          title: "How Much Does Wazwan Cost? | WazwanWay",
          description: "What does Wazwan cost in Srinagar? A breakdown of restaurant, wedding, and fine dining price ranges — and what's driving them.",
        },
        "vegetarian-wazwan": {
          title: "Vegetarian Wazwan: What to Expect and What to Order | WazwanWay",
          description: "A honest guide to vegetarian dishes in Wazwan — what's traditionally included, what restaurants offer, and where Kashmiri vegetarian food is actually at its best.",
        },
        etiquette: {
          title: "Wazwan Dining Etiquette: Tash-t-Næær & Trami Rules | WazwanWay",
          description: "Master the social dining etiquette of a Kashmiri Wazwan. Learn about sharing the Trami, washing hands, and traditional protocols.",
        },
        "restaurant-vs-wedding-vs-home": {
          title: "Wazwan: Restaurant vs Wedding vs Home | WazwanWay",
          description: "The setting, the cook, the fuel, and the ingredients are genuinely different across these three versions of Wazwan. Here's what changes and why it matters.",
        },
      },
      bakery: {
        base: {
          title: "Kashmiri Bakery & Bread Culture Guides | WazwanWay",
          description: "Guides to the neighborhood Kandur-wan bakery tradition in Kashmir.",
        },
        "intro-to-bakery": {
          title: "Introduction to Kashmiri Kandur-wan Bakery Culture | WazwanWay",
          description: "Discover why Kashmiris never bake bread at home. Learn about the community wood-fired tandoor ovens and morning Kandur rituals.",
        },
        "types-of-bread": {
          title: "Every Kashmiri Bread Explained: Girda to Bakerkhani | WazwanWay",
          description: "A glossary of all traditional Kashmiri breads including Girda, Czot, Czochworu, Bakerkhani, and Sheermal.",
        },
        "breakfast-guide": {
          title: "Kashmiri Breakfast Guide: Breads, Chai & Pairings | WazwanWay",
          description: "Start your day like a local in Kashmir. The ultimate guide to morning flatbreads, butter pairings, and hot pink Noon Chai.",
        },
      },
      beverages: {
        base: {
          title: "Kashmiri Beverages & Tea Brewing Guides | WazwanWay",
          description: "Guides to authentic Kashmiri hot and cold drinks.",
        },
        "kahwa-explained": {
          title: "Kashmiri Kahwa Guide: Ingredients, Benefits & Recipe | WazwanWay",
          description: "Learn how to brew authentic green tea Kahwa with saffron, green cardamom, cinnamon, and crushed almonds.",
        },
        "noon-chai-explained": {
          title: "Kashmiri Noon Chai: The Pink Salt Tea Guide | WazwanWay",
          description: "Discover the science and culture behind Kashmiri pink tea. Learn the ingredients, brewing method, and salty taste.",
        },
        "kahwa-vs-noon-chai": {
          title: "Kahwa vs. Noon Chai: Differences & Occasions | WazwanWay",
          description: "Compare Kashmir's two iconic teas. Learn when to serve sweet saffron Kahwa versus salty pink Noon Chai.",
        },
      },
      "street-food": {
        base: {
          title: "Kashmiri Street Food & Bazaar Dining Guides | WazwanWay",
          description: "Guides to the street foods and local bazaars of Kashmir.",
        },
        intro: {
          title: "Kashmiri Street Food Culture: An Introduction | WazwanWay",
          description: "An introduction to the street food culture of Srinagar. Learn where to find the best local delicacies and snacks.",
        },
        "must-try-foods": {
          title: "10 Must-Try Kashmiri Street Foods: Tujji to Monjji | WazwanWay",
          description: "The ultimate bucket list of Kashmiri street foods. Try coal-grilled Tujji skewers, crispy Monjji fritters, and Masala Lavas.",
        },
        "safety-tips": {
          title: "Srinagar Street Food Safety & Hygiene Guide | WazwanWay",
          description: "Tips for enjoying Kashmiri street food safely. Learn how to select vendors and avoid common travel stomach issues.",
        },
      },
    },
  };

  // Check if it matches a guide article
  if (slug.length === 3 && slug[1] === "guide") {
    const category = slug[0];
    const guideSlug = slug[2];
    const guide = wazwanGuides.find((g) => g.slug === guideSlug && g.category === category);
    if (guide) {
      const metaOverride = METADATA_MAPPING.guides[category]?.[guideSlug];
      return {
        title: metaOverride?.title || guide.title,
        description: metaOverride?.description || guide.description,
        alternates: { canonical: canonicalUrl },
      };
    }
  }

  if (slug.length === 0) {
    return {
      title: METADATA_MAPPING.base.title,
      description: METADATA_MAPPING.base.description,
      alternates: { canonical: canonicalUrl },
    };
  }

  const category = slug[0];
  const validCategories = ["wazwan", "bakery", "beverages", "street-food"];
  if (!validCategories.includes(category)) {
    return {};
  }

  if (slug.length === 1) {
    const meta = METADATA_MAPPING.categories[category];
    return {
      title: meta?.title,
      description: meta?.description,
      alternates: { canonical: canonicalUrl },
    };
  }

  if (slug.length === 2 && slug[1] === "guide") {
    const meta = METADATA_MAPPING.guides[category]?.base;
    return {
      title: meta?.title,
      description: meta?.description,
      alternates: { canonical: canonicalUrl },
    };
  }

  if (slug.length === 3 && slug[1] === "guide") {
    const guideSlug = slug[2];
    const meta = METADATA_MAPPING.guides[category]?.[guideSlug];
    return {
      title: meta?.title,
      description: meta?.description,
      alternates: { canonical: canonicalUrl },
    };
  }

  return {};
}

export default function Page({ params }) {
  const slug = params?.slug || [];
  
  if (slug.length === 0) {
    return <KashmiriFoodClient initialDishes={dishesData} activeTab={null} activeGuide={null} />;
  }
  
  const category = slug[0];
  const validCategories = ["wazwan", "bakery", "beverages", "street-food"];
  
  if (!validCategories.includes(category)) {
    notFound();
  }
  
  const activeTab = category === "street-food" ? "street_food" : category;
  
  if (slug.length === 1) {
    return <KashmiriFoodClient initialDishes={dishesData} activeTab={activeTab} activeGuide={null} />;
  }
  
  // Render Category Guide Index Page (e.g. /kashmiri-food/wazwan/guide)
  if (slug.length === 2) {
    if (slug[1] !== "guide") {
      notFound();
    }
    
    // Get all articles for this category
    const categoryArticles = wazwanGuides.filter((g) => g.category === category);
    
    // Formatted label
    const categoryLabels = {
      wazwan: "Kashmiri Wazwan",
      bakery: "Kashmiri Bakery",
      beverages: "Kashmiri Beverages",
      "street-food": "Kashmiri Street Food",
    };
    
    const label = categoryLabels[category] || "Kashmiri Culinary";
    
    return (
      <div className="min-h-screen pt-28 pb-32 px-4 sm:px-6 lg:px-8 flex flex-col items-center page-shell relative">
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none z-0" />
        <div className="w-full max-w-4xl relative z-10">
          <Link 
            href={`/kashmiri-food/${category}`} 
            className="inline-flex items-center gap-2 text-white/50 hover:text-[var(--saffron)] transition-colors mb-10 text-xs sm:text-sm uppercase tracking-wider font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to {label} Catalog
          </Link>
          
          <div className="mb-12">
            <span className="text-[var(--saffron)] font-bold tracking-[0.2em] uppercase text-[0.65rem] mb-3 block">
              Culinary Guides & Rituals
            </span>
            <h1 className="font-display text-3xl sm:text-5xl text-white mb-6">
              {label} Guidebook
            </h1>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-2xl">
              Deep dive articles detailing the preparation, traditions, etiquette, and secrets of {label} dining.
            </p>
          </div>
          
          {categoryArticles.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl border border-white/5 text-center my-12">
              <p className="text-white/40 text-sm mb-4">No articles published yet for this section.</p>
              <p className="text-white/30 text-xs">Articles are currently being prepared by the WazwanWay Team.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
              {categoryArticles.map((article) => (
                <Link key={article.slug} href={`/kashmiri-food/${category}/guide/${article.slug}`}>
                  <article className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 hover:border-[var(--saffron)]/30 hover:shadow-[0_12px_40px_rgba(212,175,55,0.06)] group transition-all duration-300 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[var(--saffron)] font-bold tracking-[0.15em] uppercase text-[0.6rem] bg-[var(--saffron)]/10 px-3 py-1 rounded-full border border-[var(--saffron)]/20">
                          Guide
                        </span>
                        <span className="flex items-center gap-1.5 text-white/40 text-[0.65rem] uppercase tracking-wider font-semibold">
                          <Clock className="w-3.5 h-3.5" /> {article.readTime}
                        </span>
                      </div>
                      <h3 className="font-display text-xl text-white mb-3 group-hover:text-[var(--saffron)] transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-white/50 text-xs sm:text-sm leading-relaxed mb-6 line-clamp-3">
                        {article.description}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                      <span className="text-[0.65rem] uppercase tracking-wider font-bold text-white/50 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[var(--saffron)]" /> {article.author}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--saffron)] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Read Guide &rarr;
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Render Individual Guide Article Page (e.g. /kashmiri-food/wazwan/guide/what-is-wazwan)
  if (slug.length === 3) {
    if (slug[1] !== "guide") {
      notFound();
    }
    
    const guideSlug = slug[2];
    const article = wazwanGuides.find((g) => g.slug === guideSlug && g.category === category);
    
    if (!article) {
      notFound();
    }
    
    return (
      <div className="min-h-screen pt-28 pb-32 px-4 sm:px-6 flex flex-col items-center page-shell relative">
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none z-0" />
        
        <article className="w-full max-w-3xl relative z-10">
          <Link 
            href={`/kashmiri-food/${category}/guide`} 
            className="inline-flex items-center gap-2 text-white/50 hover:text-[var(--saffron)] transition-colors mb-10 text-xs sm:text-sm uppercase tracking-wider font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Guide Index
          </Link>
          
          {/* Metadata headers */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6">
            <span className="text-[var(--saffron)] font-bold tracking-[0.15em] uppercase text-[0.65rem] bg-[var(--saffron)]/10 px-3 py-1.5 rounded-full border border-[var(--saffron)]/20">
              {category.replace("-", " ")} Guide
            </span>
            <span className="flex items-center gap-1.5 text-white/50 text-[0.7rem] uppercase tracking-wider font-semibold">
              <Clock className="w-3.5 h-3.5" /> {article.readTime}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl text-white mb-8 leading-[1.1] tracking-tight">
            {article.title}
          </h1>
          
          <div className="flex items-center gap-6 text-[0.7rem] uppercase tracking-wider font-bold text-white/60 mb-12 pb-8 border-b border-white/10">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--saffron)]" /> {article.author}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {article.date}
            </span>
          </div>
          
          {/* Main article content rendered as markdown */}
          <div className="max-w-none text-white/70 leading-relaxed font-body pb-16 wazwan-article-body">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="font-display text-3xl sm:text-4xl text-[var(--saffron)] mt-14 mb-6" {...props} />,
                h2: ({node, ...props}) => <h2 className="font-display text-2xl sm:text-3xl text-[var(--saffron)] mt-12 mb-6" {...props} />,
                h3: ({node, ...props}) => <h3 className="font-display text-xl sm:text-2xl text-white mt-10 mb-4" {...props} />,
                p: ({node, ...props}) => <p className="mb-6 text-sm sm:text-base md:text-lg leading-relaxed text-white/70" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 text-sm sm:text-base" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-sm sm:text-base" {...props} />,
                li: ({node, ...props}) => <li className="marker:text-[var(--saffron)] text-white/75" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                a: ({node, ...props}) => <a className="text-[var(--saffron)] hover:text-amber-400 underline decoration-white/20 underline-offset-4 font-semibold" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[var(--saffron)] pl-6 italic my-8 text-white/60 text-lg sm:text-xl" {...props} />
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    );
  }
  
  notFound();
}
