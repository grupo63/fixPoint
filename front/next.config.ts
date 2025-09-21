import type { NextConfig } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined;
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

   async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_BASE}/:path*` },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },   // 🔑 agregado
      { protocol: "https", hostname: "tumayorferretero.net" }, // 🔑 agregado
    ],
  },
};

export default nextConfig;
