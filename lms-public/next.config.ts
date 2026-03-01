import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from your API origin if you serve images from admin
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**", pathname: "/**" },
      { protocol: "http", hostname: "**", pathname: "/**" },
    ],
  },
};

export default nextConfig;
