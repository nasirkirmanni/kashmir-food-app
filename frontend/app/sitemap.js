import fs from "fs";
import path from "path";

const BASE_URL = "https://wazwanway.com";

function loadSlugs(filename) {
  try {
    const jsonPath = path.join(process.cwd(), filename);
    if (fs.existsSync(jsonPath)) {
      return JSON.parse(fs.readFileSync(jsonPath, "utf-8")).map((item) => item.slug || item.id);
    }
  } catch {}
  return [];
}

export default function sitemap() {
  const dishSlugs = loadSlugs("dishes-static-ids.json");
  const restaurantSlugs = loadSlugs("restaurants-static-ids.json");

  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/dishes`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/restaurants`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/recipes`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/history`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/waza-ai`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/list-restaurant`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/signup`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const dishPages = dishSlugs.map((slug) => ({
    url: `${BASE_URL}/dishes/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const restaurantPages = restaurantSlugs.map((slug) => ({
    url: `${BASE_URL}/restaurants/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...dishPages, ...restaurantPages];
}
