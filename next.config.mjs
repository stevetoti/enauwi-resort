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
    // Optimize image loading
    minimumCacheTTL: 60,
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
