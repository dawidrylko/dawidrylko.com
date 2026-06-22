// Single source of truth for the six areas of work shown across the site.
// Pages (home, about, contact) each supply their own framing for these areas,
// so the set stays consistent everywhere without duplicating descriptive copy.
export const CAPABILITY_AREAS = [
  'Web platforms',
  'Mobile apps',
  'Architecture & infrastructure',
  'AI integration',
  'Cybersecurity',
  'Technical leadership',
] as const;

export type CapabilityArea = (typeof CAPABILITY_AREAS)[number];

// Helper to keep a page's per-area copy in the shared order and guarantee — via
// the Record type — that every area is described and none drift out of sync.
export function buildCapabilities(descriptions: Record<CapabilityArea, string>): {
  term: CapabilityArea;
  description: string;
}[] {
  return CAPABILITY_AREAS.map(term => ({ term, description: descriptions[term] }));
}
