/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.rightmove.co.uk',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },

  async rewrites() {
    const backend =
      process.env.NEXT_PUBLIC_SCRAPER_API_BASE_URL ||
      'http://localhost:8001/api';

    return [
      {
        source: '/api/images/:path*',
        destination: `${backend}/images/:path*`,
      },
      {
        source: '/api/properties',
        destination: `${backend}/properties`,
      },
      {
        source: '/api/health',
        destination: `${backend}/health`,
      },
    ];
  },
};

module.exports = nextConfig;
