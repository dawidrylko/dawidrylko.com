export const RECORD_DETAILS_LABEL = 'Details';
export const RECORD_LINKS_LABEL = 'Links';
export const RECORD_NO_LINKS = '—';

// Two icons for every link on the site: one opens (a page here or elsewhere, or
// a file in the browser), one downloads. The file type lives in the label and
// tooltip, never in the icon. Inline SVG paths on a 24-unit grid drawn with the
// same stroke, because text arrows fall back to different fonts and come out
// in different sizes.
export const LINK_ICONS = {
  open: 'M7 17 17 7M9 7h8v8',
  download: 'M12 4v11m-5-5 5 5 5-5M5 20h14',
} as const;

export type LinkIcon = keyof typeof LINK_ICONS;

export type ColumnWidth = 'w-5' | 'w-10' | 'w-15' | 'w-20' | 'w-30' | 'w-35' | 'w-70' | 'w-90';

export interface RecordColumn {
  label: string;
  width?: ColumnWidth;
  wrap?: boolean;
  primary?: boolean;
}

export interface RecordCell {
  text: string;
  secondary?: string;
  datetime?: string;
}

export type RecordLinkKind = 'page' | 'external' | 'open' | 'download';

export interface RecordLink {
  kind: RecordLinkKind;
  href: string;
  label: string;
  title?: string;
  download?: string;
  follow?: boolean;
  hidden?: boolean;
}

export interface RecordDetail {
  label?: string;
  text?: string;
  html?: string;
}

export interface RecordRow {
  id?: string;
  cells: (string | RecordCell)[];
  links: RecordLink[];
  details?: RecordDetail[];
}

export const linkIcon = (kind: RecordLinkKind): LinkIcon => (kind === 'download' ? 'download' : 'open');

export const toCell = (cell: string | RecordCell): RecordCell => (typeof cell === 'string' ? { text: cell } : cell);

export function linkAttributes({ kind, href, label, title, download, follow }: RecordLink): Record<string, string> {
  const base = { href, 'aria-label': label, title: title ?? label };
  switch (kind) {
    case 'page':
      return base;
    case 'download':
      return { ...base, download: download ?? '' };
    case 'open':
      return { ...base, target: '_blank', rel: 'noopener noreferrer' };
    case 'external':
      return { ...base, target: '_blank', rel: follow ? 'noopener noreferrer' : 'noopener noreferrer nofollow' };
  }
}

export const recordColumnCount = (columns: RecordColumn[]): number => columns.length + 1;
