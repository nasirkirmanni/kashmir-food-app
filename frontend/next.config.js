const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
// Pages merged into a stronger page on the same topic (2026-10 consolidation). Each old
// address answers with a permanent redirect; lib/seoRedirects.test.js keeps links and the
// sitemap off them.
const seoRedirects = require('./seo-redirects.json');

// Google Analytics 4 (components/Analytics.js, lib/consent.js). SITE_GA_MEASUREMENT_ID is the live
// site's own measurement ID ("G-XXXXXXXXXX"); while it is empty the site has no analytics, no cookie
// panel and no "Cookie settings" links. It applies only to the production deployment on Vercel, so
// previews and builds on a laptop never send visits to the real property. Setting the environment
// variable NEXT_PUBLIC_GA_MEASUREMENT_ID overrides it anywhere, which is how the tests run.
const SITE_GA_MEASUREMENT_ID = '';
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? (process.env.VERCEL_ENV === 'production' ? SITE_GA_MEASUREMENT_ID : '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // What lib/consent.js reads, in the browser and on the server alike.
  env: { NEXT_PUBLIC_GA_MEASUREMENT_ID: GA_MEASUREMENT_ID },
  async redirects() {
    return [
      // Itinerary Builder absorbs the old /custom-trip flow (permanent 308).
      // The old page's code is left intact per the migration plan; this just
      // repoints the URL so bookmarks/links keep working.
      {
        source: '/custom-trip',
        permanent: true,
        destination: '/itinerary-builder',
      },
      {
        source: '/kashmiri-food',
        has: [
          {
            type: 'query',
            key: 'tab',
            value: 'wazwan',
          },
        ],
        permanent: true,
        destination: '/dishes',
      },
      {
        source: '/kashmiri-food',
        has: [
          {
            type: 'query',
            key: 'tab',
            value: 'bakery',
          },
        ],
        permanent: true,
        destination: '/kashmiri-food/bakery',
      },
      {
        source: '/kashmiri-food',
        has: [
          {
            type: 'query',
            key: 'tab',
            value: 'beverages',
          },
        ],
        permanent: true,
        destination: '/kashmiri-food/beverages',
      },
      {
        source: '/kashmiri-food',
        has: [
          {
            type: 'query',
            key: 'tab',
            value: 'street_food',
          },
        ],
        permanent: true,
        destination: '/kashmiri-food/street-food',
      },
      // Merged duplicate dish slugs (2026-07 catalog cleanup). Only redirects whose
      // destination is still a live dish belong here: tsoek-wangangan, rajma-t-gogji
      // and syoon pointed at dishes that were later removed from the catalogue, so
      // those old URLs now return a plain 404 instead of redirecting to one.
      {
        source: '/dishes/wazwaan-mushroom',
        permanent: true,
        destination: '/dishes/wazwan-mushroom-guchhi-yakhni',
      },
      {
        source: '/dishes/kabab',
        permanent: true,
        destination: '/dishes/seekh-kebab',
      },
      // Third-party agency pages removed on 15 Oct 2026: Visit Kashmir now leads to Still Kashmir,
      // Wazwan Way's own travel agency (lib/stillKashmir.js). These two carry an id, so they can't
      // go in seo-redirects.json; the agency pages with fixed addresses are listed there.
      {
        source: '/tour-partner/:id',
        permanent: true,
        destination: '/still-kashmir',
      },
      {
        source: '/my-itineraries/:id/book',
        permanent: true,
        destination: '/still-kashmir',
      },
      // Accounts removed in November 2026: a saved itinerary was a page of its owner's account. The
      // builder now shows a plan without one. (The account pages with fixed addresses are in
      // seo-redirects.json.)
      {
        source: '/my-itineraries/:id',
        permanent: true,
        destination: '/itinerary-builder',
      },
      ...seoRedirects.map(({ source, destination }) => ({ source, destination, permanent: true })),
    ];
  },
  async headers() {
    return [
      // Only wazwanway.com should be indexed. The same deployment is also reachable
      // at kashmir-food-app.vercel.app and at preview URLs; those hosts send noindex
      // so they can't compete with (or duplicate) the production domain.
      {
        source: '/:path*',
        missing: [{ type: 'host', value: '(www\\.)?wazwanway\\.com' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
      // /llms-full.txt repeats the full text of every Journal post and Wazwan guide for language
      // models. Search should send readers to the articles, not to this copy, so it asks not to be
      // indexed. robots.txt leaves it crawlable: the header has to be fetched to be seen.
      {
        source: '/llms-full.txt',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Dev-only origins must never ship in the production header
            value: (() => {
              const devOrigins =
                process.env.NODE_ENV === 'production' ? '' : ' http://localhost:5000 http://127.0.0.1:5000';
              // Google Analytics (components/Analytics.js) is loaded only after a visitor accepts, and
              // only when the site has a measurement ID; without one this header is unchanged. With
              // one it allows the tag script from googletagmanager.com and the measurement requests
              // to google-analytics.com. The tag also tries to send a copy of each hit to
              // www.google.com/g/collect; that stays refused on purpose.
              const analytics = Boolean(GA_MEASUREMENT_ID);
              const tagScript = analytics ? ' https://www.googletagmanager.com' : '';
              const tagRequests = analytics
                ? ' https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com'
                : '';
              return `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'${tagScript}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:${devOrigins} https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'${devOrigins} https://api.wazwanway.com https://kashmir-food-app-api.onrender.com https://*.tile.openstreetmap.org https://wttr.in${tagRequests}; frame-ancestors 'none'`;
            })(),
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async rewrites() {
    // API proxying is handled by app/api/proxy/[...path]/route.js (serverless function).
    // Edge rewrites were removed because they strip Set-Cookie headers from upstream
    // responses, which broke CSRF cookies on iOS (ITP).
    // Local dev still works because resolveApiUrl() returns the direct backend URL
    // outside of browser contexts, and the proxy route also works locally.
    return [];
  },
  // NOTE: output: 'export' is only for Capacitor/Android builds.
  // DO NOT enable this for Vercel — it breaks server-side features and API routes.
  // To deploy to Android: uncomment this, run npm run build + npx cap sync, then recomment.
  // output: 'export',
  images: {
    // Only disable optimization for Capacitor static export builds
    // For Vercel: images are auto-optimized (resized, converted to WebP/AVIF, edge-cached)
    unoptimized: process.env.CAPACITOR_BUILD === 'true',
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'img1.wsimg.com',
      },
      {
        protocol: 'https',
        hostname: 'api.wazwanway.com',
      },
      {
        protocol: 'https',
        hostname: 'kashmir-food-app-api.onrender.com',
      },
      {
        protocol: 'https',
        hostname: '**.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'media-cdn.tripadvisor.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  experimental: {
    optimizeCss: true,
  },
};

module.exports = withBundleAnalyzer(nextConfig);
