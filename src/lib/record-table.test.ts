import { describe, expect, it } from 'vitest';
import { linkAttributes, recordColumnCount, toCell, type RecordLink } from './record-table';

const link = (overrides: Partial<RecordLink>): RecordLink => ({
  kind: 'page',
  icon: '→',
  href: '/a/',
  label: 'Read A',
  ...overrides,
});

describe('linkAttributes', () => {
  it('keeps an internal page link in the same tab', () => {
    expect(linkAttributes(link({}))).toEqual({ href: '/a/', 'aria-label': 'Read A', title: 'Read A' });
  });

  it('opens a file in a new tab without nofollow', () => {
    expect(linkAttributes(link({ kind: 'open' }))).toMatchObject({ target: '_blank', rel: 'noopener noreferrer' });
  });

  it('marks an external link nofollow unless it is followed', () => {
    expect(linkAttributes(link({ kind: 'external' })).rel).toBe('noopener noreferrer nofollow');
    expect(linkAttributes(link({ kind: 'external', follow: true })).rel).toBe('noopener noreferrer');
  });

  it('downloads with the given file name or the server one', () => {
    expect(linkAttributes(link({ kind: 'download' })).download).toBe('');
    expect(linkAttributes(link({ kind: 'download', download: 'a.pdf' })).download).toBe('a.pdf');
    expect(linkAttributes(link({ kind: 'download' })).target).toBeUndefined();
  });

  it('prefers an explicit tooltip over the label', () => {
    expect(linkAttributes(link({ title: 'Open PDF (3 MB)' })).title).toBe('Open PDF (3 MB)');
  });
});

describe('table shape', () => {
  it('counts the Links column on top of the data columns', () => {
    expect(recordColumnCount([{ label: 'Title' }, { label: 'Year' }])).toBe(3);
  });

  it('wraps a plain string into a cell', () => {
    expect(toCell('PL')).toEqual({ text: 'PL' });
    expect(toCell({ text: 'A', secondary: 'B' })).toEqual({ text: 'A', secondary: 'B' });
  });
});
