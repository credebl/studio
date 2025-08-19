/** @type {import('next').NextConfig} */
const nextConfig = {
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
}

module.exports = nextConfig
