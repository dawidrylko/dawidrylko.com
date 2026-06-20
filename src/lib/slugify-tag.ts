// Build a URL-safe slug for a tag. Mirrors the blog search normaliser
// (lowercase, strip diacritics, ł→l — ł is not a decomposable combining mark)
// then collapses every run of non-alphanumeric characters to a single hyphen so
// "Node.js" → "node-js" and "frontend development" → "frontend-development".
//
// Kept dependency-free (no astro:content) so the client-side blog search bundle
// can import it directly without pulling in server-only modules.
export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
