import { defineConfig } from '@silesiansolutions/search-quality-kit';

export default defineConfig({
  site: {
    baseUrl: 'https://dawidrylko.com',
  },
  build: {
    distDir: 'dist',
  },
  crawl: {
    entrypoints: ['/'],
    maxPages: 150,
    exclude: ['/admin', '/preview', '/api', '/404', '/404.html'],
  },
  ci: {
    failOn: ['error'],
  },
});
