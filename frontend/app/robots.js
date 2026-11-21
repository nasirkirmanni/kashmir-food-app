export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: "https://wazwanway.com/sitemap.xml",
    host: "https://wazwanway.com",
  };
}
