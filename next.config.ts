import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Vercel deployment works smoothly
  serverExternalPackages: ["firebase-admin"],
  
  // Optimize for production
  poweredByHeader: false,
  
  // Allow image domains if needed
  images: {
    unoptimized: false,
  },
};

export default nextConfig;
