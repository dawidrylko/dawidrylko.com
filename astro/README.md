# Astro migration (PoC) — dawidrylko.com

Spike for roadmap **point 14** (Gatsby → Astro). This project lives **alongside**
the Gatsby site and is **not** wired into production — the live site stays on
Gatsby until the cutover phase. It implements **Phase 0 (PoC)** and **Phase 1
(scaffold/config)** of the migration plan.

## What this validates

Built against the real `../content/pl` posts (no content was copied or edited):

- **Content Collection** with the `glob()` loader reading `../content/pl/**/index.{md,mdx}`,
  with the **zod** frontmatter schema ported 1:1 from Gatsby (incl. _featuredImg ⇒
  featuredImgAlt_). All 39 posts pass validation.
- **URL parity** — the slug is the directory name minus the date prefix
  (`/.*--/` → ``), identical to Gatsby, so URLs are preserved.
- **KaTeX** math via `remark-math` + `rehype-katex`, rendered at build time
  (modern `katex` 0.17 — no longer pinned to 0.13.3 like Gatsby).
- **Shiki** syntax highlighting with light/dark themes (replaces Prism).
- **Image optimization** via `astro:assets` + `sharp` (featured + colocated body
  images → `webp`).
- **React islands** via `@astrojs/react`: a Mermaid diagram (`client:visible`) and
  a demo component imported **inside MDX** (the memoization post).

Representative posts rendered in the spike (see `src/pages/[...slug].astro`):
`od-tablicy-do-mapy-harry-potter-i-transmutacja` (KaTeX), `domino-tiling` (code +
featured image), `memoizacja-harry-potter-i-myslodsiewnia` (React-in-MDX).

## Commands

```bash
cd astro
pnpm install      # isolated: astro/ is its own pnpm root (see pnpm-workspace.yaml)
pnpm dev
pnpm build        # → astro/dist
pnpm type:check   # astro check
pnpm lint:check
pnpm format:check
```

## Findings to carry into the next phases

- **`sharp` must be a direct dependency** here. Astro's optional transitive `sharp`
  is not resolvable under pnpm's strict layout, so it is added explicitly.
- **`astro/` is isolated as its own pnpm root** (empty `pnpm-workspace.yaml`) to
  avoid the Gatsby workspace and its `sharp: 0.33.3` override; Astro uses `sharp`
  0.35.
- **Interactive React inside MDX needs a `client:*` directive.** The memoization
  demo currently renders **static** (SSR) because the post writes `<MemoizationDemo />`
  with no directive. Making it interactive requires either editing that post to add
  `client:visible`, or providing the component through a hydrated wrapper — to be
  decided in Phase 2/3 (note: editing post content is normally out of scope).
- **`markdown.remarkPlugins`/`rehypePlugins` are deprecated in Astro 6** (works, but
  emits a warning). Migrate to the `@astrojs/markdown-remark` `unified()` config in
  Phase 1 follow-up.
- Still **TODO in later phases** (not part of this PoC): full routing for all posts
  (Phase 2), layout/components/SEO/JSON-LD parity (Phase 3), RSS + manifest + web
  vitals (Phase 5), and CI/CD wiring (Phase 6).
