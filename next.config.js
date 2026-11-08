/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained server bundle for the production image.
  output: 'standalone',
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: '',
      },
    ],
    domains: ['dev-org-logo.s3.ap-south-1.amazonaws.com'],
  },
  reactStrictMode: false,
  transpilePackages: ['geist'],
  async headers() {
    return [
      {
        // The platform-admin console must never be cached or indexed.
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
