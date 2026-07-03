import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/lms",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
