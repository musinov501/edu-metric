import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@edumetric/shared'],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  typedRoutes: true,
  outputFileTracingRoot: __dirname + '/../..',
};

export default nextConfig;
