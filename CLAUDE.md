# dawidrylko.com

Instrukcje dla Claude Code. Blog i portfolio Dawida Ryłko: Astro 6 + React 19 (wyspy) + TypeScript + MDX, hostowane na GitHub Pages.

**Zakres pracy:** narzędzia i kod wspierający bloga — komponenty, layouty, strony, konfiguracja Astro, skrypty pomocnicze (`helpers/`) i CI/CD. Treść postów w `content/pl/` pisze autor ręcznie; nie twórz ani nie edytuj postów blogowych.

## Polecenia

```bash
pnpm dev            # serwer deweloperski (localhost:4321); alias: pnpm develop
pnpm build          # produkcyjny build → dist/
pnpm preview        # podgląd zbudowanego dist/
pnpm clean          # czyści dist/ i .astro/
pnpm type:check     # astro check (typy + diagnostyka .astro)
pnpm format:write   # Prettier — formatowanie
pnpm format:check   # Prettier — sprawdzenie
pnpm lint:fix       # ESLint — napraw
pnpm lint:check     # ESLint — sprawdź
pnpm lint:css       # Stylelint — sprawdź CSS
pnpm lint:css:fix   # Stylelint — napraw CSS
pnpm a11y:contrast  # audyt kontrastu design-tokenów (WCAG AA)
pnpm test           # testy jednostkowe (Vitest, jednorazowo)
pnpm test:watch     # Vitest w trybie watch
pnpm test:coverage  # Vitest + pokrycie (v8)
pnpm test:e2e       # testy e2e + a11y (Playwright) na zbudowanym dist/
```

Przed zatwierdzeniem zmian uruchom `pnpm type:check`, `pnpm lint:check`, `pnpm lint:css`, `pnpm format:check` i `pnpm test`.

**Testy:** projekt ma framework testowy. **Vitest** pokrywa logikę bezframeworkową w `src/lib` (pliki `*.test.ts` obok kodu; wirtualny moduł `astro:content` jest aliasowany do `test/mocks/`). **Playwright** (`e2e/*.spec.ts`) uruchamia testy e2e i skan dostępności `@axe-core/playwright` na podglądzie `dist/` (`astro preview`); wymaga przeglądarki `pnpm exec playwright install chromium`. Dodając lub zmieniając czystą logikę w `src/lib`, dopisz testy jednostkowe.

## Stos i struktura

- **Stack:** Astro 6 (`@astrojs/mdx`, `@astrojs/react`, `@astrojs/sitemap`, `@astrojs/rss`), React 19 jako wyspy, pnpm, Node v24 (`.nvmrc`).
- **Treść:** posty MDX w `content/pl/`, ładowane przez Content Collection (`src/content.config.ts`, schemat **zod**).
- **Build:** statyczny, wyjście w `dist/` (publicDir: `static/`).

```
src/components/    # .astro (Seo, Menu, Breadcrumbs, Bio, Table, JsonLd, ExternalLink, Figure) + wyspy React .tsx (Mermaid)
src/layouts/       # PageLayout.astro (chrome: head/Seo, header, breadcrumbs, bio, footer)
src/pages/         # index, blog, bio, contact, setup, metadata, files, 404, [...slug].astro, rss.xml.ts
src/data/          # site-metadata.ts, structured-data.ts, gtag.ts
src/lib/           # excerpt.ts, inline-markdown.ts, blog.ts, date.ts, page-metadata.ts (+ *.test.ts)
src/types.ts       # współdzielone typy (PageMetadata, NavLink)
e2e/               # testy Playwright (smoke, search, a11y); test/mocks/ — stuby dla Vitest
src/integrations/  # webmanifest.ts (generuje manifest + ikony przez sharp w astro:build:done)
src/scripts/       # web-vitals.ts (klienckie raportowanie do GA4)
src/assets/        # obrazy przetwarzane przez astro:assets
src/styles/        # main.css (design tokens), normalize.css
src/demo/          # memoization-demo.tsx — interaktywna wyspa importowana w jednym poście
src/content.config.ts  # kolekcja `posts` + schemat zod frontmatter
content/pl/        # posty blogowe MDX
static/            # zasoby kopiowane 1:1 (CNAME, robots.txt, /files: prezentacje PDF, CV)
helpers/           # skrypty CI (check-build-output, check-astro-*, a11y-contrast)
.github/workflows/ # ci.yml (PR), cd.yml (deploy na GH Pages z dist/)
```

## Model treści (kontekst przy pracy nad kodem)

Potrzebne przy modyfikacji `[...slug].astro`, `content.config.ts`, RSS (`rss.xml.ts`) lub sitemap — nie po to, by pisać posty:

- Post to katalog `content/pl/YYYY-MM-DD--slug-po-polsku/index.mdx` (część katalogów ma też strony wtórne, np. `.../ng-help.md`).
- Slug URL powstaje w `content.config.ts` (`generateId`: usunięcie rozszerzenia, `/index`, oraz prefiksu daty `replace(/.*--/, '')`): `2025-12-26--od-tablicy-do-mapy` → `/od-tablicy-do-mapy/`. **URL-e muszą zostać zachowane** (SEO) — pilnuje tego `helpers/ci/check-astro-url-parity.mjs`.
- Frontmatter: `title`, `description`, `date`, `tags`, opcjonalnie `featuredImg` + `featuredImgAlt` (gdy jest `featuredImg`, `featuredImgAlt` jest wymagany — reguła w schemacie zod).
- Renderowanie MDX: **Shiki** (kod, motyw jasny/ciemny), **KaTeX** (matematyka, `remark-math` + `rehype-katex`), **Mermaid** (diagram jako wyspa React `client:*`).

## Konwencje kodu

- **Komponenty:** statyczne pisz jako `.astro`; React (`.tsx`) tylko dla realnej interaktywności, jawnie hydratowany dyrektywą `client:*` (np. `client:load`, `client:visible`). Wyspy React: typ `FC`, nazwy PascalCase, importy hooków imienne.
- **Pliki:** komponenty `.astro` PascalCase; skrypty/dane kebab-case. **Stałe:** UPPER_SNAKE_CASE.
- **Style:** czyste CSS z custom properties (design tokens), bez preprocesorów; lintowane przez **Stylelint** (`stylelint-config-standard`, `normalize.css` wykluczony). Montserrat (nagłówki), Merriweather (tekst). Dark mode automatyczny przez `prefers-color-scheme` (bez przełącznika JS).
- **Dane strukturalne:** JSON-LD przez `JsonLd.astro` (zwykłe obiekty, bez schema-dts).
- **Prettier:** single quotes, średniki, 2 spacje, `printWidth: 120`, `arrowParens: avoid`, plugin `prettier-plugin-astro`.
- **Komentarze:** tylko po angielsku i tylko te realnie wartościowe — wyjaśniaj „dlaczego”, a nie to, co kod już mówi sam.

## Czego nie zmieniać

- **Nie zmieniaj `lang="en"`** w `PageLayout.astro` / `Seo.astro` mimo polskich treści — to celowa decyzja.
- **Zachowaj URL-e postów** (slug logic w `content.config.ts`) i przekierowanie `/resume` → `/bio/` (`astro.config.mjs`).
- **Główna gałąź to `master`** (nie `main`); deploy na GitHub Pages następuje po pushu do `master`.

## Pre-commit (Husky)

Hook uruchamia kolejno: `lint-staged` (Prettier + ESLint na staged) → `pnpm type:check` (astro check) → `validate-and-fix-presentations-metadata.sh`. Dodając PDF do `static/files/presentations/`, dopisz wpis w `metadata.csv` — w przeciwnym razie hook zablokuje commit (wymaga `exiftool`).

## Git i pull requesty

- Pisz commity oraz tytuły i opisy PR **po angielsku**, w formacie **Conventional Commits** (`docs:`, `feat:`, `fix:`, …).
- **Nie dodawaj atrybucji AI** — żadnych `Co-Authored-By`, `Claude-Session` ani stopek typu „Generated with Claude Code” w commitach i opisach PR. Pilnuje tego CI (`helpers/ci/check-no-ai-attribution.mjs`).
- **Po zmianie zakresu pilnuj zgodności opisu z treścią** — gdy po rebase, squashu lub odrzuceniu commitów zmieni się faktyczna zawartość gałęzi, zaktualizuj tytuł i opis commita oraz PR-a, tak aby opisywały tylko to, co realnie zostaje w diffie. Nie zostawiaj opisu sprzed zmiany zakresu.
