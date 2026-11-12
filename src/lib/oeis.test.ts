import { describe, it, expect } from 'vitest';
import data from '../data/oeis.json';
import { oeisAnchor, oeisEntriesSchema, oeisEntrySchema, oeisUrl, sortOeisEntries, type OeisEntry } from './oeis';

const author: OeisEntry = { id: 'A401670', name: 'A sequence.', role: 'author', date: '2026-11-01' };
const contributor: OeisEntry = { id: 'A004003', name: 'Another.', role: 'contributor', contribution: ['b-file'] };

describe('oeis data', () => {
  it('validates the shipped records', () => {
    expect(oeisEntriesSchema.safeParse(data).success).toBe(true);
  });

  it('rejects duplicate ids', () => {
    expect(oeisEntriesSchema.safeParse([author, author]).success).toBe(false);
  });
});

describe('oeisEntrySchema', () => {
  it('rejects a malformed A-number', () => {
    expect(oeisEntrySchema.safeParse({ ...author, id: 'A40167' }).success).toBe(false);
    expect(oeisEntrySchema.safeParse({ ...author, id: 'a401670' }).success).toBe(false);
  });

  it('requires a contributor to say what was contributed', () => {
    expect(oeisEntrySchema.safeParse({ ...contributor, contribution: undefined }).success).toBe(false);
  });

  it('rejects an impossible date', () => {
    expect(oeisEntrySchema.safeParse({ ...author, date: '2026-02-30' }).success).toBe(false);
  });
});

describe('oeis helpers', () => {
  it('links and anchors by A-number', () => {
    expect(oeisUrl('A401670')).toBe('https://oeis.org/A401670');
    expect(oeisAnchor('A401670')).toBe('oeis-a401670');
  });

  it('lists authored sequences first, newest A-number first', () => {
    const older = { ...author, id: 'A401669' };
    expect(sortOeisEntries([contributor, older, author]).map(({ id }) => id)).toEqual([
      'A401670',
      'A401669',
      'A004003',
    ]);
  });
});
