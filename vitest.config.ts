import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // Exclude Playwright e2e tests from Vitest runner
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**', // 👈 Critical: Prevents Vitest from running Playwright tests
      '**/playwright-report/**',
      '**/.next/**',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
