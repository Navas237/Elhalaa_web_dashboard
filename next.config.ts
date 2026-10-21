import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    // Tree-shake large icon/component barrels so only used modules ship.
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  images: {
    // Avatar URLs come from Supabase Storage or OAuth providers.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
