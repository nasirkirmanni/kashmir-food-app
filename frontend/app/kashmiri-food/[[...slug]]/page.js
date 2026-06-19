import { notFound } from "next/navigation";
import KashmiriFoodClient from "../KashmiriFoodClient";
import dishesData from "@/data/dishes.json";

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
          title: "What is Wazwan? History of Kashmir's Royal Feast | WazwanWay",
          description: "Learn the origins, history, and cultural significance of the legendary 36-course Kashmiri Wazwan feast cooked by traditional Wazas.",
        },
        "dishes-explained": {
          title: "Wazwan Dishes Explained: The 16 Main Courses | WazwanWay",
          description: "A complete guide to the main dishes served in a traditional Trami, from Rista and Gustaba to Tabak Maaz and Lahabi Kebab.",
        },
        "cost-guide": {
          title: "Kashmiri Wazwan Cost & Catering Planning Guide | WazwanWay",
          description: "How much does a traditional wedding Wazwan cost? Estimate prices per Trami and planning tips for Kashmiri catering.",
        },
        "vegetarian-wazwan": {
          title: "Vegetarian Wazwan: Menu, Dishes & Alternatives | WazwanWay",
          description: "Can you have a vegetarian Wazwan? Explore the delicious vegetarian dishes like Ruwangan Chaman and Dum Aloo served in Kashmir.",
        },
        etiquette: {
          title: "Wazwan Dining Etiquette: Tash-t-Næær & Trami Rules | WazwanWay",
          description: "Master the social dining etiquette of a Kashmiri Wazwan. Learn about sharing the Trami, washing hands, and traditional protocols.",
        },
        "restaurant-vs-wedding-vs-home": {
          title: "Restaurant vs. Wedding vs. Home Wazwan | WazwanWay",
          description: "Compare the dining experience of commercial restaurant Wazwan, massive wedding feasts, and home-cooked Kashmiri food.",
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
  
  // Map street-food slug to street_food internal id
  const activeTab = category === "street-food" ? "street_food" : category;
  
  if (slug.length === 1) {
    return <KashmiriFoodClient initialDishes={dishesData} activeTab={activeTab} activeGuide={null} />;
  }
  
  if (slug.length === 2) {
    if (slug[1] !== "guide") {
      notFound();
    }
    return <KashmiriFoodClient initialDishes={dishesData} activeTab={activeTab} activeGuide="index" />;
  }
  
  if (slug.length === 3) {
    if (slug[1] !== "guide") {
      notFound();
    }
    
    // Validate guide slug
    const guideSlug = slug[2];
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
    
    const validGuides = categoryGuides[category] || [];
    if (!validGuides.includes(guideSlug)) {
      notFound();
    }
    
    return <KashmiriFoodClient initialDishes={dishesData} activeTab={activeTab} activeGuide={guideSlug} />;
  }
  
  notFound();
}
