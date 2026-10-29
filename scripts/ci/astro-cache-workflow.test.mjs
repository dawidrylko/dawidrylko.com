import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Astro invalidates the content data store when astro.config.mjs changes, not
// when a remark or rehype plugin under src/lib does. A store restored through
// restore-keys would then ship `.md` posts rendered by the previous plugin, so
// every workflow that restores node_modules/.astro drops the store before it
// builds. The rest of the cache (processed images) stays.
const WORKFLOWS = ['ci.yml', 'cd.yml'];
const DROP_STORE = 'rm -f node_modules/.astro/data-store.json';

const read = file => readFileSync(new URL(`../../.github/workflows/${file}`, import.meta.url), 'utf8');

describe.each(WORKFLOWS)('Astro build cache in %s', file => {
  const workflow = read(file);

  it('drops the content data store after restoring the cache and before building', () => {
    const restore = workflow.indexOf('node_modules/.astro');
    const drop = workflow.indexOf(DROP_STORE);
    const build = workflow.search(/run: pnpm (run )?build/);
    expect(restore).toBeGreaterThan(-1);
    expect(build).toBeGreaterThan(-1);
    expect(drop).toBeGreaterThan(restore);
    expect(drop).toBeLessThan(build);
  });
});
