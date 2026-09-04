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
  // Tag archives below TAG_INDEX_MIN_POSTS (src/lib/tags.ts) carry "noindex,
  // follow" on purpose, and the indexability check cannot tell a deliberate
  // exclusion from an accidental one. Scoped to /tags/** so an accidental
  // noindex anywhere else still fails this gate, and safe at that width only
  // because the tag contract in scripts/ci/check-seo-meta.mjs asserts what each
  // page under /tags/ may carry: an archive at or above the threshold going
  // noindex fails there even though it is suppressed here. The window cannot
  // exclude the hub (/tags/* and /tags/*/** match it too), so that contract
  // covers the hub as a separate branch. Removing it silently uncovers /tags/.
  suppressions: [
    {
      code: 'indexability.noindex',
      urlPattern: '/tags/**',
      reason:
        'Thin tag archives are excluded from the index deliberately; check-seo-meta.mjs asserts exactly which ones.',
      owner: 'dawidrylko',
    },
    {
      // The same 15 pages, same decision, different code. It is only a warning
      // today and ci.failOn covers errors, so this documents the decision rather
      // than unblocking anything - and keeps the gate from breaking here for a
      // reason already reviewed, should failOn ever widen to warnings.
      //
      // Wider than the decision it records: this check fires on nosnippet and
      // max-snippet:0 as well as noindex, and no local contract watches those,
      // so a snippet-blocking directive anywhere under /tags/ would now pass
      // unseen. The narrower alternative is the policy pack's own
      // allowNoindexOn, which leaves the snippet half live but produces no
      // reviewed entry, dropping the decision out of the report.
      code: 'ai-visibility-safe.public-snippet-directives',
      urlPattern: '/tags/**',
      reason:
        'Thin tag archives are excluded from the index deliberately; check-seo-meta.mjs asserts exactly which ones.',
      owner: 'dawidrylko',
    },
  ],
  ci: {
    failOn: ['error'],
  },
});
