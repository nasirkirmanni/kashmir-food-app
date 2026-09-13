import { resolveContentImage, resolveContentPhoto } from "@/lib/contentImages";

/**
 * JsonLd — injects JSON-LD structured data into the page <head>
 * Usage: <JsonLd data={schemaObject} />
 */
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── Schema builders ──────────────────────────────────────────────────────────

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Wazwan Way",
    url: "https://wazwanway.com",
    description:
      "Your premium guide to Kashmir's royal culinary heritage — authentic dishes, restaurants, recipes, and culture.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://wazwanway.com/dishes?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Wazwan Way",
    url: "https://wazwanway.com",
    logo: "https://wazwanway.com/icon.png",
    // The brand profiles linked from the site's own footer (components/Footer.js).
    sameAs: ["https://www.facebook.com/profile.php?id=61590712421415", "https://x.com/wazwanway"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: ["English", "Urdu"],
    },
  };
}

export function buildRestaurantSchema(restaurant) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    description: restaurant.description || `${restaurant.name} — authentic Kashmiri restaurant`,
    url: `https://wazwanway.com/restaurants/${restaurant.slug || restaurant._id}`,
    image: absoluteUrl(resolveContentImage(restaurant.image)),
    servesCuisine: "Kashmiri",
    ...(priceRangeFor(restaurant.priceLevel) && { priceRange: priceRangeFor(restaurant.priceLevel) }),
    address: {
      "@type": "PostalAddress",
      addressLocality: restaurant.city || "Kashmir",
      addressRegion: "Jammu & Kashmir",
      addressCountry: "IN",
      streetAddress: restaurant.location || "",
    },
    // Only claim an aggregate rating when real review counts exist
    ...(restaurant.rating &&
      restaurant.reviewCount > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: restaurant.rating,
          bestRating: 5,
          worstRating: 1,
          ratingCount: restaurant.reviewCount,
        },
      }),
    ...(restaurant.phoneNumber && { telephone: restaurant.phoneNumber }),
    ...(restaurant.website && {
      sameAs: restaurant.website.startsWith("http")
        ? restaurant.website
        : `https://${restaurant.website}`,
    }),
  };
}

// Same ₹ scale the restaurants page shows for each stored price level.
function priceRangeFor(priceLevel) {
  if (!priceLevel) return undefined;
  if (priceLevel === "Luxury" || priceLevel === "Fine Dining") return "₹₹₹₹";
  if (priceLevel === "Mid-range") return "₹₹₹";
  return "₹₹";
}

function absoluteUrl(url) {
  if (!url) return "https://wazwanway.com/wazwan-hero.jpg";
  return url.startsWith("http") ? url : `https://wazwanway.com${url.startsWith("/") ? "" : "/"}${url}`;
}

function isoDate(value) {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

function isoMinutes(mins) {
  const n = Array.isArray(mins) ? mins[1] : mins;
  return Number.isFinite(n) && n > 0 ? `PT${Math.round(n)}M` : undefined;
}

export function buildRecipeSchema(dish) {
  const r = dish.recipe || {};
  const prep = isoMinutes(r.prepTimeMinutes);
  const cook = isoMinutes(r.cookTimeMinutes);
  const total =
    Number.isFinite(r.prepTimeMinutes) && Number.isFinite(r.cookTimeMinutes)
      ? isoMinutes(r.prepTimeMinutes + r.cookTimeMinutes)
      : undefined;
  const ingredients = r.ingredients?.length ? r.ingredients : dish.ingredients;
  const instructions = r.instructions?.length ? r.instructions : dish.instructions;
  // Only a real photo of the dish belongs in `image` — never a placeholder.
  const photo = resolveContentPhoto(dish.image);
  // Real record timestamps: when the dish was published, and when its recipe was
  // last reviewed (or the record last updated).
  const datePublished = isoDate(dish.createdAt);
  const dateModified = isoDate(r.reviewedAt || dish.updatedAt);

  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: dish.name,
    description: r.intro || dish.description || `Traditional Kashmiri ${dish.category}`,
    ...(photo && { image: absoluteUrl(photo) }),
    author: { "@type": "Organization", name: "Wazwan Way", url: "https://wazwanway.com" },
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    recipeCategory: dish.category || "Kashmiri Cuisine",
    recipeCuisine: "Kashmiri",
    keywords: `${dish.name}, Kashmiri food, Wazwan, ${dish.category}`,
    url: `https://wazwanway.com/dishes/${dish.slug || dish._id}`,
    ...(prep && { prepTime: prep }),
    ...(cook && { cookTime: cook }),
    ...(total && { totalTime: total }),
    ...(r.servings && { recipeYield: String(r.servings) }),
    // Google-required for Recipe rich results — emitted as soon as the dish
    // record carries authored recipe data.
    ...(Array.isArray(ingredients) &&
      ingredients.length > 0 && { recipeIngredient: ingredients }),
    ...(Array.isArray(instructions) &&
      instructions.length > 0 && {
        recipeInstructions: instructions.map((step, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          text: typeof step === "string" ? step : step.text,
        })),
      }),
  };
}

export function buildBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildFaqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildArticleSchema(article) {
  const baseUrl = "https://wazwanway.com";
  const articleUrl = article.url || `${baseUrl}${article.path || ''}`;
  const imageUrl = absoluteUrl(article.image);
  const authorName = article.author || "Wazwan Way Team";
  // Dates come only from the content itself — never the build date.
  const datePublished = isoDate(article.datePublished || article.date);
  const dateModified = isoDate(article.dateModified || article.updatedDate) || datePublished;
  // Team bylines are the publisher; named bylines are people. There are no author
  // profile pages on the site, so no author URL is claimed.
  const isTeamByline = /\bteam\b/i.test(authorName) || /^wazwan\s?way$/i.test(authorName);
  const author = isTeamByline
    ? { "@type": "Organization", name: "Wazwan Way", url: baseUrl }
    : { "@type": "Person", name: authorName };
  const description = article.description || article.excerpt;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title || article.name,
    ...(description && { description }),
    image: imageUrl,
    author,
    publisher: {
      "@type": "Organization",
      name: "Wazwan Way",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icon.png`
      }
    },
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl
    },
    articleSection: article.category || article.section || "Kashmiri Cuisine",
    ...(article.keywords && { keywords: article.keywords }),
    ...(article.readTime && { timeRequired: article.readTime })
  };
}

export function buildReviewSchema(review, restaurant) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Restaurant",
      name: restaurant.name,
      url: `https://wazwanway.com/restaurants/${restaurant.slug || restaurant._id}`
    },
    author: {
      "@type": "Person",
      name: review.user?.name || review.author || "Anonymous"
    },
    datePublished: review.createdAt || review.date || new Date().toISOString(),
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1
    },
    reviewBody: review.comment || review.text || ""
  };
}

// Expects a destination already passed through sanitizeDestination()
// (lib/destinationContent.js), so generated placeholder text never reaches it.
export function buildDestinationSchema(destination) {
  const photo = resolveContentPhoto(destination.image);
  const attractions = (destination.attractions || []).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: destination.name,
    ...(destination.description && { description: destination.description }),
    ...(photo && { image: absoluteUrl(photo) }),
    url: `https://wazwanway.com/destinations/${destination.slug || destination._id}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: destination.location || destination.city || "Kashmir",
      addressRegion: "Jammu & Kashmir",
      addressCountry: "IN"
    },
    ...(attractions.length > 0 && {
      includesAttraction: attractions.map((name) => ({ "@type": "TouristAttraction", name })),
    }),
  };
}

// FAQ derived strictly from authored dish fields — never invented answers.
export function buildDishFaqSchema(dish) {
  const faqs = [];
  if (dish.description || dish.fullDescription) {
    faqs.push({
      question: `What is ${dish.name}?`,
      answer: [dish.description, dish.fullDescription].filter(Boolean).join(" "),
    });
  }
  if (dish.recipe?.intro) {
    faqs.push({ question: `How is ${dish.name} made?`, answer: dish.recipe.intro });
  }
  if (dish.touristTip) {
    faqs.push({ question: `Where can you try ${dish.name} in Kashmir?`, answer: dish.touristTip });
  }
  if (dish.recipe?.significance) {
    faqs.push({
      question: `What is the significance of ${dish.name} in Kashmiri cuisine?`,
      answer: dish.recipe.significance,
    });
  }
  return faqs.length >= 2 ? buildFaqSchema(faqs) : null;
}

export function buildSlugItemListSchema(basePath, slugs, listName) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: slugs.length,
    itemListElement: slugs.map((slug, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://wazwanway.com${basePath}/${slug}`,
    })),
  };
}

export function buildItemListSchema(items, listName) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": item.type || "Thing",
        name: item.name,
        url: item.url,
        ...(item.image && { image: item.image }),
        ...(item.description && { description: item.description })
      }
    }))
  };
}
