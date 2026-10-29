import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Astro invalidates the content data store when the config, the content schema
// or its own version changes, not when a remark or rehype plugin under src/lib
// does. A store restored through restore-keys would then ship `.md` posts
// rendered by the previous plugin, so every job that restores
// node_modules/.astro drops the store before it builds. The rest of the cache
// (processed images) stays.
const WORKFLOWS = ['ci.yml', 'cd.yml'];
const RESTORE = /^\s+node_modules\/\.astro\s*$/;
const DROP = /^\s+run:\s+rm -f node_modules\/\.astro\/data-store\.json\s*$/;
const BUILD = /^\s+run:\s+pnpm (run )?build\s*$/;

const read = file => readFileSync(new URL(`../../.github/workflows/${file}`, import.meta.url), 'utf8');

// Jobs keyed by name, comment lines removed so a commented-out step never counts.
const jobs = workflow => {
  const lines = workflow.split('\n').filter(line => !/^\s*#/.test(line));
  const start = lines.indexOf('jobs:');
  const result = {};
  let current;
  for (const line of lines.slice(start + 1)) {
    const header = /^ {2}([\w-]+):\s*$/.exec(line);
    if (header) result[(current = header[1])] = [];
    else if (current) result[current].push(line);
  }
  return result;
};

const lineOf = (lines, pattern) => lines.findIndex(line => pattern.test(line));

describe.each(WORKFLOWS)('Astro build cache in %s', file => {
  const workflowJobs = Object.entries(jobs(read(file)));
  const caching = workflowJobs.filter(([, lines]) => lineOf(lines, RESTORE) !== -1 || lineOf(lines, BUILD) !== -1);

  it('has at least one job that restores the cache and builds', () => {
    expect(caching.length).toBeGreaterThan(0);
  });

  it.each(caching)('job %s drops the content data store after restoring the cache and before building', (_, lines) => {
    const restore = lineOf(lines, RESTORE);
    const drop = lineOf(lines, DROP);
    const build = lineOf(lines, BUILD);
    expect(restore).toBeGreaterThan(-1);
    expect(build).toBeGreaterThan(-1);
    expect(drop).toBeGreaterThan(restore);
    expect(drop).toBeLessThan(build);
  });
});

describe('jobs()', () => {
  it('skips commented-out steps', () => {
    const workflow = ['jobs:', '  build:', '    steps:', '      # run: rm -f x', '      - run: echo'].join('\n');
    expect(jobs(workflow)).toEqual({ build: ['    steps:', '      - run: echo'] });
  });
});
