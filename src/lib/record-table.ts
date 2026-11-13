export const RECORD_DETAILS_LABEL = 'Details';
export const RECORD_LINKS_LABEL = 'Links';
export const RECORD_NO_LINKS = '—';

export const LINK_ICONS = {
  page: '→',
  external: '🔗',
  open: '↗️',
  pdf: '📄',
  archive: '📦',
  keynote: '🎨',
  slides: '📊',
  file: '📎',
} as const;

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
  icon: string;
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
