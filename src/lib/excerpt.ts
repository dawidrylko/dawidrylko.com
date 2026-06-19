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
