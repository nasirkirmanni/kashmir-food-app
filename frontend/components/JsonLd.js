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
    url: `https://wazwanway.com/restaurants/${restaurant.slug || restaurant._id}`,
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
    url: `https://wazwanway.com/dishes/${dish.slug || dish._id}`,
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

export function buildArticleSchema(article) {
  const baseUrl = "https://wazwanway.com";
  const articleUrl = article.url || `${baseUrl}${article.path || ''}`;
  const imageUrl = article.image || `${baseUrl}/wazwan-hero.jpg`;
  const authorName = article.author || "Wazwan Way Team";
  const datePublished = article.datePublished || article.date || new Date().toISOString();
  const dateModified = article.dateModified || article.updatedDate || datePublished;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title || article.name,
    description: article.description || article.excerpt || "",
    image: imageUrl,
    author: {
      "@type": "Person",
      name: authorName,
      url: `${baseUrl}/author/${authorName.toLowerCase().replace(/\s+/g, '-')}`
    },
    publisher: {
      "@type": "Organization",
      name: "Wazwan Way",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icon.png`
      }
    },
    datePublished,
    dateModified,
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

export function buildDestinationSchema(destination) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: destination.name,
    description: destination.description || `Explore ${destination.name} in Kashmir`,
    image: destination.image || "https://wazwanway.com/wazwan-hero.jpg",
    url: `https://wazwanway.com/destinations/${destination.slug || destination._id}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: destination.location || destination.city || "Kashmir",
      addressRegion: "Jammu & Kashmir",
      addressCountry: "IN"
    },
    ...(destination.bestTimeToVisit && {
      availableSeason: destination.bestTimeToVisit
    }),
    ...(destination.attractions && {
      touristType: destination.attractions.join(", ")
    }),
    ...(destination.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: destination.rating,
        bestRating: 5,
        worstRating: 1
      }
    })
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
