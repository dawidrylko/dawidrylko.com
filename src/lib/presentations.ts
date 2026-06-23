// Pure helpers behind the /files presentations table. The file-system read stays
// in the page (files.astro); everything testable lives here.

export type ParsedFileName = { topic: string; order: number; title: string; language: string };

// Presentation files follow `topic_order_title_language` (e.g. `js_01_node_pl`).
// Returns null for anything that does not match so the page can skip it.
export const parseFileName = (fileName: string): ParsedFileName | null => {
  const parts = fileName.split('_');
  if (parts.length < 4) {
    return null;
  }
  const [topic, orderRaw] = parts;
  const languageRaw = parts[parts.length - 1];
  if (topic === undefined || orderRaw === undefined || languageRaw === undefined) {
    return null;
  }
  return {
    topic,
    order: parseInt(orderRaw, 10),
    title: parts.slice(2, -1).join('_'),
    language: languageRaw.toUpperCase(),
  };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export type PresentationMeta = {
  title: string;
  subject: string;
  keywords: string;
  description: string;
  relatedArticle: string;
};

// Split a single CSV row into fields, honouring double-quoted fields that may
// contain commas. A doubled quote ("") inside a quoted field is a literal quote.
const parseCsvRow = (row: string): string[] => {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (inQuotes) {
      if (char === '"' && row[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
};

// Parse the presentations `metadata.csv` (the single source of truth for PDF
// document metadata, enforced by the pre-commit validator) into a
// filename → metadata map. Reusing it here gives the public table descriptive
// titles, subjects and keywords instead of terse filename fragments. The header
// row (`filename,title,subject,keywords`) is skipped.
export const parsePresentationMetadata = (csv: string): Map<string, PresentationMeta> => {
  const map = new Map<string, PresentationMeta>();
  const lines = csv.split(/\r?\n/).filter(line => line.trim() !== '');
  for (const line of lines.slice(1)) {
    const [filename, title, subject, keywords, description, relatedArticle] = parseCsvRow(line);
    if (!filename) {
      continue;
    }
    map.set(filename, {
      title: title ?? '',
      subject: subject ?? '',
      keywords: keywords ?? '',
      description: description ?? '',
      relatedArticle: relatedArticle ?? '',
    });
  }
  return map;
};
