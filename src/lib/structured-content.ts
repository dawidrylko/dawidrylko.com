// Builders for opt-in semantic structured data (schema.org FAQPage / HowTo)
// used by the Faq.astro and HowTo.astro MDX components. Construction lives here
// as pure functions so it is unit-testable; the .astro files are thin wrappers
// that render the visible markup and emit the JSON-LD these return.

export interface FaqItem {
  question: string;
  answer: string;
}

export interface HowToStepInput {
  name?: string;
  text: string;
}

export interface HowToInput {
  name: string;
  totalTime?: string;
  steps: HowToStepInput[];
}

// Reduces the inline-Markdown subset (code, bold, italic, links, images) to
// plain text for JSON-LD text fields, which must not carry Markdown syntax.
// Mirrors the stripping in excerpt.ts but without truncation.
export function stripInlineMarkdown(input: string): string {
  return input
    .replace(/`([^`]*)`/g, '$1') // inline code → contents
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images → drop
    .replace(/\[([^\]]*)\]\([^)\s]*\)/g, '$1') // links → label
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1') // italic *
    .replace(/(?<!\w)_([^_]+)_(?!\w)/g, '$1') // italic _
    .replace(/\s+/g, ' ')
    .trim();
}

// schema.org FAQPage: a list of Question nodes, each with a single
// acceptedAnswer. Answer text is plain (Markdown stripped) per Google's
// guidance that the JSON-LD mirror the on-page answer as text.
export function buildFaqJsonLd(items: FaqItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: stripInlineMarkdown(item.question),
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripInlineMarkdown(item.answer),
      },
    })),
  };
}

// schema.org HowTo: an ordered list of HowToStep nodes. `position` is 1-based
// so crawlers preserve order; `totalTime` is passed through only when provided
// (callers supply an ISO-8601 duration such as "PT15M").
export function buildHowToJsonLd(input: HowToInput): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: stripInlineMarkdown(input.name),
    ...(input.totalTime ? { totalTime: input.totalTime } : {}),
    step: input.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      ...(step.name ? { name: stripInlineMarkdown(step.name) } : {}),
      text: stripInlineMarkdown(step.text),
    })),
  };
}
