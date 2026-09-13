import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import dynamic from "next/dynamic";
const KashmiriFoodClient = dynamic(() => import("../KashmiriFoodClient"), { ssr: true });
import GuidebookIndexClient from "../GuidebookIndexClient";
import AskWazaAIPrompt from "../AskWazaAIPrompt";
import dishesData from "@/data/dishes.json";
import { wazwanGuides } from "@/data/wazwanGuides";
import JsonLd from "@/components/JsonLd";
import { buildArticleSchema, buildBreadcrumbSchema } from "@/components/JsonLd";

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
  
  // Guide article routes come from the same data that renders them, so we can
  // never prerender a guide URL that has no content (they used to 404).
  wazwanGuides.forEach((guide) => {
    paths.push({ slug: [guide.category, "guide", guide.slug] });
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

  // Titles carry no brand: the root layout's "%s | Wazwan Way" template adds it,
  // so each title stays within ~47 characters to keep the result under ~60.
  const METADATA_MAPPING = {
    // Base portal
    base: {
      title: "Kashmiri Food: Wazwan, Bakery & Street Food",
      description: "Explore the authentic culinary traditions of Kashmir. Discover the legendary 36-course royal Wazwan feast, hourly Kandur bakery culture, hot street Tujji, and saffron beverages.",
    },
    // Top-level categories
    categories: {
      wazwan: {
        title: "Kashmiri Wazwan Feast & Trami Sequence Guide",
        description: "Discover the authentic 36-course Kashmiri Wazwan feast. Learn about the traditional serve sequence, copper Trami etiquette, and classic dishes cooked by master Wazas.",
      },
      beverages: {
        title: "Kashmiri Drinks: Noon Chai, Kahwa & Babribyol",
        description: "Explore traditional Kashmiri drinks. Learn the difference between pink Noon Chai, saffron-infused Kahwa, Babribyol, and creamy Lassi.",
      },
      bakery: {
        title: "Kashmiri Bakery: Girda, Czot & Bakerkhani",
        description: "Step into the neighborhood Kandur-wan. Discover hourly baked Kashmiri breads like Girda for breakfast, sesame Czochworu, and flaky Bakerkhani.",
      },
      "street-food": {
        title: "Kashmiri Street Food: Tujji, Harissa & More",
        description: "Savor the rustic street foods of Srinagar's bazaars. From coal-grilled Tujji mutton skewers to winter Harissa pastes and crispy snacks.",
      },
    },
    // Guides
    guides: {
      wazwan: {
        base: {
          title: "Kashmiri Wazwan Dining & Culinary Guides",
          description: "Comprehensive guides to the traditional Wazwan feast. Understand the cooking methods, history, and sequence.",
        },
        "what-is-wazwan": {
          title: "What Is Wazwan? Kashmir's Legendary Feast",
          description: "Discover the origins, history, and cultural significance of the legendary 36-course Kashmiri Wazwan feast cooked by traditional Wazas.",
        },
        "dishes-explained": {
          title: "Wazwan Dishes Explained: The Saat Rang & Beyond",
          description: "A complete guide to the main dishes served in a traditional Trami, from Rista and Gustaba to Tabak Maaz and Lahabi Kebab.",
        },
        "cost-guide": {
          title: "How Much Does Wazwan Cost? A Price Guide",
          description: "What does Wazwan cost in Srinagar? A breakdown of restaurant, wedding, and fine dining price ranges — and what's driving them.",
        },
        "vegetarian-wazwan": {
          title: "Vegetarian Wazwan: What to Expect & Order",
          description: "A honest guide to vegetarian dishes in Wazwan — what's traditionally included, what restaurants offer, and where Kashmiri vegetarian food is actually at its best.",
        },
        etiquette: {
          title: "Wazwan Etiquette: Tash-t-Næær & Trami Rules",
          description: "Master the social dining etiquette of a Kashmiri Wazwan. Learn about sharing the Trami, washing hands, and traditional protocols.",
        },
        "restaurant-vs-wedding-vs-home": {
          title: "Wazwan: Restaurant vs Wedding vs Home",
          description: "The setting, the cook, the fuel, and the ingredients are genuinely different across these three versions of Wazwan. Here's what changes and why it matters.",
        },
        "kashmiri-wazwan-dishes": {
          title: "Kashmiri Wazwan Dishes: A Culinary Guide",
          description: "Explore the vast and flavorful world of Kashmiri Wazwan dishes, from the succulent Seekh Kebabs to the delicate Gushtaba.",
        },
        "rista-vs-gushtaba": {
          title: "Rista vs Gushtaba: Kashmir's Twin Meatballs",
          description: "Understand the distinct differences between Rista and Gushtaba, the two most iconic hand-pounded meatball dishes in a traditional Wazwan.",
        },
        "traditional-wazwan-menu": {
          title: "Traditional Wazwan Menu: A 36-Course Breakdown",
          description: "Explore the complete traditional Wazwan menu, from the opening starters to the final dessert and Kahwa.",
        },
        "kashmiri-wedding-food": {
          title: "Kashmiri Wedding Food: The Grandeur of Wazwan",
          description: "A deep dive into how food dictates the flow, scale, and prestige of a traditional Kashmiri wedding.",
        },
        "wazwan-culture": {
          title: "Wazwan Culture: The Social Fabric of Kashmir",
          description: "How the shared experience of Wazwan binds the Kashmiri community together, transcending just culinary boundaries.",
        },
        "waza-meaning": {
          title: "What Does Waza Mean? Kashmir's Master Chefs",
          description: "Explore the history, skills, and societal role of the Wazas, the master chefs who guard the secrets of Kashmiri Wazwan.",
        },
        "how-wazwan-is-served": {
          title: "How Wazwan Is Served: Sequence & Etiquette",
          description: "A detailed look at the highly structured and ritualistic sequence of serving a traditional Kashmiri Wazwan.",
        },
        "trami-in-kashmir": {
          title: "The Trami: The Sacred Platter of Kashmir",
          description: "Learn about the Trami, the large copper platter that sits at the center of the Wazwan experience and Kashmiri communal dining.",
        },
        "best-wazwan-dishes": {
          title: "Top 5 Best Wazwan Dishes You Must Try",
          description: "A curated list of the absolute best Wazwan dishes that every visitor to Kashmir must experience.",
        },
        "history-of-wazwan": {
          title: "History of Wazwan: From Timur to Modern Kashmir",
          description: "Trace the incredible journey of Wazwan from the courts of Timur in Samarkand to the grand weddings of modern Kashmir.",
        },
        "rista-deep-dive": {
          title: "Rista: Origins, Ingredients & Preparation",
          description: "A deep dive into Rista, the saffron-infused, hand-pounded meatball that forms the spicy heart of the Wazwan.",
        },
        "gushtaba-the-kings-dish": {
          title: "Gushtaba: The King's Dish and the Grand Finale",
          description: "Why Gushtaba is considered the absolute pinnacle of Kashmiri culinary artistry, and why it must always be served last.",
        },
        "rogan-josh-explained": {
          title: "Rogan Josh Explained: Authentic Ingredients",
          description: "Uncover the truth behind authentic Rogan Josh, a dish whose global fame has led to countless misconceptions about its true ingredients.",
        },
        "wazwan-vs-mughlai": {
          title: "Wazwan vs Mughlai Cuisine: Key Differences",
          description: "A detailed comparative analysis separating the unique traditions of Kashmiri Wazwan from the broader Mughlai cuisine of Northern India.",
        },
      },
      bakery: {
        base: {
          title: "Kashmiri Bakery & Bread Culture Guides",
          description: "Guides to the neighborhood Kandur-wan bakery tradition in Kashmir.",
        },
        "intro-to-bakery": {
          title: "Intro to Kashmiri Kandur-wan Bakery Culture",
          description: "Discover why Kashmiris never bake bread at home. Learn about the community wood-fired tandoor ovens and morning Kandur rituals.",
        },
        "types-of-bread": {
          title: "Kashmiri Breads Explained: Girda to Bakerkhani",
          description: "A glossary of all traditional Kashmiri breads including Girda, Czot, Czochworu, Bakerkhani, and Sheermal.",
        },
        "breakfast-guide": {
          title: "Kashmiri Breakfast: Breads, Chai & Pairings",
          description: "Start your day like a local in Kashmir. The ultimate guide to morning flatbreads, butter pairings, and hot pink Noon Chai.",
        },
      },
      beverages: {
        base: {
          title: "Kashmiri Beverages & Tea Brewing Guides",
          description: "Guides to authentic Kashmiri hot and cold drinks.",
        },
        "kahwa-explained": {
          title: "Kashmiri Kahwa: Ingredients, Benefits & Recipe",
          description: "Learn how to brew authentic green tea Kahwa with saffron, green cardamom, cinnamon, and crushed almonds.",
        },
        "noon-chai-explained": {
          title: "Kashmiri Noon Chai: The Pink Salt Tea Guide",
          description: "Discover the science and culture behind Kashmiri pink tea. Learn the ingredients, brewing method, and salty taste.",
        },
        "kahwa-vs-noon-chai": {
          title: "Kahwa vs. Noon Chai: Differences & Occasions",
          description: "Compare Kashmir's two iconic teas. Learn when to serve sweet saffron Kahwa versus salty pink Noon Chai.",
        },
      },
      "street-food": {
        base: {
          title: "Kashmiri Street Food & Bazaar Dining Guides",
          description: "Guides to the street foods and local bazaars of Kashmir.",
        },
        intro: {
          title: "Kashmiri Street Food Culture: An Introduction",
          description: "An introduction to the street food culture of Srinagar. Learn where to find the best local delicacies and snacks.",
        },
        "must-try-foods": {
          title: "10 Must-Try Kashmiri Street Foods",
          description: "The ultimate bucket list of Kashmiri street foods. Try coal-grilled Tujji skewers, crispy Monjji fritters, and Masala Lavas.",
        },
        "safety-tips": {
          title: "Srinagar Street Food Safety & Hygiene Guide",
          description: "Tips for enjoying Kashmiri street food safely. Learn how to select vendors and avoid common travel stomach issues.",
        },
      },
    },
  };

  // Self-canonical plus this page's og:url and the default share image. Next.js
  // fills og:title and og:description from the title and description.
  const pageMetadata = (meta, { ogType = "website", robots } = {}) => ({
    ...(meta?.title && { title: meta.title }),
    ...(meta?.description && { description: meta.description }),
    ...(robots && { robots }),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: ogType,
      url: canonicalUrl,
      siteName: "Wazwan Way",
      images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
    },
  });

  // Check if it matches a guide article
  if (slug.length === 3 && slug[1] === "guide") {
    const category = slug[0];
    const guideSlug = slug[2];
    const guide = wazwanGuides.find((g) => g.slug === guideSlug && g.category === category);
    if (guide) {
      const metaOverride = METADATA_MAPPING.guides[category]?.[guideSlug];
      return pageMetadata(
        {
          title: metaOverride?.title || guide.title,
          description: metaOverride?.description || guide.description,
        },
        { ogType: "article" }
      );
    }
  }

  if (slug.length === 0) {
    return pageMetadata(METADATA_MAPPING.base);
  }

  const category = slug[0];
  const validCategories = ["wazwan", "bakery", "beverages", "street-food"];
  if (!validCategories.includes(category)) {
    return {};
  }

  if (slug.length === 1) {
    return pageMetadata(METADATA_MAPPING.categories[category]);
  }

  if (slug.length === 2 && slug[1] === "guide") {
    // A category guide index with no articles renders an empty list, so it stays
    // out of the index until wazwanGuides has an article in that category.
    const hasArticles = wazwanGuides.some((g) => g.category === category);
    return pageMetadata(
      METADATA_MAPPING.guides[category]?.base,
      hasArticles ? {} : { robots: { index: false, follow: true } }
    );
  }

  if (slug.length === 3 && slug[1] === "guide") {
    const guideSlug = slug[2];
    return pageMetadata(METADATA_MAPPING.guides[category]?.[guideSlug]);
  }

  return {};
}

export default function Page({ params }) {
  const slug = params?.slug || [];
  const category = slug[0];
  const validCategories = ["wazwan", "bakery", "beverages", "street-food"];
  
  if (slug.length === 0 || slug.length === 1) {
    if (slug.length === 1 && !validCategories.includes(category)) {
      notFound();
    }
    const activeTab = slug.length === 1 ? (category === "street-food" ? "street_food" : category) : null;
    return <KashmiriFoodClient initialDishes={dishesData} />;
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
    
    return <GuidebookIndexClient categoryArticles={categoryArticles} label={label} category={category} />;
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
          <JsonLd
            data={buildArticleSchema({
              title: article.title,
              description: article.description || article.excerpt,
              author: article.author,
              datePublished: article.date,
              category: `Kashmiri ${category.replace("-", " ")}`,
              path: `/kashmiri-food/${category}/guide/${article.slug}`,
              readTime: article.readTime,
            })}
          />
          <JsonLd
            data={buildBreadcrumbSchema([
              { name: "Kashmiri Food", url: "https://wazwanway.com/kashmiri-food" },
              { name: `${category.replace("-", " ")} guide`, url: `https://wazwanway.com/kashmiri-food/${category}/guide` },
              { name: article.title, url: `https://wazwanway.com/kashmiri-food/${category}/guide/${article.slug}` },
            ])}
          />
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
              {(() => {
                const categoryArticles = wazwanGuides.filter((g) => g.category === category);
                const articleIndex = categoryArticles.findIndex((g) => g.slug === guideSlug);
                
                const relatedArticles = [];
                // Pick 4 deterministic related articles based on array position
                for (let i = 1; i <= 4; i++) {
                  const relIndex = (articleIndex + i) % categoryArticles.length;
                  if (categoryArticles[relIndex].slug !== guideSlug) {
                    relatedArticles.push(categoryArticles[relIndex]);
                  }
                }
                
                const relatedMarkdown = `\n\n## Related Articles\n\n` + relatedArticles.map(a => `- [${a.title}](/kashmiri-food/${category}/guide/${a.slug})`).join('\n');
                return article.content + relatedMarkdown;
              })()}
            </ReactMarkdown>
            
            <AskWazaAIPrompt articleTitle={article.title} />
          </div>
        </article>
      </div>
    );
  }
  
  notFound();
}
