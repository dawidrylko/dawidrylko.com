import { describe, it, expect } from 'vitest';
import rehypeWrapTables from './rehype-wrap-tables';

// Minimal hast-like node shapes; the plugin only inspects type/tagName/name and
// mutates children arrays, so these stand in for the real compiler output.
type Node = {
  type: string;
  tagName?: string;
  name?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
};

const run = (tree: Node): Node => {
  rehypeWrapTables()(tree);
  return tree;
};

const root = (...children: Node[]): Node => ({ type: 'root', children });
const elementTable = (): Node => ({ type: 'element', tagName: 'table', properties: {}, children: [] });
const mdxTable = (): Node => ({ type: 'mdxJsxFlowElement', name: 'table', attributes: [], children: [] }) as Node;

const isScrollDiv = (node?: Node): boolean =>
  node?.type === 'element' &&
  node.tagName === 'div' &&
  Array.isArray(node.properties?.className) &&
  (node.properties?.className as string[]).includes('table-scroll');

describe('rehypeWrapTables', () => {
  it('wraps a Markdown pipe table (hast element) in a .table-scroll div', () => {
    const tree = root(elementTable());
    run(tree);

    const wrapper = tree.children![0];
    expect(isScrollDiv(wrapper)).toBe(true);
    expect(wrapper.properties?.tabIndex).toBe(0);
    expect(wrapper.children![0].tagName).toBe('table');
  });

  it('wraps a raw <table> written in MDX (mdxJsxFlowElement)', () => {
    const tree = root(mdxTable());
    run(tree);

    const wrapper = tree.children![0];
    expect(isScrollDiv(wrapper)).toBe(true);
    expect(wrapper.children![0].type).toBe('mdxJsxFlowElement');
    expect(wrapper.children![0].name).toBe('table');
  });

  it('leaves non-table elements untouched', () => {
    const p: Node = { type: 'element', tagName: 'p', properties: {}, children: [] };
    const tree = root(p);
    run(tree);

    expect(tree.children![0]).toBe(p);
    expect(isScrollDiv(tree.children![0])).toBe(false);
  });

  it('is idempotent — does not double-wrap an already wrapped table', () => {
    const tree = root(elementTable());
    run(tree); // first pass wraps
    run(tree); // second pass must not wrap again

    const wrapper = tree.children![0];
    expect(isScrollDiv(wrapper)).toBe(true);
    // The wrapper still holds the table directly, not another wrapper.
    expect(wrapper.children![0].tagName).toBe('table');
    expect(isScrollDiv(wrapper.children![0])).toBe(false);
  });

  it('wraps a table nested inside another element (e.g. a cell)', () => {
    const cell: Node = { type: 'element', tagName: 'td', properties: {}, children: [elementTable()] };
    const tree = root(cell);
    run(tree);

    const nested = cell.children![0];
    expect(isScrollDiv(nested)).toBe(true);
    expect(nested.children![0].tagName).toBe('table');
  });
});
