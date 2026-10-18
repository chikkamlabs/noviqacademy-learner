
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/**",
      },
    ],
  },

  output: "standalone",

  transpilePackages: ["motion"],

  async rewrites() {
    return [
      {
        source: "/course",
        destination: "/courses/opencourse",
      },
      {
        source: "/learner/explorecourse",
        destination: "/courses/opencourse",
      },
    ];
  },
};

export default nextConfig;
