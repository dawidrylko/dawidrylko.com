import type { MarkdownHeading } from 'astro';

// A single entry in the table-of-contents tree. h3 headings nest under the most
// recent h2 as `children`; h2 headings sit at the top level with their own list.
export interface TocEntry {
  slug: string;
  text: string;
  children: TocEntry[];
}

// rehype-autolink-headings appends a literal "#" anchor inside every heading, and
// Astro folds that anchor's text into the heading's `text`. Strip a single
// trailing "#" (with surrounding whitespace) so the TOC shows "Wnioski", not
// "Wnioski#".
export function cleanHeadingText(text: string): string {
  return text.replace(/\s*#\s*$/, '').trim();
}

// Turn Astro's flat h2/h3 heading list into a two-level tree. Each h3 nests under
// the preceding h2 so the rendered list numbers hierarchically (5 → 5.1) instead
// of running one flat counter across both depths (… 5, 6, 7). A leading h3 with
// no parent h2 falls back to the top level rather than being dropped.
export function buildTocTree(headings: Pick<MarkdownHeading, 'depth' | 'slug' | 'text'>[]): TocEntry[] {
  const tree: TocEntry[] = [];

  for (const heading of headings) {
    const entry: TocEntry = { slug: heading.slug, text: cleanHeadingText(heading.text), children: [] };
    const parent = tree[tree.length - 1];

    if (heading.depth === 3 && parent) {
      parent.children.push(entry);
    } else {
      tree.push(entry);
    }
  }

  return tree;
}
