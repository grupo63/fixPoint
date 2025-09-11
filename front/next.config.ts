
// export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: "http://localhost:3001/:path*" },

    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
            { protocol: "https", hostname: "images.unsplash.com" }, 
    ],
  },
};

export default nextConfig;
