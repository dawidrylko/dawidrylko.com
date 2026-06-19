// Renders a small, safe subset of inline Markdown used in post descriptions on
// the blog listing: code spans, bold, italic and links. Input is author-written
// frontmatter; everything is HTML-escaped first, so the output is safe to inject
// with set:html / innerHTML.
const MARKER = '\u0000';

export function inlineMarkdown(input: string): string {
  const escape = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // Pull code spans out first so their contents are never reinterpreted as bold,
  // italic or link syntax. Placeholders use NUL markers that survive escaping and
  // never collide with real text.
  const codeSpans: string[] = [];
  let text = input.replace(/`([^`]+)`/g, (_, code: string) => {
    codeSpans.push(`<code>${escape(code)}</code>`);
    return `${MARKER}${codeSpans.length - 1}${MARKER}`;
  });

  text = escape(text);

  // Links: [label](url)
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, url: string) => `<a href="${url}">${label}</a>`);

  // Bold before italic so **…** is not consumed by the single-asterisk rule.
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  text = text.replace(/(?<!\w)_([^_]+)_(?!\w)/g, '<em>$1</em>');

  const restore = new RegExp(`${MARKER}(\\d+)${MARKER}`, 'g');
  return text.replace(restore, (_, i: string) => codeSpans[Number(i)]);
}
