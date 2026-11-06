import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import MemoizationDemo from './memoization-demo';

describe('MemoizationDemo server render', () => {
  it('renders no build-time timestamp the browser could not reproduce', () => {
    const html = renderToString(createElement(MemoizationDemo));
    expect(html).toContain('Welcome to the Pensieve');
    expect(html).not.toMatch(/\d{2}:\d{2}:\d{2}\.\d{3}/);
  });
});
