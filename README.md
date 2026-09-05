# 🌐 dawidrylko.com

[![Continuous Integration](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/ci.yml/badge.svg)](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/ci.yml)
[![Continuous Deployment](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/cd.yml/badge.svg)](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/cd.yml)
[![CodeQL](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/github-code-scanning/codeql)

Personal website and blog of [Dawid Ryłko](https://dawidrylko.com). It is a static site built with
[Astro](https://astro.build) and [React](https://react.dev) islands, written in TypeScript and MDX.
Posts live in `content/pl/`. Every push to `master` deploys to GitHub Pages.

## 🧱 Tech stack

- [Astro 7](https://astro.build) - static site generator (MDX, RSS, sitemap integrations)
- [React 19](https://react.dev) - interactive islands, hydrated on demand
- TypeScript + MDX content collections (Zod-validated frontmatter)
- [KaTeX](https://katex.org) (math), [Shiki](https://shiki.style) (code), [Mermaid](https://mermaid.js.org) (diagrams)
- pnpm pinned via `packageManager`, Node via [`.nvmrc`](./.nvmrc)

## 🚀 Getting started

```bash
pnpm install        # install dependencies
pnpm dev            # start the dev server on http://localhost:4321
pnpm build          # build the production site to dist/
pnpm preview        # preview the production build locally
```

## 📜 Scripts

| Command                      | Description                                            |
| ---------------------------- | ------------------------------------------------------ |
| `pnpm dev`                   | Start the development server                           |
| `pnpm build`                 | Build the CV PDFs, then the production site to `dist/` |
| `pnpm build:resume`          | Rebuild only the CV PDFs from `resume/*.tex`           |
| `pnpm preview`               | Preview the built site locally                         |
| `pnpm clean`                 | Remove `dist/`, `.astro/` and the generated CV PDFs    |
| `pnpm type:check`            | TypeScript + Astro diagnostics (`astro check`)         |
| `pnpm lint:check`            | Lint with ESLint (`lint:fix` to autofix)               |
| `pnpm lint:css`              | Lint CSS with Stylelint (`lint:css:fix` to autofix)    |
| `pnpm format:check`          | Check formatting with Prettier (`format:write` to fix) |
| `pnpm a11y:contrast`         | Audit design-token colour contrast (WCAG AA)           |
| `pnpm check:structured-data` | Validate JSON-LD and SEO meta on the built `dist/`     |
| `pnpm test`                  | Run unit tests (Vitest)                                |
| `pnpm test:e2e`              | Run end-to-end + accessibility tests (Playwright)      |

## 🗂️ Project structure

```
src/            # components, layouts, pages, lib (logic + unit tests), styles
content/pl/     # authored MDX blog posts (Content Collection)
static/         # files copied verbatim (CNAME, robots.txt, /files) + built CV PDFs
resume/         # LaTeX sources for the CV published as /resume-{pl,en}.pdf
e2e/            # Playwright end-to-end + axe-core a11y tests
scripts/        # zero-dep tooling: ci/ (build-output gates), a11y/, notify/, presentations/, resume/
.github/        # workflows, issue forms, PR template, Dependabot
```

## ✅ Quality gates

Every pull request runs type-checking, ESLint, Stylelint, Prettier, a WCAG-AA contrast audit and
unit tests. It also builds the production site and checks it against build-output contracts for
RSS, sitemap, SEO, image and bundle budgets. Lighthouse, internal link integrity and Playwright
e2e/a11y tests belong to the same run. So do a dependency review, a Google Search quality check,
and a scan for AI attribution in commits and PR metadata. PR titles are checked against
[Conventional Commits](https://www.conventionalcommits.org), descriptions against the template.

`pnpm check:structured-data` validates every generated JSON-LD block, along with the canonical
`Person`, `WebSite`, `ProfilePage`, breadcrumb and `BlogPosting` relationships. CI and CD both run
it against the final `dist/` output. Google picks up updates through the sitemap declared in
`robots.txt`. The Indexing API is not used, because the site has neither job postings nor
livestream events.

A Husky pre-commit hook runs `lint-staged` and `astro check`, then validates presentation PDF
metadata.

## 🤝 Contributing

Commits and PR titles follow [Conventional Commits](https://www.conventionalcommits.org)
(`feat:`, `fix:`, `docs:` and the rest). Open issues with the
[issue forms](./.github/ISSUE_TEMPLATE) and fill in the
[pull request template](./.github/pull_request_template.md).

## 📄 License

MIT. See [LICENSE](./LICENSE).
