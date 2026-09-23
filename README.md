# 🌐 dawidrylko.com

[![Continuous Integration](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/ci.yml/badge.svg)](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/ci.yml)
[![Continuous Deployment](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/cd.yml/badge.svg)](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/cd.yml)
[![CodeQL](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/github-code-scanning/codeql)

Personal website and blog of [Dawid Ryłko](https://dawidrylko.com). A static site built with
[Astro](https://astro.build), [React](https://react.dev) islands, TypeScript and MDX. Posts live in
`content/pl/`. Every push to `master` deploys to GitHub Pages.

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

Every pull request goes through the same gates.

The source gets type-checking, ESLint, Stylelint, Prettier, a WCAG AA contrast audit and unit
tests. CI then builds the site once and checks that `dist/` against contracts for RSS, the
sitemap, SEO metadata and the image and bundle budgets. Lighthouse, a link check, Playwright e2e
and accessibility tests and a Google Search quality check run on the same build.

The pull request itself gets a dependency review and a scan for AI attribution in commits and PR
text. Its title must follow [Conventional Commits](https://www.conventionalcommits.org), and its
description must fill in the template.

`pnpm check:structured-data` validates every JSON-LD block. It also checks how `Person`,
`WebSite`, `ProfilePage`, breadcrumbs and `BlogPosting` point at each other. CI and CD both run it
on the final `dist/`. Google finds new pages through the sitemap declared in `robots.txt`. The site
does not use the Indexing API, which serves only job postings and livestreams.

A Husky pre-commit hook runs `lint-staged` and `astro check`, then validates the metadata of
presentation PDFs.

## 🤖 Dependency updates

Dependabot opens one pull request a week with the npm minor and patch updates. Each npm major gets
a pull request of its own. GitHub Actions updates share one weekly pull request, majors included, so
an Actions major sends the whole pull request to a human.

Four CI jobs handle these pull requests. `Dependabot metadata` reads the update type.
`Dependabot autofix` runs `eslint --fix`, `stylelint --fix` and `format:write` on the updated npm
packages, only for a minor or patch update. It holds a read-only token and
keeps any change as a patch. `Dependabot autofix push` checks the patch with
`scripts/ci/check-autofix-paths.mjs` and commits it as `rylkobot`. The guard refuses any change to
`content/`, `.github/`, `.husky/`, the manifest, the lockfile and the pnpm and Node settings. The
commit starts a new CI run.

`Dependabot merge` waits for every CI job. A green minor or patch update gets auto-merge with a
merge commit, and GitHub merges it once the required checks pass. Everything else is assigned to
`dawidrylko`: a major, a red check, a failed or refused autofix, an unknown update type.

A merge to `master` deploys at once. An automatic merge therefore ships the update, autofix commit
included, with no human review. That is deliberate. Auto-merge runs on the `rylkobot` token,
because a merge made with `GITHUB_TOKEN` would not start the deployment.

Once `rylkobot` pushes a commit, Dependabot stops rebasing the pull request. Merge it or comment
`@dependabot recreate`. That is why a major gets no autofix: it waits for a human, and a rylkobot
commit would leave it stuck in conflict after the next merge to `master`.

## 📄 License

MIT. See [LICENSE](./LICENSE).
