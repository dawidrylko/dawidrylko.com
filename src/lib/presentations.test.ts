import { describe, it, expect } from 'vitest';
import { parseFileName, formatFileSize, parsePresentationMetadata } from './presentations';

describe('parseFileName', () => {
  it('parses a well-formed presentation filename', () => {
    expect(parseFileName('js_01_node_pl')).toEqual({
      topic: 'js',
      order: 1,
      title: 'node',
      language: 'PL',
    });
  });

  it('keeps multi-segment titles intact', () => {
    expect(parseFileName('js_03_npm_tools_pl')).toEqual({
      topic: 'js',
      order: 3,
      title: 'npm_tools',
      language: 'PL',
    });
  });

  it('returns null when there are too few segments', () => {
    expect(parseFileName('js_01_node')).toBeNull();
    expect(parseFileName('readme')).toBeNull();
  });
});

describe('formatFileSize', () => {
  it('formats zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('formats kilobytes and megabytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(3288020)).toBe('3.14 MB');
  });
});

describe('parsePresentationMetadata', () => {
  const csv = [
    'filename,title,subject,keywords',
    'js_01_node_pl,"JavaScript | Wstęp do Node.js - NODE, NVM, NPM…","Node.js","JavaScript, Node.js, NVM, NPM"',
    'js_02_npm_pl,"JavaScript | NPM - package.json, zależności…","NPM","JavaScript, NPM, package.json"',
  ].join('\n');

  it('maps each filename to its descriptive metadata', () => {
    const map = parsePresentationMetadata(csv);
    expect(map.get('js_01_node_pl')).toEqual({
      title: 'JavaScript | Wstęp do Node.js - NODE, NVM, NPM…',
      subject: 'Node.js',
      keywords: 'JavaScript, Node.js, NVM, NPM',
    });
  });

  it('keeps commas inside quoted fields', () => {
    const map = parsePresentationMetadata(csv);
    expect(map.get('js_02_npm_pl')?.title).toBe('JavaScript | NPM - package.json, zależności…');
    expect(map.get('js_02_npm_pl')?.keywords).toBe('JavaScript, NPM, package.json');
  });

  it('ignores the header row and blank lines', () => {
    const map = parsePresentationMetadata(`${csv}\n\n`);
    expect(map.has('filename')).toBe(false);
    expect(map.size).toBe(2);
  });

  it('returns an empty map for empty input', () => {
    expect(parsePresentationMetadata('').size).toBe(0);
  });

  it('unescapes doubled quotes inside a field', () => {
    const map = parsePresentationMetadata('filename,title,subject,keywords\nx_01_y_pl,"A ""quoted"" title","S","k"');
    expect(map.get('x_01_y_pl')?.title).toBe('A "quoted" title');
  });
});
