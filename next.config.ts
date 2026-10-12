import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'framer-motion',
      'canvas-confetti',
      'jose',
      'bcryptjs',
    ],
  },
};

export default nextConfig;
