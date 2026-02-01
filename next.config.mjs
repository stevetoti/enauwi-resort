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
  },
};

export default nextConfig;
