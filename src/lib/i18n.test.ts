import { describe, it, expect } from 'vitest';
import { SITE_METADATA } from '../data/site-metadata';
import { DEFAULT_LANG, CONTENT_LANG, SUPPORTED_LANGS, OG_LOCALES, isSupportedLang, toOgLocale } from './i18n';

describe('language constants', () => {
  it('uses the site-metadata language as the shell default', () => {
    expect(DEFAULT_LANG).toBe(SITE_METADATA.lang);
  });

  it('ships English shell and Polish content as distinct languages', () => {
    expect(DEFAULT_LANG).toBe('en');
    expect(CONTENT_LANG).toBe('pl');
    expect(DEFAULT_LANG).not.toBe(CONTENT_LANG);
  });

  it('lists every supported language with the shell first', () => {
    expect(SUPPORTED_LANGS).toEqual(['en', 'pl']);
  });

  it('maps an Open Graph locale for every supported language', () => {
    for (const lang of SUPPORTED_LANGS) {
      expect(OG_LOCALES[lang]).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
    }
  });
});

describe('isSupportedLang', () => {
  it('accepts the languages the site ships', () => {
    expect(isSupportedLang('en')).toBe(true);
    expect(isSupportedLang('pl')).toBe(true);
  });

  it('rejects languages the site does not ship', () => {
    expect(isSupportedLang('de')).toBe(false);
    expect(isSupportedLang('')).toBe(false);
  });
});

describe('toOgLocale', () => {
  it('maps a BCP-47 tag to its Open Graph locale', () => {
    expect(toOgLocale('en')).toBe('en_US');
    expect(toOgLocale('pl')).toBe('pl_PL');
  });

  it('falls back to the raw tag for unmapped languages so the tag is never empty', () => {
    expect(toOgLocale('fr')).toBe('fr');
  });
});
