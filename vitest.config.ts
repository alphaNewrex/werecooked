import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  test: {
    include: ['lib/**/*.test.ts', 'server/**/*.test.ts', 'supabase/**/*.test.ts'],
    exclude: ['e2e/**'],
  },
});
