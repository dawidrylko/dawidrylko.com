#!/usr/bin/env node
/**
 * Builds the CV PDFs from the LaTeX sources in `resume/` into `static/`.
 *
 * The PDFs are build output, not source: they are gitignored and regenerated
 * from `resume/*.tex` on every `pnpm build`. Astro's `publicDir` is `static/`,
 * so writing there before `astro build` is what publishes them at their long
 * standing URLs (`/resume-pl.pdf`, `/resume-en.pdf`) that `src/pages/bio.astro`
 * links to.
 *
 * Tectonic is the only engine, delivered one of two ways (first one wins):
 *
 *   - `tectonic`: a local install. What CI does, via a pinned release.
 *   - `docker`: the same Tectonic, in the image built from resume/Dockerfile,
 *     for machines without a local install.
 *
 * Engines are deliberately NOT interchangeable here. xelatex from TeX Live
 * 2026 lays the \cventry skills line on top of the preceding bullets, which
 * Tectonic renders correctly, so allowing a second engine would make the
 * published CV depend on who built it. A local xelatex is therefore not a
 * candidate, and neither is pdflatex, which cannot build this document at all
 * (`fontspec` loads the bundled Roboto TTFs by path, which needs XeTeX).
 *
 * Usage:
 *   node scripts/resume/build-resume.mjs                        # build if stale
 *   node scripts/resume/build-resume.mjs --force                # always rebuild
 *   node scripts/resume/build-resume.mjs --allow-missing-engine # warn, exit 0
 *
 * Exits non-zero when a variant fails to compile, so a broken CV cannot reach
 * a deploy. The exception is `--allow-missing-engine`, which `pnpm dev` uses so a
 * contributor without a TeX toolchain can still run the site locally.
 */

import { spawnSync } from 'node:child_process';
import { mkdir, copyFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');
const RESUME_DIR = join(REPO_ROOT, 'resume');
const OUTPUT_DIR = join(REPO_ROOT, 'static');
const WORK_DIR = join(REPO_ROOT, 'node_modules/.cache/resume');
/** Tectonic's package bundle, mounted into the container so it survives runs. */
const TECTONIC_CACHE_DIR = join(REPO_ROOT, 'node_modules/.cache/tectonic');

/** Built on demand from resume/Dockerfile; the tag only has to be stable. */
const DOCKER_IMAGE = process.env.RESUME_DOCKER_IMAGE ?? 'dawidrylko-com/resume-builder';

/** `<variant>.tex` in resume/ becomes `resume-<variant>.pdf` in static/. */
export const VARIANTS = ['pl', 'en'];

export function parseArgs(argv) {
  return {
    force: argv.includes('--force'),
    allowMissingEngine: argv.includes('--allow-missing-engine'),
  };
}

/**
 * Every file a variant's PDF depends on: its own entry point and sections,
 * plus the class and fonts shared by all variants.
 */
export function inputPatternsFor(variant) {
  return [`${variant}.tex`, `${variant}/`, 'awesome-cv.cls', 'fonts/'];
}

/**
 * A PDF is stale when it is missing or older than any of its inputs. A `null`
 * input mtime means that input has gone missing, which also counts as stale:
 * the alternative is keeping a PDF built from sources that no longer exist and
 * reporting success, where rebuilding makes the engine name the missing file.
 */
export function isStale(outputMtimeMs, inputMtimesMs) {
  if (outputMtimeMs === null) return true;
  return inputMtimesMs.some(inputMtime => inputMtime === null || inputMtime > outputMtimeMs);
}

/**
 * The engine invocation for a variant. `cwd` is always the resume directory:
 * the sources use relative paths (`\input{pl/summary.tex}`, `\fontdir[fonts/]`)
 * that only resolve from there.
 */
export function buildEngineCommand(
  engine,
  { variant, workDir, resumeDir, cacheDir = TECTONIC_CACHE_DIR, dockerImage = DOCKER_IMAGE, uid, gid },
) {
  const texFile = `${variant}.tex`;
  const compile = ['-X', 'compile', texFile, '--outdir'];

  if (engine === 'tectonic') {
    return [{ command: 'tectonic', args: [...compile, workDir] }];
  }

  if (engine === 'docker') {
    return [
      // Layer-cached, so this is a no-op once built and re-runs only when the
      // Dockerfile changes. Cheaper than inspecting for the image ourselves.
      { command: 'docker', args: ['build', '--quiet', '--tag', dockerImage, resumeDir] },
      {
        command: 'docker',
        args: [
          'run',
          '--rm',
          // Without this the PDFs land root-owned on Linux hosts.
          '--user',
          `${uid}:${gid}`,
          '--volume',
          `${resumeDir}:/work:ro`,
          '--volume',
          `${workDir}:/out`,
          '--volume',
          `${cacheDir}:/cache`,
          '--workdir',
          '/work',
          dockerImage,
          ...compile,
          '/out',
        ],
      },
    ];
  }

  throw new Error(`unknown engine: ${engine}`);
}

function hasBinary(name) {
  return spawnSync('command', ['-v', name], { shell: true, stdio: 'ignore' }).status === 0;
}

function hasWorkingDocker() {
  return hasBinary('docker') && spawnSync('docker', ['info'], { stdio: 'ignore' }).status === 0;
}

/**
 * Resolves the engine, honouring RESUME_TEX_ENGINE as an explicit override so
 * a machine with several toolchains can pin one. Returns null when none is
 * available.
 */
export function resolveEngine({ env = process.env, binaryExists = hasBinary, dockerWorks = hasWorkingDocker } = {}) {
  const override = env.RESUME_TEX_ENGINE;
  if (override) return override;
  if (binaryExists('tectonic')) return 'tectonic';
  if (dockerWorks()) return 'docker';
  return null;
}

async function mtimeMs(path) {
  try {
    return (await stat(path)).mtimeMs;
  } catch {
    return null;
  }
}

/** Newest mtime under a path, walking directories recursively, or null if absent. */
async function newestMtimeMs(path) {
  const stats = await stat(path).catch(() => null);
  if (!stats) return null;
  if (!stats.isDirectory()) return stats.mtimeMs;

  const entries = await readdir(path, { withFileTypes: true });
  const times = await Promise.all(entries.map(entry => newestMtimeMs(join(path, entry.name))));
  return Math.max(stats.mtimeMs, ...times.filter(time => time !== null));
}

async function isVariantStale(variant) {
  const outputMtime = await mtimeMs(join(OUTPUT_DIR, `resume-${variant}.pdf`));
  const inputMtimes = await Promise.all(
    inputPatternsFor(variant).map(pattern => newestMtimeMs(join(RESUME_DIR, pattern))),
  );
  return isStale(outputMtime, inputMtimes);
}

function runStep({ command, args }) {
  const result = spawnSync(command, args, { cwd: RESUME_DIR, encoding: 'utf8' });
  if (result.error) {
    return { ok: false, output: result.error.message };
  }
  return { ok: result.status === 0, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

async function buildVariant(variant, engine) {
  const options = {
    variant,
    workDir: WORK_DIR,
    resumeDir: RESUME_DIR,
    uid: process.getuid?.(),
    gid: process.getgid?.(),
  };
  for (const step of buildEngineCommand(engine, options)) {
    const { ok, output } = runStep(step);
    if (!ok) {
      process.stderr.write(`${output}\n`);
      throw new Error(`${engine} failed to compile resume/${variant}.tex`);
    }
  }

  const produced = join(WORK_DIR, `${variant}.pdf`);
  if ((await mtimeMs(produced)) === null) {
    throw new Error(`${engine} reported success but produced no ${variant}.pdf`);
  }

  const destination = join(OUTPUT_DIR, `resume-${variant}.pdf`);
  await copyFile(produced, destination);
  const { size } = await stat(destination);
  console.log(`resume: built static/resume-${variant}.pdf (${(size / 1024).toFixed(1)} KiB, ${engine})`);
}

async function main() {
  const { force, allowMissingEngine } = parseArgs(process.argv.slice(2));

  const stale = [];
  for (const variant of VARIANTS) {
    if (force || (await isVariantStale(variant))) stale.push(variant);
  }

  if (stale.length === 0) {
    console.log('resume: PDFs are up to date');
    return;
  }

  const engine = resolveEngine();
  if (!engine) {
    const message = 'no Tectonic found. Install it (brew install tectonic) or start Docker to use resume/Dockerfile';
    if (allowMissingEngine) {
      console.warn(`resume: ${message}; skipping (CV links will 404 locally)`);
      return;
    }
    throw new Error(message);
  }

  await mkdir(WORK_DIR, { recursive: true });
  await mkdir(TECTONIC_CACHE_DIR, { recursive: true });
  for (const variant of stale) {
    await buildVariant(variant, engine);
  }
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  main().catch(error => {
    console.error(`resume: ${error.message}`);
    process.exit(1);
  });
}
