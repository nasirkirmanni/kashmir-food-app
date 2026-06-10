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
    sameAs: [],
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
    url: `https://wazwanway.com/restaurants/${restaurant._id}`,
    image: restaurant.image || "https://wazwanway.com/wazwan-hero.jpg",
    servesCuisine: "Kashmiri",
    priceRange: restaurant.priceLevel || "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: restaurant.city || "Kashmir",
      addressRegion: "Jammu & Kashmir",
      addressCountry: "IN",
      streetAddress: restaurant.location || "",
    },
    ...(restaurant.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: restaurant.rating,
        bestRating: 5,
        worstRating: 1,
        ratingCount: restaurant.reviewCount || 1,
      },
    }),
    ...(restaurant.phoneNumber && { telephone: restaurant.phoneNumber }),
    ...(restaurant.website && { sameAs: restaurant.website }),
  };
}

export function buildRecipeSchema(dish) {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: dish.name,
    description: dish.description || `Traditional Kashmiri ${dish.category}`,
    image: dish.image || "https://wazwanway.com/wazwan-hero.jpg",
    author: { "@type": "Organization", name: "Wazwan Way" },
    recipeCategory: dish.category || "Kashmiri Cuisine",
    recipeCuisine: "Kashmiri",
    keywords: `${dish.name}, Kashmiri food, Wazwan, ${dish.category}`,
    url: `https://wazwanway.com/dishes/${dish._id}`,
    ...(dish.prepTime && { prepTime: dish.prepTime }),
    ...(dish.cookTime && { cookTime: dish.cookTime }),
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
