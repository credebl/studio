const adminHeaders = [
  { key: 'Cache-Control', value: 'no-store, max-age=0' },
  { key: 'Pragma', value: 'no-cache' },
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
]

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
  // Next config helpers cannot express a TypeScript return type in a .js file.
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async headers() {
    return [
      {
        // The platform-admin console must never be cached or indexed.
        source: '/admin/:path*',
        headers: adminHeaders,
      },
      {
        // Keep the hardened set on the admin API as well: the route handler
        // sets no-store itself, but the rest are applied here too.
        source: '/api/admin/:path*',
        headers: adminHeaders,
      },
    ]
  },
}

module.exports = nextConfig
