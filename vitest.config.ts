/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { join } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),   // 👈 make Vitest resolve '@/'
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    passWithNoTests: true,                   // ← lets empty suites exit 0
    include: [
      '__tests__/**/*.{test,spec}.{ts,tsx,js,jsx}',
      'src/**/*.{test,spec}.{ts,tsx,js,jsx}',
    ],

    // 👉 Ignore everything else
    exclude: [
      '**/node_modules/**',   // regular deps
      '**/.pnpm/**',          // pnpm store _inside_ node_modules
      '**/dist/**',
      '**/cypress/**',
      '**/__legacy_tests__/**',
    ],
    coverage: { // Added comma here
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {          // ✅ plural
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 90,
    },
  },
  },
}); // Added closing brace for test object
