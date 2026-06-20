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

## `check-seo-lengths.mjs`

Enforces the SEO length limits (mirrored in `src/lib/seo.ts`) on the rendered
pages: `<title>` ≤ 60 chars and `<meta name="description">` ≤ 160. App-owned
routes (`/`, `/blog/*`, `/bio/`, `/contact/`, `/setup/`, `/metadata/`, `/files/`)
fail the build; blog posts (author content from MDX frontmatter) are reported as
warnings only. Runs in the `build-contract` job.

```bash
pnpm build
node helpers/ci/check-seo-lengths.mjs
```

## `check-image-budget.mjs`

Fails when an emitted image exceeds the 1 MB per-file budget. Existing oversized
post images are grandfathered by source-name stem in `image-budget-baseline.json`,
so only **new** oversized images break the build. Runs in the `build-contract`
job. After intentionally optimising images, refresh the baseline:

```bash
pnpm build
node helpers/ci/check-image-budget.mjs                  # check
node helpers/ci/check-image-budget.mjs --update-baseline # regenerate baseline
```

## `check-bundle-budget.mjs`

Fails when any single page references more than 240 KB of `/_astro/*.js` up front
(module scripts + modulepreload links). Mermaid's per-diagram chunks load at
runtime and are not counted. Catches a heavy dependency that starts shipping
site-wide. Runs in the `build-contract` job.

```bash
pnpm build
node helpers/ci/check-bundle-budget.mjs
```

## `check-no-ai-attribution.mjs`

Enforces the no-AI-attribution rule from `CLAUDE.md`: fails if a commit message
or the PR title/description contains `Co-Authored-By: Claude`, `Claude-Session`,
"Generated with Claude Code", a `🤖 Generated` footer, a `claude.ai/code` link,
etc.

Runs in CI in the `attribution` job on `pull_request`. The PR title and body are
passed via env (never interpolated into a shell command); commit messages are
read from `git log BASE_SHA..HEAD_SHA`. Run it locally against a range:

```bash
BASE_SHA=origin/master HEAD_SHA=HEAD node helpers/ci/check-no-ai-attribution.mjs
```
