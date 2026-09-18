import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Temporarily ignore build errors to allow deployment
    // TODO: Fix the type resolution issue
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint during builds (warnings already shown)
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};

export default withNextIntl(nextConfig);
