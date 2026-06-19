// Test stub for the `astro:content` virtual module. `getBlogPosts` (src/lib/blog)
// reads its collection through `getCollection`; tests seed the returned entries
// via `__setEntries` before exercising the helper.
export interface MockPost {
  id: string;
  data: { date: Date; [key: string]: unknown };
}

let entries: MockPost[] = [];

export function __setEntries(next: MockPost[]): void {
  entries = next;
}

export async function getCollection(): Promise<MockPost[]> {
  return entries;
}
