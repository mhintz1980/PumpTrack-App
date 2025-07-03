
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ── existing options ─────────────────────────────
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
