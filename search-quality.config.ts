import { defineConfig, policyPacks, presets, profiles } from '@silesiansolutions/search-quality-kit';

const preset = presets.astro();

// Kept in sync with NOINDEX_ROUTES in astro.config.mjs and LEGAL_ROUTES in
// scripts/ci/robots-directives.mjs. Recorded as suppressions rather than
// through the policy pack's allowNoindexOn, for the reason spelled out below
// the tag entries: allowNoindexOn silences the finding without leaving a
// reviewed decision in the report.
const LEGAL_ROUTES = ['/privacy-policy/', '/cookie-policy/', '/polityka-prywatnosci/', '/polityka-cookies/'];

const LEGAL_REASON =
  'Legal pages are excluded from the index deliberately; check-seo-meta.mjs asserts the directive and check-crawl-hygiene.mjs asserts they stay out of the sitemap.';

const legalSuppressions = LEGAL_ROUTES.flatMap(route =>
  (['indexability.noindex', 'ai-visibility-safe.public-snippet-directives'] as const).map(code => ({
    code,
    urlPattern: `${route}**`,
    reason: LEGAL_REASON,
    owner: 'dawidrylko',
  })),
);

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
    ...legalSuppressions,
    // The ng help dump: a verbatim copy of Angular CLI 2017 output that drew 32
    // percent of the domain's Search Console impressions and zero clicks, all
    // from operator strings emitted by tooling. Excluded from the index with
    // `noIndex: true` in its frontmatter, which renders "noindex, follow" and
    // drops the route from the sitemap.
    //
    // Scoped to this one route rather than a pattern, so any other page going
    // noindex still fails this gate. check-crawl-hygiene.mjs asserts the other
    // half in both directions: a noindex page advertised in the sitemap fails
    // there, and so does an indexable page missing from it.
    ...(['indexability.noindex', 'ai-visibility-safe.public-snippet-directives'] as const).map(code => ({
      code,
      urlPattern: '/angular-2-angular-cli-pierwsze-kroki/ng-help/**',
      reason:
        'Secondary page excluded from the index deliberately (noIndex frontmatter flag); check-crawl-hygiene.mjs asserts the sitemap agrees.',
      owner: 'dawidrylko',
    })),
  ],
  ci: {
    failOn: ['error'],
  },
});
