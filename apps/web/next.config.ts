import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@bluechain/shared"],
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
