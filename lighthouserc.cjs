/**
 * Lighthouse CI configuration.
 *
 * Runs against the already-built static output (dist/) served by a local static
 * server, so it never rebuilds — the build job owns that. It audits the
 * rendered, app-owned pages (no blog posts: those are content) for runtime
 * regressions that static analysis cannot see.
 *
 * Responsibility split (no overlap with other CI jobs):
 *   - accessibility/seo/performance are gated as errors here at the
 *     rendered-page level; the jsx-a11y lint and the design-token contrast gate
 *     cover the source and palette layers respectively.
 *   - performance is run three times and asserted on the median to absorb the
 *     run-to-run variance of shared CI runners, so the gate is stable.
 *   - best-practices stays advisory (warn); it still surfaces drops in review.
 *
 * Per-page gate (assertMatrix): the primary app pages (home, blog, bio,
 * contact) are lightweight, content-light documents and are held to the
 * strictest bar the toolchain can sustain. The remaining pages legitimately
 * ship heavier runtime work — /setup/ hydrates the Mermaid island, /metadata/
 * renders the full presentation index — so their performance gate is the 0.8
 * floor while accessibility and SEO stay high everywhere.
 */

// The strict accessibility/SEO bar shared by every audited page: these scores
// are deterministic (not subject to the runner noise that performance is), so
// they can be gated tightly site-wide.
const A11Y_SEO_STRICT = {
  'categories:accessibility': ['error', { minScore: 0.95 }],
  'categories:seo': ['error', { minScore: 0.95 }],
  'categories:best-practices': ['warn', { minScore: 0.9 }],
};

module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:9000/',
        'http://localhost:9000/blog/',
        'http://localhost:9000/bio/',
        'http://localhost:9000/contact/',
        'http://localhost:9000/setup/',
        'http://localhost:9000/metadata/',
      ],
      // Three runs let Lighthouse CI assert on the median, smoothing the noise
      // that made performance unsafe to gate on a single run.
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox',
      },
    },
    assert: {
      assertMatrix: [
        {
          // Primary app pages: home, /blog/, /bio/, /contact/. Static, text-led
          // documents that should approach a perfect performance score.
          matchingUrlPattern: '^http://localhost:9000/(blog/|bio/|contact/)?$',
          assertions: {
            ...A11Y_SEO_STRICT,
            'categories:performance': ['error', { minScore: 0.95 }],
          },
        },
        {
          // Heavier app pages: /setup/ (Mermaid island) and /metadata/. Held to
          // the 0.8 performance floor; accessibility/SEO stay strict.
          matchingUrlPattern: '^http://localhost:9000/(setup|metadata)/$',
          assertions: {
            ...A11Y_SEO_STRICT,
            'categories:performance': ['error', { minScore: 0.8 }],
          },
        },
      ],
    },
  },
};
