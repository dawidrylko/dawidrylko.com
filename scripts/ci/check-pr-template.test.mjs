import { describe, expect, it } from 'vitest';
import { validatePrBody } from './check-pr-template.mjs';

// A description that satisfies every rule: all sections present, the
// Description filled in, and one Type-of-change box ticked.
const VALID_BODY = `## Description

Adds a reading-time estimate to blog posts.

## Type of change

- [x] feat — a new feature
- [ ] fix — a bug fix

## Related issue

Closes #123

## Checklist

- [ ] checks pass locally
`;

// The committed template with nothing filled in (comments only, no ticks).
const EMPTY_TEMPLATE = `## Description

<!-- Replace this comment with what the PR changes and why. -->

## Type of change

- [ ] feat — a new feature

## Related issue

<!-- e.g. "Closes #123", or "none". -->

## Checklist

- [ ] checks pass locally
`;

describe('validatePrBody', () => {
  it('accepts a fully filled-in description', () => {
    expect(validatePrBody(VALID_BODY)).toEqual([]);
  });

  it('rejects an empty body', () => {
    expect(validatePrBody('')).toHaveLength(1);
    expect(validatePrBody(undefined)).toHaveLength(1);
    expect(validatePrBody('   \n  ')).toHaveLength(1);
  });

  it('rejects a body missing a required section', () => {
    const body = VALID_BODY.replace('## Related issue', '## Unrelated heading');
    expect(validatePrBody(body)).toContainEqual(expect.stringContaining('## Related issue'));
  });

  it('rejects an empty Description section (comment only)', () => {
    expect(validatePrBody(EMPTY_TEMPLATE)).toContainEqual(expect.stringContaining('## Description'));
  });

  it('rejects when no Type-of-change box is ticked', () => {
    const body = VALID_BODY.replace('- [x] feat — a new feature', '- [ ] feat — a new feature');
    expect(validatePrBody(body)).toContainEqual(expect.stringContaining('Type of change'));
  });

  it('treats a Description with only overlapping comments as empty', () => {
    // A single regex pass strips this to "<!-- -->" (re-exposing a comment);
    // the fixpoint loop removes it fully, so the section counts as empty.
    const body = VALID_BODY.replace('Adds a reading-time estimate to blog posts.', '<<!-- -->!-- -->');
    expect(validatePrBody(body)).toContainEqual(expect.stringContaining('## Description'));
  });
});
