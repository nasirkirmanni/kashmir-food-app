import fs from "fs";
import path from "path";

const BASE_URL = "https://wazwanway.com";

function loadIds(filename) {
  try {
    const jsonPath = path.join(process.cwd(), filename);
    if (fs.existsSync(jsonPath)) {
      return JSON.parse(fs.readFileSync(jsonPath, "utf-8")).map((item) => item.id);
    }
  } catch {}
  return [];
}

export default function sitemap() {
  const dishIds = loadIds("dishes-static-ids.json");
  const restaurantIds = loadIds("restaurants-static-ids.json");

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

  const dishPages = dishIds.map((id) => ({
    url: `${BASE_URL}/dishes/${id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const restaurantPages = restaurantIds.map((id) => ({
    url: `${BASE_URL}/restaurants/${id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...dishPages, ...restaurantPages];
}
