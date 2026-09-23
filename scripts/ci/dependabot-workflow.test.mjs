import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const WORKFLOW = readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8');

const job = name => {
  const lines = WORKFLOW.split('\n');
  const start = lines.indexOf(`  ${name}:`);
  if (start === -1) throw new Error(`job ${name} not found in ci.yml`);
  const end = lines.findIndex((line, i) => i > start && /^ {2}[a-z][\w-]*:$/.test(line));
  return lines.slice(start, end === -1 ? undefined : end).join('\n');
};

describe('Dependabot jobs in ci.yml', () => {
  it('runs the autofix only on minor and patch updates, which merge on their own', () => {
    const autofix = job('autofix');
    expect(autofix).toMatch(/needs: metadata\n/);
    expect(autofix).toContain(
      `contains(fromJSON('["version-update:semver-minor", "version-update:semver-patch"]'), needs.metadata.outputs.update-type)`,
    );
  });

  it('decides the merge on the same update type the autofix saw', () => {
    const merge = job('dependabot');
    expect(merge).toMatch(/- metadata\n/);
    expect(merge).toContain('UPDATE_TYPE: ${{ needs.metadata.outputs.update-type }}');
    expect(merge).not.toContain('steps.metadata');
  });

  it('reads the metadata only on Dependabot pull requests', () => {
    expect(job('metadata')).toContain("if: github.event.pull_request.user.login == 'dependabot[bot]'");
  });
});
