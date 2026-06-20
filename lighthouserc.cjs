/**
 * Lighthouse CI configuration.
 *
 * Runs against the already-built static output (public/) served by a local
 * static server, so it never rebuilds — the build job owns that. It audits the
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
 */
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
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:performance': ['error', { minScore: 0.8 }],
      },
    },
  },
};
