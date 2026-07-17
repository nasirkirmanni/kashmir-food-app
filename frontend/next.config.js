const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
        destination: '/kashmiri-food/wazwan',
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
      // Merged duplicate dish slugs (2026-07 catalog cleanup)
      {
        source: '/dishes/tsoek-wangangan',
        permanent: true,
        destination: '/dishes/tschok-wangan',
      },
      {
        source: '/dishes/rajma-t-gogji',
        permanent: true,
        destination: '/dishes/razma-goagji',
      },
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
      {
        source: '/dishes/syoon',
        permanent: true,
        destination: '/dishes/syun',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Dev-only origins must never ship in the production header
            value: (() => {
              const devOrigins =
                process.env.NODE_ENV === 'production' ? '' : ' http://localhost:5000 http://127.0.0.1:5000';
              return `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:${devOrigins} https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'${devOrigins} https://api.wazwanway.com https://kashmir-food-app-api.onrender.com https://*.tile.openstreetmap.org https://wttr.in; frame-ancestors 'none'`;
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
