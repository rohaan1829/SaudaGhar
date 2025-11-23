/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    // Optimize images
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Enable React strict mode for better performance checks
  reactStrictMode: true,
  // Optimize production builds
  swcMinify: true,
  // Compress responses
  compress: true,
  // Experimental features for better performance
  // experimental: {
  //   optimizeCss: true, // Disabled due to critters dependency issue
  // },
}

module.exports = nextConfig

