/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'jfiqbifwueoyqtajbhed.supabase.co',
        pathname: '/storage/**',
      },
    ],
    minimumCacheTTL: 60,
  },
  // The old per-activity pages were replaced by the resort's own tour schedule
  // (Nov 2026) — send old links and search results to the schedule page.
  async redirects() {
    return [{ source: '/activities/:slug', destination: '/activities', permanent: true }];
  },
  // Enable experimental features for faster builds
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Optimize production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
};

export default nextConfig;
