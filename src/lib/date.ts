// Centralised date formatting so the blog listing, post pages and the search
// index render dates identically. Polish locale, long month, zero-padded day —
// e.g. "26 grudnia 2025".
const POLISH_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
};

export function formatPolishDate(date: Date): string {
  return date.toLocaleDateString('pl-PL', POLISH_DATE_FORMAT);
}

// Machine-readable timestamp for JSON-LD / Open Graph (`datePublished`, etc.).
export function toISODate(date: Date): string {
  return date.toISOString();
}
