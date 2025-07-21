import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 300000, // 5 minutes for complex generation tests
    hookTimeout: 60000,  // 1 minute for setup/teardown
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'lib/**',
        'package/**',
        'prisma/generated/**',
        'tests/coverage/**',
        '**/*.d.ts'
      ]
    }
  }
});