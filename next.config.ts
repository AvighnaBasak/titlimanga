import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@consumet/extensions', 'got-scraping'],
};

export default nextConfig;
