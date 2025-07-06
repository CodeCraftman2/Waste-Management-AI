/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' to enable server-side API routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Enable experimental features for better API support
  serverExternalPackages: ['@google/generative-ai'],
};

module.exports = nextConfig;
