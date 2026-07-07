# 🌐 dawidrylko.com

[![Continuous Integration](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/ci.yml/badge.svg)](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/ci.yml)
[![Continuous Deployment](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/cd.yml/badge.svg)](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/cd.yml)
[![CodeQL](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/github-code-scanning/codeql)

Personal website and blog of [Dawid Ryłko](https://dawidrylko.com) — a static site built with
**[Astro](https://astro.build)** and **[React](https://react.dev)** islands, written in **TypeScript**
and **MDX**, and deployed to **GitHub Pages**.

## 🧱 Tech stack

- **[Astro 6](https://astro.build)** — static site generator (MDX, RSS, sitemap integrations)
- **[React 19](https://react.dev)** — interactive islands, hydrated on demand
- **TypeScript** + **MDX** content collections (Zod-validated frontmatter)
- **[KaTeX](https://katex.org)** (math), **[Shiki](https://shiki.style)** (code), **[Mermaid](https://mermaid.js.org)** (diagrams)
- **pnpm** workspaces, **Node** pinned via [`.nvmrc`](./.nvmrc)

## 🚀 Getting started

```bash
pnpm install        # install dependencies
pnpm dev            # start the dev server on http://localhost:4321
pnpm build          # build the production site to dist/
pnpm preview        # preview the production build locally
```

## 📜 Scripts

| Command              | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `pnpm dev`           | Start the development server                           |
| `pnpm build`         | Build the production site to `dist/`                   |
| `pnpm preview`       | Preview the built site locally                         |
| `pnpm clean`         | Remove `dist/` and `.astro/`                           |
| `pnpm type:check`    | TypeScript + Astro diagnostics (`astro check`)         |
| `pnpm lint:check`    | Lint with ESLint (`lint:fix` to autofix)               |
| `pnpm lint:css`      | Lint CSS with Stylelint (`lint:css:fix` to autofix)    |
| `pnpm format:check`  | Check formatting with Prettier (`format:write` to fix) |
| `pnpm a11y:contrast` | Audit design-token colour contrast (WCAG AA)           |
| `pnpm test`          | Run unit tests (Vitest)                                |
| `pnpm test:e2e`      | Run end-to-end + accessibility tests (Playwright)      |

## 🗂️ Project structure

```
src/            # components, layouts, pages, lib (logic + unit tests), styles
content/pl/     # authored MDX blog posts (Content Collection)
static/         # files copied verbatim (CNAME, robots.txt, /files)
e2e/            # Playwright end-to-end + axe-core a11y tests
scripts/        # zero-dep tooling: ci/ (build-output gates), a11y/, notify/, presentations/
.github/        # workflows, issue forms, PR template, Dependabot
```

## ✅ Quality gates

Every pull request runs type-checking, ESLint, Stylelint, Prettier, a WCAG-AA contrast
audit, unit tests, a production build with build-output contracts (RSS, sitemap, SEO,
image and bundle budgets), Lighthouse, link integrity, and Playwright e2e/a11y tests.
PR titles are validated against [Conventional Commits](https://www.conventionalcommits.org)
and PR descriptions against the template.

`pnpm check:structured-data` validates every generated JSON-LD block and the canonical
`Person`, `WebSite`, `ProfilePage`, breadcrumb, and `BlogPosting` relationships. Both CI
and CD run it against the final `dist/` output. Google discovers updates through the
sitemap declared in `robots.txt`; the Indexing API is intentionally not used because
the site contains neither job postings nor livestream events.

A Husky pre-commit hook runs `lint-staged`, `astro check`, and validates presentation
PDF metadata.

## 🤝 Contributing

Commits and PR titles follow [Conventional Commits](https://www.conventionalcommits.org)
(`feat:`, `fix:`, `docs:`, …). Open issues with the provided
[issue forms](./.github/ISSUE_TEMPLATE) and fill in the
[pull request template](./.github/pull_request_template.md).

## 📄 License

Licensed under the MIT License — see [LICENSE](./LICENSE).
