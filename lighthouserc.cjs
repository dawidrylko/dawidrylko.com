/**
 * Lighthouse CI configuration.
 *
 * Runs against the already-built static output (dist/) served by a local static
 * server, so it never rebuilds — the build job owns that. It audits the
 * rendered, app-owned pages (no blog posts: those are content) for runtime
 * regressions that static analysis cannot see.
 *
 * Responsibility split (no overlap with other CI jobs):
 *   - accessibility and seo are gated as errors here at the rendered-page level;
 *     the jsx-a11y lint and the design-token contrast gate cover the source and
 *     palette layers respectively. They are deterministic (not subject to runner
 *     noise), so they can be gated tightly site-wide.
 *   - performance and best-practices stay advisory (warn); they still surface
 *     regressions in the Lighthouse report without flaking the build.
 *
 * Why performance is advisory, not gated: on Lighthouse's mobile throttling the
 * render path (LCP/FCP behind the web font), not JavaScript, is the ceiling —
 * gtag.js is already deferred off the critical path and the chrome CSS is
 * inlined (build.inlineStylesheets) so no stylesheet round-trip blocks first
 * paint. With those done, the remaining variance is pure shared-runner noise:
 * the optimistic best-of-three swings ~0.76–0.82 across runs for the same
 * commit (the Mermaid-island /setup/ page dips the furthest), so any hard floor
 * in that band flakes the build without an obvious, simple page-level win to
 * earn it back. The score is still run (optimistic over three runs) and warns
 * below the threshold, keeping regressions visible in review.
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
      // Three runs give the optimistic aggregation something to choose from,
      // smoothing the noise that makes a single performance run unrepresentative.
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
        // Advisory only: surfaces performance regressions in the report on the
        // best of three runs, but never flakes the build on shared-runner noise.
        'categories:performance': ['warn', { minScore: 0.8, aggregationMethod: 'optimistic' }],
      },
    },
  },
};
