import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  isDeadEndPage,
  tagArchiveViolation,
  tagHubViolation,
  countArchivePosts,
  POST_LIST_ITEM_TAG,
  TAG_INDEX_MIN_POSTS,
} from './robots-directives.mjs';

const robots = content => `<meta name="robots" content="${content}" />`;

describe('isDeadEndPage', () => {
  it('treats "noindex, nofollow" as a dead end (the 404)', () => {
    expect(isDeadEndPage(robots('noindex, nofollow'))).toBe(true);
  });

  it('does not treat "noindex, follow" as a dead end (a thin tag archive)', () => {
    expect(isDeadEndPage(robots('noindex, follow'))).toBe(false);
  });

  it('does not treat an indexable page as a dead end', () => {
    expect(isDeadEndPage(robots('index, follow, max-image-preview:large, max-snippet:-1'))).toBe(false);
  });

  it('returns false when the page declares no robots meta at all', () => {
    expect(isDeadEndPage('<head><title>Hi</title></head>')).toBe(false);
  });

  it('ignores the word nofollow outside the robots meta', () => {
    expect(isDeadEndPage(`${robots('noindex, follow')}<a rel="nofollow" href="/x">x</a>`)).toBe(false);
  });

  it('matches regardless of directive casing and spacing', () => {
    expect(isDeadEndPage('<meta name="robots" content="NoIndex,NoFollow">')).toBe(true);
  });
});

const archive = (posts, robotsContent) =>
  `<meta name="robots" content="${robotsContent}" />` + `${POST_LIST_ITEM_TAG}x</article>`.repeat(posts);

describe('countArchivePosts', () => {
  it('counts the rendered post entries', () => {
    expect(countArchivePosts(archive(0, 'noindex, follow'))).toBe(0);
    expect(countArchivePosts(archive(4, 'noindex, follow'))).toBe(4);
    expect(countArchivePosts(archive(18, 'index, follow'))).toBe(18);
  });
});

describe('tagArchiveViolation', () => {
  it('accepts a thin archive kept out of the index', () => {
    expect(tagArchiveViolation(archive(TAG_INDEX_MIN_POSTS - 1, 'noindex, follow'))).toBeNull();
  });

  it('accepts an archive at the threshold staying indexable', () => {
    expect(tagArchiveViolation(archive(TAG_INDEX_MIN_POSTS, 'index, follow, max-snippet:-1'))).toBeNull();
  });

  it('flags a thin archive that is still indexable', () => {
    expect(tagArchiveViolation(archive(1, 'index, follow'))).toMatch(/1 post\(s\) and must be noindex/);
  });

  it('flags a large archive that got excluded', () => {
    expect(tagArchiveViolation(archive(18, 'noindex, follow'))).toMatch(/18 post\(s\) and must stay indexable/);
  });

  it('catches the wiring being dropped for every thin archive at once', () => {
    const reverted = [1, 2, 4].map(n => tagArchiveViolation(archive(n, 'index, follow')));
    expect(reverted.every(v => v !== null)).toBe(true);
  });
});

describe('POST_LIST_ITEM_TAG', () => {
  // Guards the one coupling the archive contract cannot detect at runtime: if the
  // list template stops emitting this exact tag, every archive counts zero posts,
  // the contract demands noindex everywhere, and applying that "fix" would drop
  // all 22 archives from the index while staying green.
  it('is still the wrapper the post list template emits', () => {
    const template = readFileSync(new URL('../../src/components/PostListItem.astro', import.meta.url), 'utf8');
    expect(template).toContain(POST_LIST_ITEM_TAG);
  });
});

describe('tagArchiveViolation, dead-end axis', () => {
  it('rejects a thin archive marked as a dead end instead of noindex, follow', () => {
    expect(tagArchiveViolation(archive(2, 'noindex, nofollow'))).toMatch(/must be "noindex, follow", not a dead end/);
  });

  it('still accepts the same archive as noindex, follow', () => {
    expect(tagArchiveViolation(archive(2, 'noindex, follow'))).toBeNull();
  });
});

describe('tagHubViolation', () => {
  it('accepts the indexable hub', () => {
    expect(tagHubViolation('<meta name="robots" content="index, follow, max-snippet:-1" />')).toBeNull();
  });

  it('flags a hub taken out of the index', () => {
    expect(tagHubViolation('<meta name="robots" content="noindex, follow" />')).toMatch(/must stay indexable/);
  });

  it('flags a hub turned into a dead end', () => {
    expect(tagHubViolation('<meta name="robots" content="noindex, nofollow" />')).toMatch(/must stay indexable/);
  });

  it('does not depend on how many archives the hub lists', () => {
    // Unlike an archive, the hub is judged on its directive alone: it lists
    // archives, not posts, so countArchivePosts reports zero for it.
    expect(tagHubViolation('<meta name="robots" content="index, follow" />')).toBeNull();
  });
});
