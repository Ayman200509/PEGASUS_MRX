import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pegasus1337.store',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
  },
  output: "standalone",
  // Ensure we can serve static files from public folder
  // Ensure we can serve static files from public folder
};

export default nextConfig;
