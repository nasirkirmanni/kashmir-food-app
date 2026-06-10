/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img1.wsimg.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/saved',
        destination: '/favorites',
        permanent: true,
      },
      {
        source: '/saved-dishes',
        destination: '/favorites',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
