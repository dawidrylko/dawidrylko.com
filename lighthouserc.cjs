/**
 * Lighthouse CI configuration.
 *
 * Runs against the already-built static output (public/) served by a local
 * static server, so it never rebuilds — the build job owns that. It audits the
 * rendered, app-owned pages (no blog posts: those are content) for runtime
 * regressions that static analysis cannot see.
 *
 * Responsibility split (no overlap with other CI jobs):
 *   - accessibility/seo are gated as errors here at the rendered-page level;
 *     the jsx-a11y lint and the design-token contrast gate cover the source
 *     and palette layers respectively.
 *   - performance/best-practices are advisory (warn) because scores vary on
 *     shared CI runners; they still surface meaningful drops in review.
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
        'http://localhost:9000/404.html',
      ],
      numberOfRuns: 1,
      settings: {
        chromeFlags: '--no-sandbox',
      },
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:performance': ['warn', { minScore: 0.8 }],
      },
    },
  },
};
