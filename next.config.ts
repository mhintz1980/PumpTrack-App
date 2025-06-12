import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ── existing options ─────────────────────────────
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

  // ── NEW: allow Firebase Studio / Cloud Workstations preview URLs ──
  experimental: {
    allowedDevOrigins: [
      'https://*.cloudworkstations.dev', // wildcard is easiest
      // If wildcards don’t work in your env, paste the full origin:
      // 'https://9003-firebase-studio-XXXX.cluster-YYYY.cloudworkstations.dev'
    ],
  },
}

export default nextConfig
