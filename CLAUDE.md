# dawidrylko.com

Claude Code instructions. Blog and portfolio of Dawid Ryłko: Astro 7 + React 19 islands + TypeScript + MDX, hosted on GitHub Pages.

**Answer Dawid in Polish.** This file is written in English to save context tokens, not to set the language of the conversation. Everything written for a human, chat included, follows the `/d-no-slop` canon: short sentences, no em or en dashes, straight quotes only, three dots instead of a one-character ellipsis, no decorative bold, none of its banned phrases.

**Scope:** tooling and code that supports the blog, meaning components, layouts, pages, Astro config, helper scripts (`scripts/`) and CI/CD. The author writes the posts in `content/pl/` by hand. Never create or edit a blog post.

## Commands

```bash
pnpm dev            # dev server (localhost:4321); aliases: develop, start
pnpm build          # CV PDFs, then the production site -> dist/
pnpm build:resume   # rebuild only the CV PDFs from resume/*.tex
pnpm preview        # preview the built dist/
pnpm clean          # remove dist/, .astro/ and the generated CV PDFs
pnpm type:check     # astro check (types + .astro diagnostics)
pnpm format:check   # Prettier check (format:write to fix)
pnpm lint:check     # ESLint (lint:fix to fix)
pnpm lint:css       # Stylelint (lint:css:fix to fix)
pnpm a11y:contrast  # design-token contrast audit (WCAG AA)
pnpm test           # unit tests (Vitest); also test:watch, test:coverage
pnpm test:e2e       # e2e + a11y (Playwright) against the built dist/
```

Run `pnpm type:check`, `pnpm lint:check`, `pnpm lint:css`, `pnpm format:check` and `pnpm test` before committing.

**Tests.** Vitest covers framework-free logic in `src/lib` and the CI scripts in `scripts/`. Test files sit next to the code: `*.test.ts` in `src`, `*.test.mjs` in `scripts`; the virtual `astro:content` module is aliased to `test/mocks/`. Playwright (`e2e/*.spec.ts`) runs e2e plus an `@axe-core/playwright` accessibility scan against the `dist/` preview (`astro preview`), and needs `pnpm exec playwright install chromium`. Add unit tests whenever you add or change pure logic in `src/lib`.

## Stack and layout

Astro 7 (`@astrojs/mdx`, `@astrojs/react`, `@astrojs/sitemap`, `@astrojs/rss`), React 19 as islands, pnpm, Node v24 (`.nvmrc`). Content is MDX in `content/pl/`, loaded through a Content Collection (`src/content.config.ts`, zod schema). The build is static, output in `dist/`, with `publicDir: static/`.

```
src/components/    # .astro components + React islands (.tsx)
src/layouts/       # PageLayout.astro (head/Seo, header, breadcrumbs, bio, footer)
src/pages/         # routes, including [...slug].astro, rss.xml.ts, sitemap.xml.ts, og/, tags/
src/lib/           # framework-free logic, every module with its *.test.ts next to it
src/data/          # site-metadata.ts, structured-data.ts, gtag.ts, capabilities.ts
src/integrations/  # webmanifest.ts (manifest + icons via sharp on astro:build:done)
src/scripts/       # web-vitals.ts, client side; NOT the tooling in /scripts
src/demo/          # memoization-demo.tsx, an island imported by a single post
src/assets/        # images processed by astro:assets
src/styles/        # main.css (design tokens), normalize.css
src/types.ts       # shared types (PageMetadata, NavLink)
content/pl/        # MDX posts (some carry their own chart-source/, one-off tooling)
e2e/               # Playwright e2e + axe-core a11y specs
resume/            # LaTeX sources for the CV published as /resume-{pl,en}.pdf
static/            # copied verbatim (CNAME, robots.txt, /files: PDF talks, CV)
scripts/           # zero-dep tooling: ci/ (dist/ contracts), a11y/, notify/, presentations/, resume/
.github/           # workflows (ci, cd, pr-meta), ISSUE_TEMPLATE/, pull_request_template.md, dependabot
```

## Content model (context for code work)

Needed when touching `[...slug].astro`, `content.config.ts`, `rss.xml.ts` or the sitemap, not for writing posts.

- A post is a directory `content/pl/YYYY-MM-DD--slug-po-polsku/index.mdx`. Some directories carry secondary pages too, for example `.../ng-help.md`.
- The URL slug is built in `content.config.ts`: `generateId` strips the extension, `/index` and the date prefix (`replace(/.*--/, '')`), so `2025-12-26--od-tablicy-do-mapy` becomes `/od-tablicy-do-mapy/`. **Post URLs must be preserved** for SEO, and `scripts/ci/check-astro-url-parity.mjs` enforces that.
- Frontmatter: `title`, `description`, `date`, `tags`, optionally `updatedDate` (maps to `dateModified` and `article:modified_time`), plus `featuredImg` and `featuredImgAlt`. The zod schema requires the alt text whenever the image is present.
- MDX rendering: Shiki for code (light and dark theme), KaTeX for math (`remark-math` + `rehype-katex`), Mermaid as a React island (`client:*`).

## Code conventions

- **Components:** write static ones as `.astro`. Use React (`.tsx`) only for real interactivity, hydrated explicitly with a `client:*` directive such as `client:load` or `client:visible`. React islands use the `FC` type, PascalCase names and named hook imports.
- **Naming:** `.astro` components PascalCase, scripts and data kebab-case, constants UPPER_SNAKE_CASE.
- **Styles:** plain CSS with custom properties (design tokens), no preprocessors, linted by Stylelint (`stylelint-config-standard`, `normalize.css` excluded). Montserrat for headings, Merriweather for text. Dark mode is automatic through `prefers-color-scheme`, with no JS toggle. **Keep styles global in `src/styles/main.css`**, loaded once in `PageLayout.astro`. Never use scoped `<style>` blocks in `.astro`: they escape Stylelint, which only lints `src/**/*.css`. `scripts/ci/check-no-scoped-styles.mjs` enforces this.
- **Mobile-first:** write base rules for the smallest screen and add larger views only through `min-width` media queries (scale `sm = 30rem`, `md = 48rem`, see the comment in `main.css`). Never use `max-width` to undo desktop styles. Layouts wrap (`flex-wrap`) instead of clipping or scrolling horizontally on narrow screens. Breadcrumbs are the one exception: a single line with `overflow-x: auto`, so a deep path does not stack into several rows.
- **Separators:** inline separators (RSS, tags, post meta) stay consistent with the menu, a bullet `•` through `.separator` or `li::after`, never `|`. Breadcrumbs are again the exception and use `›` for hierarchy.
- **Structured data:** JSON-LD through `JsonLd.astro`, plain objects, no schema-dts.
- **Prettier:** single quotes, semicolons, 2 spaces, `printWidth: 120`, `arrowParens: avoid`, plugin `prettier-plugin-astro`.
- **Comments:** English only, and only where they earn their place. Explain why, not what the code already says.

## SEO and metadata (Ahrefs limits)

The Ahrefs audit checks metadata length and correctness. These rules cover the pages we control from this repo, and unit tests (`src/lib/seo.test.ts`) plus checks against the built `dist/` enforce them.

- **Length limits** (`src/lib/seo.ts`): `<title>` up to **60** characters, `<meta name="description">` up to **160**. Stay inside them when changing the title or description of a static page (`src/pages/*`) or the fallback in `site-metadata.ts`. `scripts/ci/check-seo-lengths.mjs` is hard for our own pages (`/`, `/blog/*`, `/bio/`, `/contact/`, `/setup/`, `/metadata/`, `/files/`) and only warns for `content/pl` posts, whose title and description come from the author's frontmatter.
- **Homepage title** is built from `SITE_METADATA.title` plus `titleTagline`, short enough to stay under 60 with the brand. `author.jobTitle` is a separate, deliberately different string: the positioning tagline behind Bio and JSON-LD Person, the same one used as the LinkedIn headline. Do not merge the two fields, and never put `jobTitle` in `<title>`.
- **Fallback description** (`SITE_METADATA.description`) must be at most 160 characters and must not carry the `68 97 119` easter egg. That signature lives on `/metadata/` as a "Signature" row, injected client side by an `is:inline` script in `metadata.astro`, so it never reaches the raw HTML a crawler sees. `scripts/ci/check-crawl-hygiene.mjs` enforces this.
- **Canonical:** a canonical is dropped only when the URL is not a real target. `noIndex` pages (`noindex, nofollow`, for example 404) emit neither `<link rel="canonical">` nor `hreflang`, because both would point at a non-200 URL. `noIndexFollow` pages (`noindex, follow`, for example thin tag archives) are ordinary 200 pages and keep their self-canonical and `hreflang`. `scripts/ci/check-seo-meta.mjs` and `check-lang-attributes.mjs` enforce this, and the smoke test covers the 404 part.
- **Tag archives:** a tag with fewer than `TAG_INDEX_MIN_POSTS` posts (`src/lib/tags.ts`, currently 5) gets `noindex, follow`. A listing with no content of its own adds nothing to the index, but it should still pass internal links along. The threshold is duplicated in `scripts/ci/robots-directives.mjs`, because `scripts/` has no dependencies. Change both places.
- **Image budget:** every image in `dist/` is at most **1 MB** (`scripts/ci/check-image-budget.mjs`). Existing heavier post images sit on a temporary exception list (`image-budget-baseline.json`), but **new** oversized images fail CI, so optimise the source before adding it. After a deliberate optimisation refresh the baseline with `node scripts/ci/check-image-budget.mjs --update-baseline`.

## Do not change

- **Keep the per-page `lang` split** defined in `src/lib/i18n.ts`. The English shell (`/`, `/bio/`, `/contact/`, `/setup/`, `/metadata/`, `/files/`, 404) stays `en`; the blog, individual posts and `/tags/` opt into `CONTENT_LANG` (`pl`). Never hardcode one language in `PageLayout.astro` or `Seo.astro`. `scripts/ci/check-lang-attributes.mjs` locks the split together with `og:locale` and hreflang.
- **Keep post URLs** (slug logic in `content.config.ts`) and the `/resume` to `/bio/` redirect (`astro.config.mjs`).
- **The main branch is `master`**, not `main`. A push to `master` deploys to GitHub Pages.

## Pre-commit (Husky)

The hook runs `lint-staged` (Prettier + ESLint on staged files), then `pnpm type:check` (astro check), then `scripts/presentations/validate-and-fix-metadata.sh`. When you add a PDF to `static/files/presentations/`, add its row to `metadata.csv` or the hook blocks the commit. It needs `exiftool`.

## Git and pull requests

- Write commits and PR titles **in English**, as Conventional Commits (`docs:`, `feat:`, `fix:` and the rest of the spec). `pr-meta.yml` enforces the title, and the PR body must fill in `.github/pull_request_template.md`, checked by `scripts/ci/check-pr-template.mjs`. Open issues through the forms in `.github/ISSUE_TEMPLATE/`.
- **No AI attribution.** No `Co-Authored-By`, no `Claude-Session`, no "Generated with Claude Code" footers in commits or PR descriptions. `scripts/ci/check-no-ai-attribution.mjs` enforces it.
- **Keep the description matching the diff.** When a rebase, a squash or a dropped commit changes what the branch actually contains, update the commit and PR title and description so they describe only what really remains.
