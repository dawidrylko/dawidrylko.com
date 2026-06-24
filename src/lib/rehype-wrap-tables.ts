// Rehype plugin: wrap every content table in <div class="table-scroll">.
//
// A bare <table> styled `display: block; overflow-x: auto` (the base rule in
// main.css) scrolls when wide but, because a block-level table wraps its rows in
// an anonymous shrink-to-content table box, its cells do NOT stretch to fill the
// column — short tables leave an empty gap on the right at desktop widths. App
// pages (setup, bio, metadata, files) avoid this by hand-wrapping their tables in
// .table-scroll, where the wrapper owns the scroll/border and the inner table is
// `display: table; width: 100%` so it fills (and still scrolls when wider). MDX
// post content can't hand-wrap (authors write plain Markdown / raw HTML), so this
// plugin applies the same wrapper automatically at build time.
//
// Two node shapes must be handled: Markdown pipe tables compile to a hast element
// (tagName "table"), while a raw <table> written in an .mdx file compiles to an
// mdxJsxFlowElement (name "table"). Already-wrapped tables are left untouched so
// the transform is idempotent.

interface Node {
  type: string;
  tagName?: string;
  name?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
  [key: string]: unknown;
}

const TABLE_SCROLL_CLASS = 'table-scroll';

const isTable = (node: Node): boolean =>
  (node.type === 'element' && node.tagName === 'table') || (node.type === 'mdxJsxFlowElement' && node.name === 'table');

const isTableScrollDiv = (node: Node): boolean => {
  if (node.type !== 'element' || node.tagName !== 'div') return false;
  const className = node.properties?.className;
  return Array.isArray(className) && className.includes(TABLE_SCROLL_CLASS);
};

// tabIndex makes the scroll container keyboard-focusable so the overflow can be
// reached without a pointer — matching the hand-wrapped tables on the app pages.
const wrap = (table: Node): Node => ({
  type: 'element',
  tagName: 'div',
  properties: { className: [TABLE_SCROLL_CLASS], tabIndex: 0 },
  children: [table],
});

const transform = (node: Node): void => {
  const children = node.children;
  if (!children) return;

  const skipWrap = isTableScrollDiv(node);
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isTable(child) && !skipWrap) {
      children[i] = wrap(child);
      transform(child); // descend into the original table for any nested tables
    } else {
      transform(child);
    }
  }
};

export default function rehypeWrapTables() {
  // unified hands the transformer a hast Root, a structural superset of the
  // minimal Node shape traversed here. Accept it as `unknown` and narrow at this
  // single seam so the plugin stays assignable to rehype's RehypePlugin type
  // (a Transformer<Root, Root>) when registered in astro.config.mjs.
  return (tree: unknown): void => transform(tree as Node);
}
