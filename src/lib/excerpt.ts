import { stripInlineMarkdown } from './inline-markdown';

// Approximates Gatsby's default MDX excerpt (plain-text, pruned to ~140 chars)
// for the blog listing when a post has no `description` frontmatter.
export function excerpt(body: string, length = 140): string {
  const text = body
    .replace(/```[\s\S]*?```/g, ' ') // fenced code
    .replace(/`[^`]*`/g, ' ') // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → text
    .replace(/[#>*_~|-]/g, ' ') // markdown punctuation
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= length) {
    return text;
  }
  return text.slice(0, length).replace(/\s+\S*$/, '') + '…';
}

// A sentence-preserving excerpt for meta tags. Unlike excerpt() it keeps the words
// inside code spans and hyphens, which a description cannot lose without leaving
// holes, and it drops MDX imports and JSX.
export function metaExcerpt(body: string, maxLength: number): string {
  const text = stripInlineMarkdown(
    body
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
      .replace(/^(?:import|export)\s.*$/gm, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/^\s*(?:#{1,6}\s+|>\s?|[-*]\s+|\d+\.\s+)/gm, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3).replace(/\s+\S*$/, '') + '...';
}
