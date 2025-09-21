import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  async rewrites() {
    return [
      { source: "/api/:path*", destination: "http://localhost:3001/:path*" },
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
