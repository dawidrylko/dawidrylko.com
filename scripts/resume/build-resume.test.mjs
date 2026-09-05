import { describe, expect, it } from 'vitest';
import { VARIANTS, parseArgs, inputPatternsFor, isStale, buildEngineCommand, resolveEngine } from './build-resume.mjs';

describe('parseArgs', () => {
  it('defaults to an incremental, strict build', () => {
    expect(parseArgs([])).toEqual({ force: false, allowMissingEngine: false });
  });

  it('reads both flags', () => {
    expect(parseArgs(['--force', '--allow-missing-engine'])).toEqual({ force: true, allowMissingEngine: true });
  });

  it('ignores unrelated arguments', () => {
    expect(parseArgs(['--verbose'])).toEqual({ force: false, allowMissingEngine: false });
  });
});

describe('inputPatternsFor', () => {
  it('covers the variant sources plus the shared class and fonts', () => {
    expect(inputPatternsFor('pl')).toEqual(['pl.tex', 'pl/', 'awesome-cv.cls', 'fonts/']);
  });

  it('scopes the per-language sections to the variant', () => {
    expect(inputPatternsFor('en')).toContain('en/');
    expect(inputPatternsFor('en')).not.toContain('pl/');
  });
});

describe('isStale', () => {
  it('treats a missing PDF as stale', () => {
    expect(isStale(null, [10])).toBe(true);
  });

  it('is stale when any input is newer than the PDF', () => {
    expect(isStale(100, [10, 150, 20])).toBe(true);
  });

  it('is fresh when the PDF is newer than every input', () => {
    expect(isStale(200, [10, 150, 20])).toBe(false);
  });

  it('is fresh when an input shares the PDF timestamp exactly', () => {
    expect(isStale(100, [100])).toBe(false);
  });

  it('is stale when an input has gone missing, even next to a newer PDF', () => {
    expect(isStale(999, [null, 10])).toBe(true);
  });
});

describe('buildEngineCommand', () => {
  const options = {
    variant: 'pl',
    workDir: '/repo/node_modules/.cache/resume',
    resumeDir: '/repo/resume',
    cacheDir: '/repo/node_modules/.cache/tectonic',
    dockerImage: 'dawidrylko-com/resume-builder',
    uid: 501,
    gid: 20,
  };

  it('compiles in a single tectonic pass into the work directory', () => {
    expect(buildEngineCommand('tectonic', options)).toEqual([
      { command: 'tectonic', args: ['-X', 'compile', 'pl.tex', '--outdir', '/repo/node_modules/.cache/resume'] },
    ]);
  });

  it('builds the image before running it', () => {
    const [build, run] = buildEngineCommand('docker', options);
    expect(build).toEqual({
      command: 'docker',
      args: ['build', '--quiet', '--tag', 'dawidrylko-com/resume-builder', '/repo/resume'],
    });
    expect(run.args[0]).toBe('run');
  });

  it('mounts sources read-only, plus the work and Tectonic cache directories', () => {
    const [, run] = buildEngineCommand('docker', options);
    expect(run.args).toContain('/repo/resume:/work:ro');
    expect(run.args).toContain('/repo/node_modules/.cache/resume:/out');
    expect(run.args).toContain('/repo/node_modules/.cache/tectonic:/cache');
  });

  it('runs the container as the caller so output is not root-owned', () => {
    const [, run] = buildEngineCommand('docker', options);
    expect(run.args).toContain('--user');
    expect(run.args).toContain('501:20');
  });

  it('runs the same tectonic compile in the container as on the host', () => {
    const [host] = buildEngineCommand('tectonic', options);
    const [, run] = buildEngineCommand('docker', options);
    expect(run.args.slice(-5)).toEqual(['-X', 'compile', 'pl.tex', '--outdir', '/out']);
    expect(host.args.slice(0, 4)).toEqual(run.args.slice(-5, -1));
  });

  it('never reaches for a second engine, which would render differently', () => {
    expect(() => buildEngineCommand('xelatex', options)).toThrow(/unknown engine: xelatex/);
    expect(() => buildEngineCommand('pdflatex', options)).toThrow(/unknown engine: pdflatex/);
  });

  it('builds the en variant from en.tex', () => {
    const [step] = buildEngineCommand('tectonic', { ...options, variant: 'en' });
    expect(step.args).toContain('en.tex');
  });
});

describe('resolveEngine', () => {
  const never = () => false;
  const always = () => true;

  it('prefers a local tectonic when it is installed', () => {
    expect(resolveEngine({ env: {}, binaryExists: name => name === 'tectonic', dockerWorks: always })).toBe('tectonic');
  });

  it('falls back to docker when tectonic is not on PATH', () => {
    expect(resolveEngine({ env: {}, binaryExists: never, dockerWorks: always })).toBe('docker');
  });

  it('ignores a local xelatex, which renders this document differently', () => {
    expect(resolveEngine({ env: {}, binaryExists: name => name === 'xelatex', dockerWorks: never })).toBeNull();
  });

  it('returns null when nothing can build', () => {
    expect(resolveEngine({ env: {}, binaryExists: never, dockerWorks: never })).toBeNull();
  });

  it('honours an explicit RESUME_TEX_ENGINE override', () => {
    const env = { RESUME_TEX_ENGINE: 'docker' };
    expect(resolveEngine({ env, binaryExists: always, dockerWorks: always })).toBe('docker');
  });
});

describe('VARIANTS', () => {
  it('matches the PDFs bio.astro links to', () => {
    expect(VARIANTS).toEqual(['pl', 'en']);
  });
});
