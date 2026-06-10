export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/profile", "/favorites", "/api/"],
      },
    ],
    sitemap: "https://wazwanway.com/sitemap.xml",
    host: "https://wazwanway.com",
  };
}
