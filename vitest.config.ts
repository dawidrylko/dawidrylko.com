import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Unit tests cover the framework-agnostic logic in src/lib and the zero-dep CI
// scripts in scripts/. `astro:content` is a virtual module that only exists
// during an Astro build, so it is aliased to a lightweight stub for the few
// helpers that consume it (see test/mocks).
export default defineConfig({
  resolve: {
    alias: {
      'astro:content': fileURLToPath(new URL('./test/mocks/astro-content.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts', 'scripts/ci/check-pr-template.mjs'],
      exclude: ['**/*.test.{ts,mjs}'],
    },
  },
});
