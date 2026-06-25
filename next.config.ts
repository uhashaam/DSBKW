import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  outputFileTracingIncludes: {
    '/**/*': [
      './scripts/data.json',
      './src/lib/settings.json',
      './.translate-cache.en.json'
    ],
  },
};

export default nextConfig;
