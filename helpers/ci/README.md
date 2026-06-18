# helpers/ci

Zero-dependency CI helpers that run against the build output, not the source.

## `check-build-output.mjs`

Asserts the build-output contract on `public/` after `pnpm build`:

- core pages (`index.html`, `404.html`),
- RSS feed (`rss.xml`) with an `<atom:link rel="self">`, at least one `<item>`
  and at least one `<enclosure>`,
- sitemap (`sitemap-index.xml` + `sitemap-0.xml`),
- PWA manifest (`manifest.webmanifest`) with name, colors and icons,
- Open Graph / Twitter Card meta on rendered HTML.

Run locally after a build:

```bash
pnpm build
node helpers/ci/check-build-output.mjs
```

Exits non-zero and lists every problem when the contract is violated. In CI it
runs in the `build-contract` job against the shared build artifact, so it never
triggers its own build. Rendered-page audits (Lighthouse) and link integrity
(linkinator) live in separate jobs to keep responsibilities from overlapping.
