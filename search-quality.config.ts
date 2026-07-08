import { defineConfig, presets, profiles } from '@silesiansolutions/search-quality-kit';

const preset = presets.astro();

export default defineConfig({
  ...preset,
  ...profiles.personalSite(),
  site: {
    baseUrl: 'https://dawidrylko.com',
  },
  crawl: {
    ...preset.crawl,
    entrypoints: ['/'],
    maxPages: 150,
  },
  ci: {
    failOn: ['error'],
  },
});
