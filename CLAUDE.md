# dawidrylko.com

Instrukcje dla Claude Code. Blog i portfolio Dawida Ryłko: Astro 6 + React 19 (wyspy) + TypeScript + MDX, hostowane na GitHub Pages.

**Zakres pracy:** narzędzia i kod wspierający bloga — komponenty, layouty, strony, konfiguracja Astro, skrypty pomocnicze (`scripts/`) i CI/CD. Treść postów w `content/pl/` pisze autor ręcznie; nie twórz ani nie edytuj postów blogowych.

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

**Testy:** projekt ma framework testowy. **Vitest** pokrywa logikę bezframeworkową w `src/lib` oraz skrypty CI w `scripts/` (pliki testów obok kodu: `*.test.ts` w `src`, `*.test.mjs` w `scripts`; wirtualny moduł `astro:content` jest aliasowany do `test/mocks/`). **Playwright** (`e2e/*.spec.ts`) uruchamia testy e2e i skan dostępności `@axe-core/playwright` na podglądzie `dist/` (`astro preview`); wymaga przeglądarki `pnpm exec playwright install chromium`. Dodając lub zmieniając czystą logikę w `src/lib`, dopisz testy jednostkowe.

## Stos i struktura

- **Stack:** Astro 6 (`@astrojs/mdx`, `@astrojs/react`, `@astrojs/sitemap`, `@astrojs/rss`), React 19 jako wyspy, pnpm, Node v24 (`.nvmrc`).
- **Treść:** posty MDX w `content/pl/`, ładowane przez Content Collection (`src/content.config.ts`, schemat **zod**).
- **Build:** statyczny, wyjście w `dist/` (publicDir: `static/`).

```
src/components/    # .astro (Seo, Menu, Breadcrumbs, Bio, Table, JsonLd, ExternalLink, Figure, Faq, HowTo) + wyspy React .tsx (Mermaid)
src/layouts/       # PageLayout.astro (chrome: head/Seo, header, breadcrumbs, bio, footer)
src/pages/         # index, blog, bio, contact, setup, metadata, files, 404, [...slug].astro, rss.xml.ts
src/data/          # site-metadata.ts, structured-data.ts, gtag.ts
src/lib/           # excerpt.ts, inline-markdown.ts, blog.ts, date.ts, page-metadata.ts (+ *.test.ts)
src/types.ts       # współdzielone typy (PageMetadata, NavLink)
e2e/               # testy Playwright (smoke, search, a11y); test/mocks/ — stuby dla Vitest
src/integrations/  # webmanifest.ts (generuje manifest + ikony przez sharp w astro:build:done)
src/scripts/       # web-vitals.ts (klienckie raportowanie do GA4) — NIE mylić z tooling /scripts
src/assets/        # obrazy przetwarzane przez astro:assets
src/styles/        # main.css (design tokens), normalize.css
src/demo/          # memoization-demo.tsx — interaktywna wyspa importowana w jednym poście
src/content.config.ts  # kolekcja `posts` + schemat zod frontmatter
content/pl/        # posty blogowe MDX (część postów ma własny chart-source/ — jednorazowe narzędzia)
static/            # zasoby kopiowane 1:1 (CNAME, robots.txt, /files: prezentacje PDF, CV)
scripts/           # tooling (zero zależności): ci/ (kontrakty na dist/), a11y/, notify/, presentations/
.github/           # workflows (ci, cd, pr-meta), ISSUE_TEMPLATE/, pull_request_template.md, dependabot
```

## Model treści (kontekst przy pracy nad kodem)

Potrzebne przy modyfikacji `[...slug].astro`, `content.config.ts`, RSS (`rss.xml.ts`) lub sitemap — nie po to, by pisać posty:

- Post to katalog `content/pl/YYYY-MM-DD--slug-po-polsku/index.mdx` (część katalogów ma też strony wtórne, np. `.../ng-help.md`).
- Slug URL powstaje w `content.config.ts` (`generateId`: usunięcie rozszerzenia, `/index`, oraz prefiksu daty `replace(/.*--/, '')`): `2025-12-26--od-tablicy-do-mapy` → `/od-tablicy-do-mapy/`. **URL-e muszą zostać zachowane** (SEO) — pilnuje tego `scripts/ci/check-astro-url-parity.mjs`.
- Frontmatter: `title`, `description`, `date`, `tags`, opcjonalnie `updatedDate` (mapuje się na `dateModified` / `article:modified_time`), `featuredImg` + `featuredImgAlt` (gdy jest `featuredImg`, `featuredImgAlt` jest wymagany — reguła w schemacie zod).
- Renderowanie MDX: **Shiki** (kod, motyw jasny/ciemny), **KaTeX** (matematyka, `remark-math` + `rehype-katex`), **Mermaid** (diagram jako wyspa React `client:*`).

## Konwencje kodu

- **Komponenty:** statyczne pisz jako `.astro`; React (`.tsx`) tylko dla realnej interaktywności, jawnie hydratowany dyrektywą `client:*` (np. `client:load`, `client:visible`). Wyspy React: typ `FC`, nazwy PascalCase, importy hooków imienne.
- **Pliki:** komponenty `.astro` PascalCase; skrypty/dane kebab-case. **Stałe:** UPPER_SNAKE_CASE.
- **Style:** czyste CSS z custom properties (design tokens), bez preprocesorów; lintowane przez **Stylelint** (`stylelint-config-standard`, `normalize.css` wykluczony). Montserrat (nagłówki), Merriweather (tekst). Dark mode automatyczny przez `prefers-color-scheme` (bez przełącznika JS). **Style trzymaj globalnie w `src/styles/main.css`** (ładowany raz w `PageLayout.astro`) — **nie** używaj scoped bloków `<style>` w `.astro` (uciekłyby Stylelintowi, który lintuje tylko `src/**/*.css`). Pilnuje tego `scripts/ci/check-no-scoped-styles.mjs`.
- **Mobile-first:** reguły bazowe pisz pod najmniejszy ekran; większe widoki dodawaj wyłącznie przez `min-width` media queries (skala `sm = 30rem`, `md = 48rem` — patrz komentarz w `main.css`). Nie używaj `max-width` do cofania stylów desktopowych. Układy mają się zawijać (`flex-wrap`), a nie obcinać/skrolować w poziomie na wąskich ekranach (wyjątek: okruszki — pojedyncza linia ze scrollem `overflow-x: auto`, by głęboka ścieżka nie stackowała się w wiele rzędów). Separatory inline (np. RSS/tagi, meta wpisu) trzymaj spójne z menu — kropka `•` (`.separator` lub `li::after`), nie `|`. Wyjątek: okruszki (breadcrumbs) używają strzałki `›` jako separatora hierarchii.
- **Dane strukturalne:** JSON-LD przez `JsonLd.astro` (zwykłe obiekty, bez schema-dts).
- **Prettier:** single quotes, średniki, 2 spacje, `printWidth: 120`, `arrowParens: avoid`, plugin `prettier-plugin-astro`.
- **Komentarze:** tylko po angielsku i tylko te realnie wartościowe — wyjaśniaj „dlaczego”, a nie to, co kod już mówi sam.

## SEO i metadane (limity Ahrefs)

Audyt Ahrefs pilnuje długości i poprawności metadanych. Reguły poniżej dotyczą stron, które kontrolujemy (kod w repo) — pilnują ich testy jednostkowe (`src/lib/seo.test.ts`) i checki na zbudowanym `dist/`.

- **Limity długości** (`src/lib/seo.ts`): `<title>` ≤ **60** znaków, `<meta name="description">` ≤ **160**. Zmieniając tytuł/opis strony statycznej (`src/pages/*`) lub fallback w `site-metadata.ts`, mieść się w limitach. Sprawdza je `scripts/ci/check-seo-lengths.mjs` (twardo dla stron własnych: `/`, `/blog/*`, `/bio/`, `/contact/`, `/setup/`, `/metadata/`, `/files/`; posty z `content/pl` tylko ostrzega — ich tytuł/opis pochodzą z frontmatteru autora).
- **Tytuł strony głównej** budowany jest z `SITE_METADATA.title` + `titleTagline` (krótki, ≤60 z marką). `author.jobTitle` (pełny opis roli) jest dłuższy i służy tylko do Bio + JSON-LD — nie używaj go w `<title>`.
- **Fallback opisu** (`SITE_METADATA.description`) musi być ≤160 i **bez** easter-egga „68 97 119…”. Sygnatura żyje na `/metadata/` jako wiersz „Signature”, ale jest **wstrzykiwana po stronie klienta** (skrypt `is:inline` w `metadata.astro`) — nigdy nie trafia do surowego HTML widzianego przez crawlery. Pilnuje tego `scripts/ci/check-crawl-hygiene.mjs`.
- **Canonical:** strony `noIndex` (np. 404) **nie** emitują `<link rel="canonical">` (wskazywałby na URL non-200). Pilnują tego `scripts/ci/check-seo-meta.mjs` i smoke test.
- **Budżet obrazów:** każdy obraz w `dist/` ≤ **1 MB** (`scripts/ci/check-image-budget.mjs`). Istniejące, cięższe obrazy postów są tymczasowo na liście wyjątków (`image-budget-baseline.json`); **nowe** ponadwymiarowe obrazy blokują CI — optymalizuj/zmniejszaj źródło przed dodaniem. Po świadomej optymalizacji odśwież baseline: `node scripts/ci/check-image-budget.mjs --update-baseline`.

## Czego nie zmieniać

- **Nie zmieniaj `lang="en"`** w `PageLayout.astro` / `Seo.astro` mimo polskich treści — to celowa decyzja.
- **Zachowaj URL-e postów** (slug logic w `content.config.ts`) i przekierowanie `/resume` → `/bio/` (`astro.config.mjs`).
- **Główna gałąź to `master`** (nie `main`); deploy na GitHub Pages następuje po pushu do `master`.

## Pre-commit (Husky)

Hook uruchamia kolejno: `lint-staged` (Prettier + ESLint na staged) → `pnpm type:check` (astro check) → `scripts/presentations/validate-and-fix-metadata.sh`. Dodając PDF do `static/files/presentations/`, dopisz wpis w `metadata.csv` — w przeciwnym razie hook zablokuje commit (wymaga `exiftool`).

## Git i pull requesty

- Pisz commity oraz tytuły i opisy PR **po angielsku**, w formacie **Conventional Commits** (`docs:`, `feat:`, `fix:`, …). Tytuł PR (egzekwowany przez `pr-meta.yml`) musi trzymać się tej specyfikacji, a opis PR — wypełnić szablon `.github/pull_request_template.md` (sprawdza `scripts/ci/check-pr-template.mjs`). Zgłoszenia otwieraj formularzami z `.github/ISSUE_TEMPLATE/`.
- **Nie dodawaj atrybucji AI** — żadnych `Co-Authored-By`, `Claude-Session` ani stopek typu „Generated with Claude Code” w commitach i opisach PR. Pilnuje tego CI (`scripts/ci/check-no-ai-attribution.mjs`).
- **Po zmianie zakresu pilnuj zgodności opisu z treścią** — gdy po rebase, squashu lub odrzuceniu commitów zmieni się faktyczna zawartość gałęzi, zaktualizuj tytuł i opis commita oraz PR-a, tak aby opisywały tylko to, co realnie zostaje w diffie. Nie zostawiaj opisu sprzed zmiany zakresu.
