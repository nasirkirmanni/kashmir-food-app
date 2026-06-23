const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
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
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http://localhost:5000 http://127.0.0.1:5000 https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' http://localhost:5000 http://127.0.0.1:5000 https://kashmir-food-app-api.onrender.com https://*.tile.openstreetmap.org; frame-ancestors 'none'",
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
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*"
      }
    ];
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
        hostname: 'img1.wsimg.com',
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
    ],
  },
  experimental: {
    optimizeCss: true,
  },
};

module.exports = withBundleAnalyzer(nextConfig);
