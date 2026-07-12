import { defineConfig, policyPacks, presets, profiles } from '@silesiansolutions/search-quality-kit';

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
  profiles: {
    default: 'personal',
    routes: [
      { pattern: '/20*', profile: 'blogPost' },
      { pattern: '/blog/**', profile: 'blog' },
    ],
  },
  plugins: [
    policyPacks.personalBrand({
      contactLinkText: ['Contact', 'Get in touch', 'Email', 'Kontakt'],
      contactHrefPatterns: ['/contact', 'mailto:'],
    }),
    policyPacks.aiVisibilitySafe(),
  ],
  ci: {
    failOn: ['error'],
  },
});
