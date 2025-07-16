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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],  // Include all src files
      exclude: ['src/**/*.{test,spec}.{ts,tsx}', 'src/ai/dev.ts'],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 90,
      },
    },
  },
});
