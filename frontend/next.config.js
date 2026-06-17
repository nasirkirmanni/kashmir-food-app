const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // NOTE: output: 'export' is only for Capacitor/Android builds.
  // DO NOT enable this for Vercel — it breaks server-side features and API routes.
  // To deploy to Android: uncomment this, run npm run build + npx cap sync, then recomment.
  // output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img1.wsimg.com',
      },
    ],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
