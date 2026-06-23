import { SITE_METADATA } from '../data/site-metadata';

/**
 * Single source of truth for the site's PL/EN language strategy.
 *
 * The site is bilingual at the *site* level, monolingual per URL: an English
 * "shell" (home, /bio/, /contact/, /setup/, /metadata/, /files/, 404) wraps a
 * Polish content zone (the blog at /blog/, individual posts, and /tags/). Each
 * page therefore declares exactly one language — `<html lang>` (set by the
 * layout from each page's `lang` prop), `og:locale`, JSON-LD `inLanguage` and
 * the hreflang annotations all agree on it.
 *
 * `DEFAULT_LANG` is the shell language used when a page passes no `lang`; the
 * Polish content pages opt in explicitly via `CONTENT_LANG`. Keeping these — and
 * the BCP-47 → Open Graph locale mapping — in one module stops the language
 * codes drifting apart across the layout, the SEO head and the build contract.
 */

/** Shell language: used by every page that does not opt into Polish. */
export const DEFAULT_LANG = SITE_METADATA.lang;

/** Content-zone language: the blog, individual posts and the tag archive. */
export const CONTENT_LANG = 'pl';

/** Every language the site ships, in priority order (shell first). */
export const SUPPORTED_LANGS = [DEFAULT_LANG, CONTENT_LANG] as const;

export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

/** BCP-47 language tag → Open Graph `og:locale` (language_TERRITORY). */
export const OG_LOCALES: Record<string, string> = {
  en: 'en_US',
  pl: 'pl_PL',
};

/** Whether a language code is one the site actually ships. */
export const isSupportedLang = (lang: string): lang is SupportedLang =>
  (SUPPORTED_LANGS as readonly string[]).includes(lang);

/**
 * Open Graph locale for a page's language. Falls back to the raw tag for any
 * value missing from the map so the meta tag is never emitted empty.
 */
export const toOgLocale = (lang: string): string => OG_LOCALES[lang] ?? lang;
