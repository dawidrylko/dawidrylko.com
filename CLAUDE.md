# dawidrylko.com

Instrukcje dla Claude Code. Blog i portfolio Dawida Ryłko: Gatsby v5 + React 18 + TypeScript + MDX, hostowane na GitHub Pages.

**Zakres pracy:** narzędzia i kod wspierający bloga — komponenty, szablony, konfiguracja Gatsby, skrypty pomocnicze (`helpers/`), hooki i CI/CD. Treść postów w `content/pl/` pisze autor ręcznie; nie twórz ani nie edytuj postów blogowych.

## Polecenia

```bash
pnpm develop        # serwer deweloperski (localhost:8000)
pnpm build          # produkcyjny build
pnpm clean          # czyści .cache/ i public/
pnpm type:check     # walidacja TypeScript (tsc --noEmit)
pnpm format:write   # Prettier — formatowanie
pnpm format:check   # Prettier — sprawdzenie
pnpm lint:fix       # ESLint — napraw
pnpm lint:check     # ESLint — sprawdź
```

Przed zatwierdzeniem zmian uruchom `pnpm type:check` i `pnpm format:check`. Nie pisz ani nie uruchamiaj testów jednostkowych — projekt nie ma frameworka testowego.

## Stos i struktura

- **Stack:** Gatsby 5.16 (GraphQL + gatsby-plugin-mdx), React 18, pnpm, Node v24 (`.nvmrc`).
- **Treść:** posty MDX w `content/pl/`.
- **Typy GraphQL:** `src/gatsby-types.d.ts` generowane automatycznie (graphqlTypegen, w `.gitignore`) — nie edytuj ręcznie.

```
src/components/    # Komponenty React (layout, bio, menu, seo, breadcrumbs, table, mermaid-diagram)
src/pages/         # Strony Gatsby (index, blog, bio, contact, setup, metadata, files, 404)
src/templates/     # blog-post.tsx — szablon posta
src/hooks/         # useSiteMetadata, useStructuredData
src/constants/     # site-metadata.ts, structured-data.ts, gtag.tsx
src/styles/        # main.css (design tokens — CSS custom properties), normalize.css
content/pl/        # Posty blogowe MDX
static/files/      # Pliki statyczne (prezentacje PDF/KEY/PPTX, CV)
.github/workflows/ # ci.yml (PR), cd.yml (deploy na GH Pages)
```

## Model treści (kontekst przy pracy nad kodem)

Te fakty są potrzebne, gdy modyfikujesz szablony, `gatsby-node.ts`, RSS lub sitemap — nie po to, by pisać posty:

- Post to katalog `content/pl/YYYY-MM-DD--slug-po-polsku/index.mdx`.
- Slug URL powstaje przez usunięcie prefiksu daty (`filePath.replace(/.*--/, '/')` w `gatsby-node.ts`): `2025-12-26--od-tablicy-do-mapy` → `/od-tablicy-do-mapy/`.
- Frontmatter: `title`, `description`, `date`, `tags`, opcjonalnie `featuredImg` + `featuredImgAlt`.
- Renderowanie MDX wspiera Prism.js (kod), KaTeX (matematyka) i Mermaid (diagramy).

## Konwencje kodu

- **Komponenty:** typ `FC` (named import z `react`) z interfejsem TypeScript, nazwy PascalCase. Automatic JSX runtime (`jsx: react-jsx` + `jsxRuntime: 'automatic'` w gatsby-config) — bez `import * as React`; hooki, `Fragment`, `ReactNode` itp. importuj imiennie.
- **Pliki:** kebab-case (np. `mermaid-diagram.tsx`). **Stałe:** UPPER_SNAKE_CASE.
- **Style:** czyste CSS z custom properties (design tokens), bez preprocesorów; Montserrat (nagłówki), Merriweather (tekst).
- **Dane strukturalne:** react-schemaorg + schema-dts (JSON-LD).
- **Prettier (TS/TSX):** single quotes, średniki, 2 spacje, `printWidth: 120`, `arrowParens: avoid`.
- **Komentarze:** tylko po angielsku i tylko te realnie wartościowe — wyjaśniaj „dlaczego”, a nie to, co kod już mówi sam.

## Czego nie zmieniać

- **Nie aktualizuj `katex`** (przypięty do 0.13.3, ignorowany przez Dependabot) bez weryfikacji zgodności z gatsby-remark-katex.
- **Nie ruszaj override `sharp: 0.33.3`** w `pnpm-workspace.yaml` — wymóg zgodności z Gatsby.
- **Nie zmieniaj `lang="en"`** w `site-metadata.ts` i `gatsby-ssr.tsx` mimo polskich treści — to celowa decyzja.
- **Główna gałąź to `master`** (nie `main`); deploy na GitHub Pages następuje po pushu do `master`.

## Pre-commit (Husky)

Hook uruchamia kolejno: `lint-staged` (Prettier + ESLint na staged) → `pnpm type:check` → `validate-and-fix-presentations-metadata.sh`. Dodając PDF do `static/files/presentations/`, dopisz wpis w `metadata.csv` — w przeciwnym razie hook zablokuje commit (wymaga `exiftool`).

## Git i pull requesty

- Pisz commity oraz tytuły i opisy PR **po angielsku**, w formacie **Conventional Commits** (`docs:`, `feat:`, `fix:`, …).
- **Nie dodawaj atrybucji AI** — żadnych `Co-Authored-By`, `Claude-Session` ani stopek typu „Generated with Claude Code” w commitach i opisach PR.
