import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/lms",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
