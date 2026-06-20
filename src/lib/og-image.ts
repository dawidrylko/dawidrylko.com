import { SITE_METADATA } from '../data/site-metadata';

// Open Graph card dimensions (the de-facto 1.91:1 standard).
const WIDTH = 1200;
const HEIGHT = 630;

// Title layout. Values are tuned for the generic sans-serif the rasteriser
// falls back to; they leave margin so even the widest line stays on the card.
const TITLE_FONT_SIZE = 64;
const TITLE_LINE_HEIGHT = 82;
const TITLE_MAX_CHARS = 24;
const TITLE_MAX_LINES = 4;

// Greedily wrap text into at most `maxLines` lines of roughly `maxChars` each,
// breaking on spaces only (a word longer than the limit stays whole). When the
// text does not fit, the last kept line is ellipsised.
export function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || current === '') {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);

  if (lines.length <= maxLines) return lines;

  const kept = lines.slice(0, maxLines);
  const last = kept[maxLines - 1];
  kept[maxLines - 1] = `${last.length > maxChars - 1 ? last.slice(0, maxChars - 1).trimEnd() : last}…`;
  return kept;
}

const escapeXml = (value: string): string =>
  value.replace(/[&<>"']/g, char => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });

// Build the OG card SVG: brand-coloured background, a small eyebrow, the wrapped
// post title and a footer with the site name. Exported for testing/inspection.
export function buildOgSvg(title: string): string {
  const lines = wrapText(title, TITLE_MAX_CHARS, TITLE_MAX_LINES);
  const blockHeight = lines.length * TITLE_LINE_HEIGHT;
  const startY = (HEIGHT - blockHeight) / 2 + TITLE_FONT_SIZE;

  const tspans = lines
    .map((line, index) => `<tspan x="80" y="${startY + index * TITLE_LINE_HEIGHT}">${escapeXml(line)}</tspan>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#005b99"/>
  <rect width="${WIDTH}" height="12" fill="#5eb3f0"/>
  <text x="80" y="120" font-family="sans-serif" font-size="32" font-weight="700" letter-spacing="4" fill="#a9d3f2">BLOG</text>
  <text font-family="sans-serif" font-size="${TITLE_FONT_SIZE}" font-weight="700" fill="#ffffff">${tspans}</text>
  <text x="80" y="560" font-family="sans-serif" font-size="32" fill="#d1dce5">${escapeXml(SITE_METADATA.author.name)} · dawidrylko.com</text>
</svg>`;
}

// Rasterise the OG card to a PNG buffer. sharp is imported lazily so the unit
// tests (which only exercise the pure helpers) never load the native binding.
export async function renderOgImage(title: string): Promise<Buffer> {
  const { default: sharp } = await import('sharp');
  return sharp(Buffer.from(buildOgSvg(title)))
    .png()
    .toBuffer();
}
