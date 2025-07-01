
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ── existing options ─────────────────────────────
  // Server starts successfully, no configuration errors noted in recent logs.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
