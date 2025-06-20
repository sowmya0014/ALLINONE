// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: '', // Add your Google Maps API key here
    BACKEND_URL: 'http://localhost:5000',
  },
};

module.exports = withPWA(nextConfig); 