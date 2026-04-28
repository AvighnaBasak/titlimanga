import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 's4.anilist.co' },
      { protocol: 'https', hostname: 'img.anili.st' },
      { protocol: 'https', hostname: 'uploads.mangadex.org' },
      { protocol: 'https', hostname: 'mangadex.org' },
      { protocol: 'https', hostname: 'cmdxd98sb0x3yprd.mangadex.network' },
    ],
    localPatterns: [
      {
        pathname: '/api/proxy',
        search: '?url=**',
      },
    ],
  },
};

export default nextConfig;
