import { describe, it, expect } from 'vitest';
import { slugifyTag } from './slugify-tag';

describe('slugifyTag', () => {
  it('lowercases and keeps simple tags', () => {
    expect(slugifyTag('JavaScript')).toBe('javascript');
    expect(slugifyTag('css')).toBe('css');
  });

  it('collapses dots and spaces into single hyphens', () => {
    expect(slugifyTag('Node.js')).toBe('node-js');
    expect(slugifyTag('frontend development')).toBe('frontend-development');
    expect(slugifyTag('shopping   manager')).toBe('shopping-manager');
  });

  it('strips Polish diacritics (including ł)', () => {
    expect(slugifyTag('Łódź')).toBe('lodz');
    expect(slugifyTag('Zażółć')).toBe('zazolc');
  });

  it('trims leading and trailing separators', () => {
    expect(slugifyTag('C++')).toBe('c');
    expect(slugifyTag('.NET')).toBe('net');
  });
});
