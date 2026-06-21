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
 *   - performance is run three times and asserted with the `optimistic`
 *     aggregation (the best of the three runs), so the gate fires only on a
 *     consistent regression rather than the run-to-run noise of shared CI
 *     runners — it never flakes the build on a single slow run.
 *   - best-practices stays advisory (warn); it still surfaces drops in review.
 *
 * Per-page gate (assertMatrix): the primary app pages (home, blog, bio,
 * contact) are static, text-led documents and are held to the highest
 * performance bar they sustain reliably. On Lighthouse's mobile throttling the
 * render path (LCP/FCP behind a render-blocking stylesheet and a web font), not
 * JavaScript, is the ceiling — gtag.js is already deferred off the critical
 * path — so the realistic, non-flaky bar is 0.85, set to 0.83 to keep ~0.02 of
 * headroom over the best observed run. The remaining pages keep the 0.8 floor:
 * /metadata/ renders the full presentation index, and /setup/ hydrates the
 * Mermaid island on scroll (client:visible). Accessibility and SEO stay high
 * everywhere.
 */

// The strict accessibility/SEO bar shared by every audited page: these scores
// are deterministic (not subject to the runner noise that performance is), so
// they can be gated tightly site-wide.
const A11Y_SEO_STRICT = {
  'categories:accessibility': ['error', { minScore: 0.95 }],
  'categories:seo': ['error', { minScore: 0.95 }],
  'categories:best-practices': ['warn', { minScore: 0.9 }],
};

// Assert performance on the best of the three runs so a single noisy run on a
// shared CI runner cannot flake the gate; only a regression that drags every
// run below the bar fails the build.
const performanceGate = minScore => ['error', { minScore, aggregationMethod: 'optimistic' }];

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
      // Three runs give the optimistic aggregation something to choose from,
      // smoothing the noise that makes a single performance run unsafe to gate.
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox',
      },
    },
    assert: {
      assertMatrix: [
        {
          // Primary app pages: home, /blog/, /bio/, /contact/. Static, text-led
          // documents held to the highest mobile bar they sustain reliably.
          matchingUrlPattern: '^http://localhost:9000/(blog/|bio/|contact/)?$',
          assertions: {
            ...A11Y_SEO_STRICT,
            'categories:performance': performanceGate(0.83),
          },
        },
        {
          // Heavier app pages: /setup/ (Mermaid island) and /metadata/. Held to
          // the 0.8 performance floor; accessibility/SEO stay strict.
          matchingUrlPattern: '^http://localhost:9000/(setup|metadata)/$',
          assertions: {
            ...A11Y_SEO_STRICT,
            'categories:performance': performanceGate(0.8),
          },
        },
      ],
    },
  },
};
