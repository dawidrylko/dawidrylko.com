// Remark plugin for the sources section a post ends with: a top-level
// `## Źródła` heading followed by a list of links.
//
// It does two things at build time, without touching the authored content:
//   - renders that list as an ordered list whose items carry stable anchors
//     (`zrodlo-1`, `zrodlo-2`, ...), so a source can be deep-linked and cited
//     by number whether the author wrote `-` or `1.`;
//   - exposes the linked items as `sources` on the remark frontmatter, which
//     `render()` returns as `remarkPluginFrontmatter`, so the post page can emit
//     them as `citation` in its BlogPosting JSON-LD from the same parse.
//
// Item names follow how the posts write sources: an item that opens with its
// link ("[Title | Publisher](url) - note") is named by the link text alone, an
// item that opens with prose ("Author (2003), "Title", [venue](url).") by its
// whole text. Items without an absolute link are numbered but not cited.

interface Node {
  type: string;
  depth?: number;
  ordered?: boolean | null;
  start?: number | null;
  url?: string;
  value?: string;
  children?: Node[];
  data?: { hProperties?: Record<string, unknown>; [key: string]: unknown };
}

interface File {
  data: { astro?: { frontmatter?: Record<string, unknown> } };
}

export interface Source {
  name: string;
  url: string;
}

export const SOURCES_HEADING = 'Źródła';
export const SOURCE_ANCHOR_PREFIX = 'zrodlo-';

const textOf = (node: Node): string =>
  node.value !== undefined && (node.type === 'text' || node.type === 'inlineCode')
    ? node.value
    : (node.children ?? []).map(textOf).join('');

const normalize = (text: string): string => text.replace(/\s+/g, ' ').trim();

const isSourcesHeading = (node: Node): boolean =>
  node.type === 'heading' && node.depth === 2 && normalize(textOf(node)).replace(/:$/, '') === SOURCES_HEADING;

const firstLink = (node: Node): Node | undefined => {
  if (node.type === 'link' && /^https?:\/\//.test(node.url ?? '')) return node;
  for (const child of node.children ?? []) {
    const link = firstLink(child);
    if (link) return link;
  }
  return undefined;
};

const sourceOf = (item: Node): Source | undefined => {
  const link = firstLink(item);
  if (!link?.url) return undefined;
  const first = item.children?.[0];
  const lead = first?.type === 'paragraph' ? first.children?.[0] : first;
  const name = normalize(lead === link ? textOf(link) : textOf(item)).replace(/\.$/, '');
  return name ? { name, url: link.url } : undefined;
};

export const transformSources = (tree: Node): Source[] => {
  const children = tree.children ?? [];
  const heading = children.findIndex(isSourcesHeading);
  const list = heading === -1 ? undefined : children[heading + 1];
  if (!list || list.type !== 'list') return [];

  list.ordered = true;
  list.start = 1;
  const sources: Source[] = [];
  (list.children ?? []).forEach((item, index) => {
    item.data = { ...item.data, hProperties: { ...item.data?.hProperties, id: `${SOURCE_ANCHOR_PREFIX}${index + 1}` } };
    const source = sourceOf(item);
    if (source) sources.push(source);
  });
  return sources;
};

export default function remarkSources() {
  // Typed loosely at this seam for the same reason as rehype-wrap-tables.ts:
  // the mdast Root and VFile are structural supersets of the shapes used here.
  return (tree: unknown, file: unknown): void => {
    const sources = transformSources(tree as Node);
    if (sources.length === 0) return;
    const data = (file as File).data;
    data.astro ??= {};
    data.astro.frontmatter ??= {};
    data.astro.frontmatter.sources = sources;
  };
}

export const toCitation = (sources: readonly Source[] | undefined) =>
  sources?.length ? sources.map(({ name, url }) => ({ '@type': 'CreativeWork', name, url })) : undefined;
