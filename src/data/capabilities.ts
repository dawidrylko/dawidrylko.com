// Single source of truth for the six areas of work shown across the site.
// Ordered so the two areas author.jobTitle positions on ("Solution Architect |
// Cybersecurity") come first. Pages (home, about, contact) each supply their own
// framing for these areas, so the set stays consistent everywhere without
// duplicating descriptive copy.
export const CAPABILITY_AREAS = [
  'System architecture',
  'Cybersecurity',
  'Full-stack engineering',
  'Infrastructure and delivery',
  'AI agents and automation',
  'Engineering leadership',
] as const;

export type CapabilityArea = (typeof CAPABILITY_AREAS)[number];

// Helper to keep a page's per-area copy in the shared order and guarantee (via
// the Record type) that every area is described and none drift out of sync.
export function buildCapabilities(descriptions: Record<CapabilityArea, string>): {
  term: CapabilityArea;
  description: string;
}[] {
  return CAPABILITY_AREAS.map(term => ({ term, description: descriptions[term] }));
}
