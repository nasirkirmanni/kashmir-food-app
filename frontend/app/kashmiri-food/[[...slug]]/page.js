import { notFound } from "next/navigation";
import { Calendar, Clock, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import dynamic from "next/dynamic";
const KashmiriFoodClient = dynamic(() => import("../KashmiriFoodClient"), { ssr: true });
import GuidebookIndexClient from "../GuidebookIndexClient";
import AskWazaAIPrompt from "../AskWazaAIPrompt";
import dishesData from "@/data/dishes.json";
import { wazwanGuides } from "@/data/wazwanGuides";
import JsonLd from "@/components/JsonLd";
import { buildArticleSchema } from "@/components/JsonLd";
import { toMetaDescription } from "@/lib/metaText";
import { stripLeadingTitle } from "@/lib/markdownTitle";
import { guideCrumbName, guideRelatedMarkdown } from "@/lib/guideRelated";
import Breadcrumbs from "@/components/Breadcrumbs";

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
      description: "Explore the food traditions of Kashmir: the royal Wazwan feast of up to 36 courses, the kandur's fresh breads, street Tujji and saffron Kahwa.",
    },
    // Top-level categories
    categories: {
      wazwan: {
        title: "Kashmiri Wazwan Feast & Trami Sequence Guide",
        description: "Kashmir's Wazwan feast, which can run to 36 courses: the order the dishes are served in, copper Trami etiquette, and the classic dishes cooked by master Wazas.",
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
          title: "Wazwan Guides: Serving, History, Wazas & Cost",
          description: "Guides to the Wazwan feast: how it's served, where it comes from, the wazas who cook it, what it costs and what vegetarians can eat.",
        },
        "cost-guide": {
          title: "How Much Does Wazwan Cost? A Price Guide",
          description: "What does Wazwan cost in Srinagar? A breakdown of restaurant, wedding, and fine dining price ranges — and what's driving them.",
        },
        "vegetarian-wazwan": {
          title: "Vegetarian Wazwan: What to Expect & Order",
          description: "An honest guide to vegetarian dishes in Wazwan — what's traditionally included, what restaurants offer, and where Kashmiri vegetarian food is actually at its best.",
        },
        "restaurant-vs-wedding-vs-home": {
          title: "Wazwan: Restaurant vs Wedding vs Home",
          description: "The setting, the cook, the fuel, and the ingredients are genuinely different across these three versions of Wazwan. Here's what changes and why it matters.",
        },
        "rista-vs-gushtaba": {
          title: "Rista vs Gushtaba: Kashmir's Twin Meatballs",
          description: "Rista and gushtaba compared: the same hand-pounded mutton, two sizes, a red gravy and a white one, and where each comes in a Wazwan.",
        },
        "waza-meaning": {
          title: "What Does Waza Mean? The Cooks Behind Wazwan",
          description: "A waza is a professional Wazwan cook, led by a vasta waza. What the word means, how the teams work, where wazas come from and how the craft is passed on.",
        },
        "how-wazwan-is-served": {
          title: "How Wazwan Is Served: Trami, Serving Order, Etiquette",
          description: "How a Wazwan is served: the hand-washing, the shared copper trami, the serving order from the first dishes to gushtaba, and the manners at the trami.",
        },
        "wazwan-calories": {
          title: "How Many Calories Are in a Wazwan? Dish by Dish",
          description: "About 5,500 calories a guest in the one published count, a 2012 Srinagar wedding where a trami for four held 21,933 with rice. Dish by dish, with sources.",
        },
        "history-of-wazwan": {
          title: "History of Wazwan: Legends and Evidence",
          description: "Where Wazwan comes from: the Timur story the wazas tell, what the historical record shows, the earliest descriptions of Kashmiri feasts, and how the menu changed.",
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
    ...(meta?.description && { description: toMetaDescription(meta.description) }),
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
          description: toMetaDescription(metaOverride?.description || guide.description),
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
    return <KashmiriFoodClient initialDishes={dishesData} category={slug.length === 1 ? category : null} />;
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
              dateModified: article.updatedDate,
              category: `Kashmiri ${category.replace("-", " ")}`,
              path: `/kashmiri-food/${category}/guide/${article.slug}`,
              readTime: article.readTime,
            })}
          />
          {/* The visible trail and its BreadcrumbList schema, from one list. Wazwan guides sit
              under the main Wazwan page, as the guide index's own back link does. */}
          <div className="mb-10">
            <Breadcrumbs
              items={[
                { name: "Home", href: "/" },
                category === "wazwan"
                  ? { name: "Traditional Wazwan", href: "/dishes" }
                  : { name: "Kashmiri food", href: "/kashmiri-food" },
                { name: `${category === "wazwan" ? "Wazwan" : category.replace("-", " ")} guides`, href: `/kashmiri-food/${category}/guide` },
                { name: guideCrumbName(article.title), href: `/kashmiri-food/${category}/guide/${article.slug}` },
              ]}
            />
          </div>
          
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
            {article.updatedDate ? <span>Updated {article.updatedDate}</span> : null}
          </div>
          
          {/* Main article content rendered as markdown */}
          <div className="max-w-none text-white/70 leading-relaxed font-body pb-16 wazwan-article-body">
            <ReactMarkdown
              // Tables for the comparison guides. Single tildes stay literal ("~₹800" is not strikethrough).
              remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
              components={{
                // Any other top-level markdown heading renders as <h2>: the page has one <h1>.
                h1: ({node, ...props}) => <h2 className="font-display text-3xl sm:text-4xl text-[var(--saffron)] mt-14 mb-6" {...props} />,
                h2: ({node, ...props}) => <h2 className="font-display text-2xl sm:text-3xl text-[var(--saffron)] mt-12 mb-6" {...props} />,
                h3: ({node, ...props}) => <h3 className="font-display text-xl sm:text-2xl text-white mt-10 mb-4" {...props} />,
                p: ({node, ...props}) => <p className="mb-6 text-sm sm:text-base md:text-lg leading-relaxed text-white/70" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 text-sm sm:text-base" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-sm sm:text-base" {...props} />,
                li: ({node, ...props}) => <li className="marker:text-[var(--saffron)] text-white/75" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                a: ({node, ...props}) => <a className="text-[var(--saffron)] hover:text-amber-400 underline decoration-white/20 underline-offset-4 font-semibold" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[var(--saffron)] pl-6 italic my-8 text-white/60 text-lg sm:text-xl" {...props} />,
                table: ({node, ...props}) => (
                  <div className="mb-8 overflow-x-auto rounded-2xl border border-white/10">
                    <table className="w-full min-w-[20rem] border-collapse text-left text-[0.8rem] leading-snug sm:text-base sm:leading-normal" {...props} />
                  </div>
                ),
                th: ({node, ...props}) => <th className="border-b border-white/10 bg-white/5 px-2.5 py-2.5 sm:px-4 sm:py-3 align-bottom font-display text-base sm:text-lg font-medium text-[var(--saffron)]" {...props} />,
                td: ({node, ...props}) => <td className="border-b border-white/5 px-2.5 py-2.5 sm:px-4 sm:py-3 align-top text-white/75 first:font-semibold first:text-white" {...props} />,
              }}
            >
              {stripLeadingTitle(article.content, article.title) + guideRelatedMarkdown(article, wazwanGuides)}
            </ReactMarkdown>
            
            <AskWazaAIPrompt articleTitle={article.title} />
          </div>
        </article>
      </div>
    );
  }
  
  notFound();
}
