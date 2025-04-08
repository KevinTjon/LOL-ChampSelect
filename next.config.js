/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable API routes
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig 