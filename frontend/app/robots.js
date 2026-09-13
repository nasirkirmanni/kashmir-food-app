export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /profile and /favorites are not blocked here: they carry a noindex robots
        // meta tag, which crawlers can only see if they're allowed to fetch the page.
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: "https://wazwanway.com/sitemap.xml",
    host: "https://wazwanway.com",
  };
}
